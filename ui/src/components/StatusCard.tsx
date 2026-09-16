import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  percent?: number;
  color?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
  trend?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  percent,
  color = 'cyan',
  trend,
}) => {
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)]',
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      bar: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.25)]',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(52,211,153,0.25)]',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(251,191,36,0.25)]',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      bar: 'bg-gradient-to-r from-rose-500 to-red-500',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)]',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border ${scheme.border} ${scheme.glow} transition-all duration-300 group flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl font-black text-white font-mono mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {percent !== undefined && (
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Utilization</span>
            <span className="font-semibold text-slate-200">{Math.round(percent)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${scheme.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && <span className="font-mono text-cyan-400 font-medium">{trend}</span>}
        </div>
      )}
    </div>
  );
};