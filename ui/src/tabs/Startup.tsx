import React, { useState, useEffect } from 'react';
import {
  Rocket,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { invokeCommand } from '../tauri';
import type { StartupItem } from '../types';

export const StartupTab: React.FC = () => {
  const [items, setItems] = useState<StartupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await invokeCommand<StartupItem[]>('get_startup_items');
      setItems(res);
    } catch (err) {
      console.error('Failed to load startup items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (item: StartupItem) => {
    if (!confirm(`Are you sure you want to disable/remove "${item.name}" from startup?`)) {
      return;
    }

    setDeletingName(item.name);
    setMessage(null);
    try {
      await invokeCommand<boolean>('delete_startup_item', {
        name: item.name,
        registryPath: item.registry_path,
      });
      setMessage({ type: 'success', text: `Disabled "${item.name}" from starting on boot` });
      fetchItems();
    } catch (err: unknown) {
      setMessage({ type: 'error', text: `Failed: ${String(err)}` });
    } finally {
      setDeletingName(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-white">Startup Program Optimizer</h2>
          </div>
          <p className="text-xs text-slate-400">
            Control which applications automatically launch with Windows to maximize boot speed
          </p>
        </div>

        <button
          onClick={fetchItems}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Startup Apps</span>
            <div className="text-2xl font-black text-white font-mono">{items.length}</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Valid Binaries</span>
            <div className="text-2xl font-black text-white font-mono">
              {items.filter((i) => i.file_exists).length}
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Boot Impact Score</span>
            <div className="text-2xl font-black text-white font-mono">
              {items.length > 8 ? 'High' : items.length > 4 ? 'Moderate' : 'Fast'}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Startup Entries</span>
          <span className="text-xs text-slate-500 font-mono">{items.length} found</span>
        </div>

        <div className="divide-y divide-slate-800/40">
          {items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No startup programs found in Windows registry or startup folders.
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{item.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium border border-indigo-500/20">
                      {item.location}
                    </span>
                    {!item.file_exists && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" /> Missing Executable
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-slate-400 break-all bg-slate-950/40 px-2.5 py-1 rounded border border-slate-800/60">
                    {item.command}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingName === item.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disable</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};