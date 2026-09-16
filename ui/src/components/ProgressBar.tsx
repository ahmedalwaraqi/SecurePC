import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  color = 'cyan',
  size = 'md',
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorMap = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    indigo: 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_12px_rgba(52,211,153,0.4)]',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_rgba(251,191,36,0.4)]',
    rose: 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  };

  return (
    <div className="w-full space-y-1.5">
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-slate-300">{label}</span>}
          {sublabel && <span className="font-mono text-slate-400">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800 ${heightMap[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorMap[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};