import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Rocket,
  Trash2,
  HardDrive,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { TabId } from '../types';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  cpuUsage: number;
  ramUsage: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  cpuUsage,
  ramUsage,
}) => {
  const navItems = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'processes' as TabId, label: 'Processes', icon: Cpu, badge: `${Math.round(cpuUsage)}%` },
    { id: 'startup' as TabId, label: 'Startup Apps', icon: Rocket, badge: null },
    { id: 'cleanup' as TabId, label: 'Disk Cleaner', icon: Trash2, badge: 'Clean' },
    { id: 'monitor' as TabId, label: 'Live Monitor', icon: Activity, badge: 'Live' },
    { id: 'sysinfo' as TabId, label: 'System Specs', icon: HardDrive, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#090e1a]/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none z-20 backdrop-blur-xl">
      {/* App Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090e1a] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">PC</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Performance Toolkit</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.badge === 'Live'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                        : isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Mini Status */}
      <div className="p-4 m-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            System Status
          </span>
          <span className="font-mono text-emerald-400 font-semibold">OPTIMAL</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>CPU</span>
            <span className="font-mono font-medium text-slate-200">{Math.round(cpuUsage)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                cpuUsage > 80 ? 'bg-rose-500' : cpuUsage > 50 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, cpuUsage))}%` }}
            />
          </div>

          <div className="flex justify-between text-slate-400 pt-1">
            <span>RAM</span>
            <span className="font-mono font-medium text-slate-200">{Math.round(ramUsage)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                ramUsage > 85 ? 'bg-rose-500' : ramUsage > 70 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, ramUsage))}%` }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Source</span>
          </div>
          <a
            href="https://github.com/ahmedalwaraqi"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            @ahmedalwaraqi
          </a>
        </div>
      </div>
    </aside>
  );
};