import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { invokeCommand } from '../tauri';
import type { ProcessItem, ProcessDetails } from '../types';

interface ProcessesTabProps {
  processes: ProcessItem[];
  loading: boolean;
  onRefresh: () => void;
}

export const ProcessesTab: React.FC<ProcessesTabProps> = ({
  processes,
  loading,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name' | 'pid'>('cpu');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessDetails | null>(null);
  const [killingPid, setKillingPid] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleKillProcess = async (pid: number, name: string) => {
    if (!confirm(`Are you sure you want to end process "${name}" (PID: ${pid})?`)) {
      return;
    }

    setKillingPid(pid);
    setMessage(null);
    try {
      await invokeCommand<boolean>('kill_process', { pid });
      setMessage({ type: 'success', text: `Terminated ${name} (PID ${pid})` });
      if (selectedProcess?.pid === pid) {
        setSelectedProcess(null);
      }
      onRefresh();
    } catch (err: unknown) {
      setMessage({ type: 'error', text: `Failed to terminate: ${String(err)}` });
    } finally {
      setKillingPid(null);
    }
  };

  const handleInspectProcess = async (pid: number) => {
    try {
      const details = await invokeCommand<ProcessDetails>('get_process_details', { pid });
      setSelectedProcess(details);
    } catch (err) {
      console.error('Failed to get process details:', err);
    }
  };

  const filtered = useMemo(() => {
    return processes
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.pid.toString().includes(searchTerm) ||
          p.exe_path.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'cpu') cmp = a.cpu_usage - b.cpu_usage;
        else if (sortBy === 'memory') cmp = a.memory_bytes - b.memory_bytes;
        else if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'pid') cmp = a.pid - b.pid;
        return sortAsc ? cmp : -cmp;
      });
  }, [processes, searchTerm, sortBy, sortAsc]);

  const toggleSort = (type: 'cpu' | 'memory' | 'name' | 'pid') => {
    if (sortBy === type) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(type);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Process Inspector</h2>
          <p className="text-xs text-slate-400">
            {processes.length} Active System Tasks & Services
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or PID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh process list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="flex-1 glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
            <div
              className="col-span-5 cursor-pointer hover:text-white flex items-center gap-1"
              onClick={() => toggleSort('name')}
            >
              <span>Process Name</span>
              {sortBy === 'name' && (sortAsc ? '↑' : '↓')}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-white flex items-center gap-1"
              onClick={() => toggleSort('pid')}
            >
              <span>PID</span>
              {sortBy === 'pid' && (sortAsc ? '↑' : '↓')}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-white flex items-center gap-1 text-right justify-end"
              onClick={() => toggleSort('cpu')}
            >
              <span>CPU %</span>
              {sortBy === 'cpu' && (sortAsc ? '↑' : '↓')}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-white flex items-center gap-1 text-right justify-end"
              onClick={() => toggleSort('memory')}
            >
              <span>Memory</span>
              {sortBy === 'memory' && (sortAsc ? '↑' : '↓')}
            </div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-xs">
                <AlertTriangle className="w-8 h-8 mb-2 text-slate-600" />
                <span>No matching processes found</span>
              </div>
            ) : (
              filtered.map((p) => {
                const isHighCpu = p.cpu_usage > 20;
                return (
                  <div
                    key={p.pid}
                    onClick={() => handleInspectProcess(p.pid)}
                    className={`grid grid-cols-12 px-5 py-2.5 items-center text-xs hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      selectedProcess?.pid === p.pid ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-2.5 truncate pr-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-[10px] font-mono font-bold text-cyan-400">
                        {p.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white truncate">{p.name}</span>
                    </div>

                    <div className="col-span-2 font-mono text-slate-400">{p.pid}</div>

                    <div className="col-span-2 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          isHighCpu ? 'text-rose-400' : p.cpu_usage > 5 ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {p.cpu_usage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="col-span-2 text-right font-mono text-slate-300 font-medium">
                      {formatBytes(p.memory_bytes)}
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKillProcess(p.pid, p.name);
                        }}
                        disabled={killingPid === p.pid}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Kill Process"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {selectedProcess && (
          <div className="w-80 glass-panel rounded-3xl border border-cyan-500/30 p-5 flex flex-col justify-between overflow-y-auto space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Process Details</span>
                  <h3 className="text-base font-black text-white truncate max-w-[200px]">
                    {selectedProcess.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProcess(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">PID</span>
                  <div className="font-mono text-white font-bold">{selectedProcess.pid}</div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Memory Usage</span>
                  <div className="font-mono text-cyan-300 font-bold">{formatBytes(selectedProcess.memory_bytes)}</div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Executable Path</span>
                  <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-950/60 p-2 rounded border border-slate-800">
                    {selectedProcess.exe_path || 'Protected System Process'}
                  </div>
                </div>

                {selectedProcess.cmd.length > 0 && (
                  <div className="p-3 bg-slate-900/80 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Command Line</span>
                    <div className="font-mono text-[11px] text-slate-300 break-all bg-slate-950/60 p-2 rounded border border-slate-800 max-h-28 overflow-y-auto">
                      {selectedProcess.cmd.join(' ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleKillProcess(selectedProcess.pid, selectedProcess.name)}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>End Process</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};