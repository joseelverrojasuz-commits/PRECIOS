import React from 'react';
import { calculateStats } from '../../utils/econometrics';

interface Props {
  values: number[];
  title: string;
  variableName: string;
  unitPrefix?: string;
  unitSuffix?: string;
  binsCount?: number;
}

export const DistributionChart: React.FC<Props> = ({
  values,
  title,
  variableName,
  unitPrefix = '',
  unitSuffix = '',
  binsCount = 10,
}) => {
  const stats = calculateStats(values);

  if (stats.count === 0 || stats.min === stats.max) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        Sin variabilidad suficiente para histograma ({variableName}).
      </div>
    );
  }

  // Calculate bins
  const binWidth = (stats.max - stats.min) / binsCount;
  const bins: { min: number; max: number; count: number }[] = [];

  for (let i = 0; i < binsCount; i++) {
    bins.push({
      min: stats.min + i * binWidth,
      max: stats.min + (i + 1) * binWidth,
      count: 0,
    });
  }

  values.forEach((val) => {
    let placed = false;
    for (let i = 0; i < binsCount; i++) {
      if (val >= bins[i].min && (i === binsCount - 1 ? val <= bins[i].max : val < bins[i].max)) {
        bins[i].count++;
        placed = true;
        break;
      }
    }
    if (!placed && bins.length > 0) {
      bins[bins.length - 1].count++;
    }
  });

  const maxBinCount = Math.max(...bins.map((b) => b.count), 1);

  // SVG dimensions
  const svgWidth = 360;
  const svgHeight = 160;
  const padLeft = 35;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 30;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;
  const barWidth = chartWidth / binsCount;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-800">{title}</h4>
        <span className="text-[11px] text-slate-500 font-mono">
          μ = {unitPrefix}{stats.mean.toLocaleString()}{unitSuffix} · σ = {stats.std.toLocaleString()}
        </span>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
          {/* Y Axis line */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + chartHeight}
            stroke="#cbd5e1"
            strokeWidth={1}
          />
          {/* X Axis line */}
          <line
            x1={padLeft}
            y1={padTop + chartHeight}
            x2={svgWidth - padRight}
            y2={padTop + chartHeight}
            stroke="#cbd5e1"
            strokeWidth={1}
          />

          {/* Histogram Bars */}
          {bins.map((b, idx) => {
            const h = (b.count / maxBinCount) * chartHeight;
            const x = padLeft + idx * barWidth;
            const y = padTop + chartHeight - h;

            return (
              <g key={idx}>
                <rect
                  x={x + 1}
                  y={y}
                  width={Math.max(2, barWidth - 2)}
                  height={Math.max(1, h)}
                  fill="#38bdf8"
                  fillOpacity={0.8}
                  stroke="#0284c7"
                  strokeWidth={0.75}
                  rx={2}
                />
                {b.count > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 3}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-500 font-mono"
                  >
                    {b.count}
                  </text>
                )}
              </g>
            );
          })}

          {/* Mean marker */}
          {stats.max > stats.min && (
            <line
              x1={padLeft + ((stats.mean - stats.min) / (stats.max - stats.min)) * chartWidth}
              y1={padTop}
              x2={padLeft + ((stats.mean - stats.min) / (stats.max - stats.min)) * chartWidth}
              y2={padTop + chartHeight}
              stroke="#e11d48"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
          )}

          {/* X axis endpoints */}
          <text
            x={padLeft}
            y={padTop + chartHeight + 15}
            textAnchor="start"
            className="text-[9px] fill-slate-500 font-mono"
          >
            {unitPrefix}{stats.min.toFixed(1)}{unitSuffix}
          </text>
          <text
            x={svgWidth - padRight}
            y={padTop + chartHeight + 15}
            textAnchor="end"
            className="text-[9px] fill-slate-500 font-mono"
          >
            {unitPrefix}{stats.max.toFixed(1)}{unitSuffix}
          </text>
        </svg>
      </div>

      {/* Summary figures */}
      <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-[11px] text-center">
        <div className="bg-slate-50 py-1 rounded">
          <span className="text-slate-400 block text-[9px]">Mín</span>
          <span className="font-mono text-slate-700">{unitPrefix}{stats.min}{unitSuffix}</span>
        </div>
        <div className="bg-slate-50 py-1 rounded">
          <span className="text-slate-400 block text-[9px]">Mediana</span>
          <span className="font-mono text-slate-700">{unitPrefix}{stats.median}{unitSuffix}</span>
        </div>
        <div className="bg-slate-50 py-1 rounded">
          <span className="text-slate-400 block text-[9px]">Media</span>
          <span className="font-mono text-rose-700 font-medium">{unitPrefix}{stats.mean}{unitSuffix}</span>
        </div>
        <div className="bg-slate-50 py-1 rounded">
          <span className="text-slate-400 block text-[9px]">Máx</span>
          <span className="font-mono text-slate-700">{unitPrefix}{stats.max}{unitSuffix}</span>
        </div>
      </div>
    </div>
  );
};
