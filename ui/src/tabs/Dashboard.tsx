import React from 'react';
import {
  Cpu,
  Layers,
  HardDrive,
  Clock,
  Activity,
  Zap,
  Trash2,
  Rocket,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { StatusCard } from '../components/StatusCard';
import { ProgressBar } from '../components/ProgressBar';
import type { DashboardData, TabId } from '../types';

interface DashboardProps {
  data: DashboardData | null;
  loading: boolean;
  onNavigate: (tab: TabId) => void;
}

export const DashboardTab: React.FC<DashboardProps> = ({ data, loading, onNavigate }) => {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-spin">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="text-sm font-medium text-slate-400">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const formatUptime = (seconds: number): string => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto overflow-y-auto max-h-full">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-indigo-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white">{data.hostname}</h2>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Healthy
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {data.os_name} • {data.cpu_brand}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('cleanup')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clean Junk Files</span>
          </button>
          <button
            onClick={() => onNavigate('startup')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 transition-all hover:scale-105 active:scale-95"
          >
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span>Optimize Boot</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatusCard
          title="CPU Usage"
          value={`${data.cpu_usage.toFixed(1)}%`}
          subtitle={`${data.cpu_count} Logical Cores`}
          trend={`${data.cpu_frequency_mhz} MHz`}
          percent={data.cpu_usage}
          icon={Cpu}
          color={data.cpu_usage > 75 ? 'rose' : data.cpu_usage > 45 ? 'amber' : 'cyan'}
        />

        <StatusCard
          title="RAM Memory"
          value={formatBytes(data.ram_used_bytes)}
          subtitle={`Total: ${formatBytes(data.ram_total_bytes)}`}
          percent={data.ram_usage_percent}
          icon={Layers}
          color={data.ram_usage_percent > 80 ? 'rose' : data.ram_usage_percent > 60 ? 'amber' : 'indigo'}
        />

        <StatusCard
          title="System Uptime"
          value={formatUptime(data.uptime_seconds)}
          subtitle="Continuous Run Time"
          trend="No Restarts"
          icon={Clock}
          color="emerald"
        />

        <StatusCard
          title="Active Tasks"
          value={data.process_count}
          subtitle="Running Processes"
          trend="Protected"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Per-Core CPU Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Core Utilization</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{data.cpu_cores.length} Cores Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.cpu_cores.map((usage, idx) => {
            const isHigh = usage > 75;
            const isMid = usage > 40;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-slate-400">Core {idx}</span>
                  <span
                    className={`font-mono font-bold ${
                      isHigh ? 'text-rose-400' : isMid ? 'text-amber-400' : 'text-cyan-400'
                    }`}
                  >
                    {Math.round(usage)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isHigh ? 'bg-rose-500' : isMid ? 'bg-amber-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, usage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Drives Row */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Storage Drives</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{data.disks.length} Volume(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.disks.map((disk, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono">
                    {disk.mount_point}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{disk.name || `Local Disk (${disk.mount_point})`}</h4>
                    <p className="text-xs text-slate-400">{disk.file_system} Format</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-300 font-semibold">
                  {formatBytes(disk.available_bytes)} free
                </span>
              </div>

              <ProgressBar
                value={disk.used_bytes}
                max={disk.total_bytes}
                label="Disk Storage"
                sublabel={`${formatBytes(disk.used_bytes)} / ${formatBytes(disk.total_bytes)} (${Math.round(
                  disk.usage_percent
                )}%)`}
                color={disk.usage_percent > 85 ? 'rose' : disk.usage_percent > 70 ? 'amber' : 'indigo'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};