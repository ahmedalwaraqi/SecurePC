import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Layers, ArrowDown, ArrowUp } from 'lucide-react';
import { RealtimeChart } from '../components/Chart';
import { invokeCommand } from '../tauri';
import type { LiveTelemetry } from '../types';

export const MonitorTab: React.FC = () => {
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(0));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(30).fill(0));
  const [rxHistory, setRxHistory] = useState<number[]>(Array(30).fill(0));
  const [txHistory, setTxHistory] = useState<number[]>(Array(30).fill(0));
  const [current, setCurrent] = useState<LiveTelemetry | null>(null);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const data = await invokeCommand<LiveTelemetry>('get_live_telemetry');
        if (!mounted) return;
        setCurrent(data);

        setCpuHistory((prev) => [...prev.slice(1), data.cpu_usage]);
        setRamHistory((prev) => [...prev.slice(1), data.ram_usage_percent]);
        setRxHistory((prev) => [...prev.slice(1), data.network_rx_bytes_sec / (1024 * 1024)]);
        setTxHistory((prev) => [...prev.slice(1), data.network_tx_bytes_sec / (1024 * 1024)]);
      } catch (err) {
        console.error('Failed to poll telemetry:', err);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatSpeed = (bytesSec: number): string => {
    if (bytesSec >= 1024 * 1024) {
      return `${(bytesSec / (1024 * 1024)).toFixed(2)} MB/s`;
    }
    if (bytesSec >= 1024) {
      return `${(bytesSec / 1024).toFixed(1)} KB/s`;
    }
    return `${bytesSec} B/s`;
  };

  const formatBytes = (bytes: number): string => {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-black text-white">Live Performance Telemetry</h2>
          </div>
          <p className="text-xs text-slate-400">
            High-frequency hardware telemetry updated every 1,000 ms with 30-second rolling history
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>STREAMING 1Hz</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Processor Utilization</span>
            </div>
            <span className="font-mono text-xs text-cyan-400 font-bold">
              {current ? `${current.cpu_usage.toFixed(1)}%` : '--'}
            </span>
          </div>
          <RealtimeChart
            data={cpuHistory}
            max={100}
            height={150}
            strokeColor="#38bdf8"
            fillColor="rgba(56, 189, 248, 0.15)"
            unit="%"
            label="Total CPU Load"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Memory Allocation</span>
            </div>
            <span className="font-mono text-xs text-indigo-400 font-bold">
              {current ? `${formatBytes(current.ram_used_bytes)} / ${formatBytes(current.ram_total_bytes)}` : '--'}
            </span>
          </div>
          <RealtimeChart
            data={ramHistory}
            max={100}
            height={150}
            strokeColor="#818cf8"
            fillColor="rgba(129, 140, 248, 0.15)"
            unit="%"
            label="RAM % In Use"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ArrowDown className="w-4 h-4 text-emerald-400" />
              <span>Network Download Rate</span>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              {current ? formatSpeed(current.network_rx_bytes_sec) : '--'}
            </span>
          </div>
          <RealtimeChart
            data={rxHistory}
            max={Math.max(10, ...rxHistory)}
            height={150}
            strokeColor="#34d399"
            fillColor="rgba(52, 211, 153, 0.15)"
            unit="MB/s"
            label="Incoming Bandwidth"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <ArrowUp className="w-4 h-4 text-amber-400" />
              <span>Network Upload Rate</span>
            </div>
            <span className="font-mono text-xs text-amber-400 font-bold">
              {current ? formatSpeed(current.network_tx_bytes_sec) : '--'}
            </span>
          </div>
          <RealtimeChart
            data={txHistory}
            max={Math.max(5, ...txHistory)}
            height={150}
            strokeColor="#fbbf24"
            fillColor="rgba(251, 191, 36, 0.15)"
            unit="MB/s"
            label="Outgoing Bandwidth"
          />
        </div>
      </div>
    </div>
  );
};