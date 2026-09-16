import React, { useEffect, useRef } from 'react';

interface ChartProps {
  data: number[];
  max?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  unit?: string;
  label?: string;
}

export const RealtimeChart: React.FC<ChartProps> = ({
  data,
  max = 100,
  height = 120,
  strokeColor = '#38bdf8',
  fillColor = 'rgba(56, 189, 248, 0.15)',
  unit = '%',
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = height;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (data.length < 2) return;

    const step = w / (data.length - 1);

    // Draw fill gradient path
    ctx.beginPath();
    ctx.moveTo(0, h);

    data.forEach((val, i) => {
      const clamped = Math.min(max, Math.max(0, val));
      const x = i * step;
      const y = h - (clamped / max) * h;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        // smooth bezier
        const prevX = (i - 1) * step;
        const prevVal = Math.min(max, Math.max(0, data[i - 1]));
        const prevY = h - (prevVal / max) * h;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });

    ctx.lineTo(w, h);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, fillColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw stroke line
    ctx.beginPath();
    data.forEach((val, i) => {
      const clamped = Math.min(max, Math.max(0, val));
      const x = i * step;
      const y = h - (clamped / max) * h;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevVal = Math.min(max, Math.max(0, data[i - 1]));
        const prevY = h - (prevVal / max) * h;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw head point
    if (data.length > 0) {
      const lastVal = Math.min(max, Math.max(0, data[data.length - 1]));
      const lastX = w;
      const lastY = h - (lastVal / max) * h;

      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }, [data, max, height, strokeColor, fillColor]);

  const latest = data.length > 0 ? data[data.length - 1] : 0;

  return (
    <div className="w-full glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-center mb-2 z-10">
        {label && <span className="text-xs font-semibold text-slate-400">{label}</span>}
        <span className="font-mono text-sm font-bold text-white">
          {typeof latest === 'number' ? latest.toFixed(1) : latest} {unit}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        className="w-full block"
      />
    </div>
  );
};