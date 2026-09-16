import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RefreshCw,
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { invokeCommand } from '../tauri';
import type { CleanupCategory, CleanupResult } from '../types';

export const CleanupTab: React.FC = () => {
  const [categories, setCategories] = useState<CleanupCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);

  const scanJunk = async () => {
    setScanning(true);
    setResult(null);
    try {
      const res = await invokeCommand<CleanupCategory[]>('scan_cleanup_categories');
      setCategories(res);
      setSelectedIds(res.map((c) => c.id));
    } catch (err) {
      console.error('Failed to scan junk files:', err);
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    scanJunk();
  }, []);

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const totalSelectedBytes = categories
    .filter((c) => selectedIds.includes(c.id))
    .reduce((acc, c) => acc + c.size_bytes, 0);

  const totalSelectedFiles = categories
    .filter((c) => selectedIds.includes(c.id))
    .reduce((acc, c) => acc + c.file_count, 0);

  const handleClean = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to clean ${formatBytes(totalSelectedBytes)} of temporary files?`)) {
      return;
    }

    setCleaning(true);
    try {
      const res = await invokeCommand<CleanupResult>('clean_categories', {
        categoryIds: selectedIds,
      });
      setResult(res);
      scanJunk();
    } catch (err) {
      console.error('Failed to clean junk files:', err);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-white">Deep Disk & Cache Cleaner</h2>
          </div>
          <p className="text-xs text-slate-400">
            Safely recover gigabytes of storage by eliminating temporary caches and system junk
          </p>
        </div>

        <button
          onClick={scanJunk}
          disabled={scanning || cleaning}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Rescan System</span>
        </button>
      </div>

      {result && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300">Clean Completed Successfully</h4>
              <p className="text-xs text-slate-300">
                Freed <span className="font-bold text-white">{formatBytes(result.freed_bytes)}</span> across {result.deleted_files} files
              </p>
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-indigo-950/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Ready to Reclaim</span>
          <div className="text-3xl font-black text-white font-mono">{formatBytes(totalSelectedBytes)}</div>
          <p className="text-xs text-slate-400">{totalSelectedFiles.toLocaleString()} redundant items selected</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            {selectedIds.length === categories.length ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
            <span>{selectedIds.length === categories.length ? 'Deselect All' : 'Select All'}</span>
          </button>

          <button
            onClick={handleClean}
            disabled={cleaning || scanning || selectedIds.length === 0 || totalSelectedBytes === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
            <span>{cleaning ? 'Cleaning...' : 'Clean Selected Junk'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <div
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'glass-panel border-cyan-500/40 bg-cyan-950/10 shadow-[0_0_20px_-5px_rgba(56,189,248,0.15)]'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="text-cyan-400">
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-600" />}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                <span className="font-mono text-slate-400">{cat.file_count.toLocaleString()} files</span>
                <span className="font-mono font-bold text-white text-sm">{formatBytes(cat.size_bytes)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};