import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cpu,
  Layers,
  Wifi,
  Shield,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { invokeCommand } from '../tauri';
import type { SystemSpecReport } from '../types';

export const SystemInfoTab: React.FC = () => {
  const [specs, setSpecs] = useState<SystemSpecReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSpecs = async () => {
      setLoading(true);
      try {
        const res = await invokeCommand<SystemSpecReport>('get_system_specs');
        setSpecs(res);
      } catch (err) {
        console.error('Failed to get system specs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecs();
  }, []);

  const formatBytes = (bytes: number): string => {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleCopy = () => {
    if (!specs) return;
    const json = JSON.stringify(specs, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !specs) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Info className="w-8 h-8 text-cyan-400 animate-pulse" />
          <p className="text-xs text-slate-400">Inspecting hardware specifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-white">System & Hardware Information</h2>
          </div>
          <p className="text-xs text-slate-400">
            Comprehensive audit of processor architecture, motherboard BIOS, memory, and networking
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Specs' : 'Export Specs (JSON)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Operating System</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">OS Edition</span>
              <span className="font-semibold text-white">{specs.os_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Version / Build</span>
              <span className="font-mono text-slate-200">{specs.os_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Kernel Version</span>
              <span className="font-mono text-slate-200">{specs.kernel_version || 'NT 10.0'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Computer Name</span>
              <span className="font-mono text-cyan-400 font-bold">{specs.hostname}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Processor (CPU)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Model</span>
              <span className="font-semibold text-white truncate max-w-[240px]">{specs.cpu.brand}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Vendor ID</span>
              <span className="font-mono text-slate-200">{specs.cpu.vendor_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Cores / Threads</span>
              <span className="font-mono text-slate-200">
                {specs.cpu.physical_core_count ? `${specs.cpu.physical_core_count} Physical / ` : ''}
                {specs.cpu.core_count} Threads
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Base Clock</span>
              <span className="font-mono text-cyan-400 font-bold">{specs.cpu.frequency_mhz} MHz</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 pb-2 border-b border-slate-800">
            <HardDrive className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Motherboard & BIOS</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Motherboard</span>
              <span className="font-semibold text-white">{specs.motherboard_product}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Manufacturer</span>
              <span className="text-slate-200">{specs.motherboard_manufacturer}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">BIOS Vendor & Version</span>
              <span className="font-mono text-slate-200">{specs.bios_vendor} ({specs.bios_version})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">BIOS Date</span>
              <span className="font-mono text-slate-400">{specs.bios_release_date}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Memory & Graphics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Installed RAM</span>
              <span className="font-mono text-white font-bold">{formatBytes(specs.total_memory_bytes)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Pagefile / Swap</span>
              <span className="font-mono text-slate-200">{formatBytes(specs.total_swap_bytes)}</span>
            </div>
            <div className="py-1">
              <span className="text-slate-400 block mb-1">Graphics Devices (GPU)</span>
              {specs.gpus.length > 0 ? (
                specs.gpus.map((gpu, idx) => (
                  <div key={idx} className="font-semibold text-cyan-300 font-mono text-[11px] py-0.5">
                    • {gpu}
                  </div>
                ))
              ) : (
                <span className="text-slate-500">Standard Display Controller</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-slate-800">
          <Wifi className="w-4 h-4" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Network Adapters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specs.networks.map((net, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="font-bold text-white truncate">{net.name}</div>
              <div className="flex justify-between text-slate-400">
                <span>MAC Address</span>
                <span className="font-mono text-slate-200">{net.mac_address || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IP Addresses</span>
                <span className="font-mono text-cyan-400 truncate max-w-[200px]">
                  {net.ip_addresses.length > 0 ? net.ip_addresses.join(', ') : 'Disconnected'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};