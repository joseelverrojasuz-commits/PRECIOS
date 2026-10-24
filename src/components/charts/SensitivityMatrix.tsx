import React from 'react';
import { SensitivityMatrixCell } from '../../types/pricing';

interface Props {
  priceSteps: number[];
  costSteps: number[];
  matrix: SensitivityMatrixCell[][];
  basePrice: number;
  baseCost: number;
  currencySymbol?: string;
}

export const SensitivityMatrix: React.FC<Props> = ({
  priceSteps,
  costSteps,
  matrix,
  basePrice,
  baseCost,
  currencySymbol = '$',
}) => {
  // Find min and max profit to compute color heat scale
  let minProfit = Infinity;
  let maxProfit = -Infinity;

  matrix.forEach((row) => {
    row.forEach((cell) => {
      if (cell.profit < minProfit) minProfit = cell.profit;
      if (cell.profit > maxProfit) maxProfit = cell.profit;
    });
  });

  const getHeatColor = (profit: number) => {
    if (profit <= 0) return 'bg-rose-50 text-rose-800 border-rose-200';
    const range = maxProfit - minProfit || 1;
    const ratio = (profit - minProfit) / range;
    if (ratio > 0.75) return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
    if (ratio > 0.45) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (ratio > 0.2) return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Matriz de Sensibilidad Bidimensional</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Impacto conjunto de variaciones en el Precio Unitario (Columnas) vs Costo Variable Unitario (Filas) sobre la Utilidad Neta
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-xs"></span>
          <span>Mayor Utilidad</span>
          <span className="inline-block w-3 h-3 bg-rose-50 border border-rose-200 rounded-xs ml-2"></span>
          <span>Bajo o Pérdida</span>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 bg-slate-100 text-slate-700 font-medium border border-slate-200 text-center">
                CV \ P
              </th>
              {priceSteps.map((p, idx) => {
                const isBase = Math.abs(p - basePrice) < 0.05;
                const deltaPct = Math.round(((p - basePrice) / basePrice) * 100);
                return (
                  <th
                    key={idx}
                    className={`p-2.5 border border-slate-200 text-center font-mono ${
                      isBase ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>{currencySymbol}{p.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      {isBase ? 'Base' : `${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {costSteps.map((c, rIdx) => {
              const isBaseCost = Math.abs(c - baseCost) < 0.05;
              const deltaCostPct = Math.round(((c - baseCost) / baseCost) * 100);

              return (
                <tr key={rIdx}>
                  <td
                    className={`p-2.5 border border-slate-200 text-center font-mono whitespace-nowrap ${
                      isBaseCost ? 'bg-blue-100 text-blue-900 font-bold' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>{currencySymbol}{c.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      {isBaseCost ? 'Base CV' : `${deltaCostPct > 0 ? '+' : ''}${deltaCostPct}%`}
                    </div>
                  </td>

                  {matrix[rIdx].map((cell, cIdx) => {
                    const isCenter = isBaseCost && Math.abs(cell.price - basePrice) < 0.05;
                    const cellColor = getHeatColor(cell.profit);

                    return (
                      <td
                        key={cIdx}
                        className={`p-2.5 border text-center transition-colors relative ${cellColor} ${
                          isCenter ? 'ring-2 ring-blue-500 ring-inset' : ''
                        }`}
                      >
                        <div className="font-mono font-medium">
                          {currencySymbol}{Math.round(cell.profit).toLocaleString()}
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5">
                          Margen: {cell.marginPercent.toFixed(1)}%
                        </div>
                        <div className="text-[9px] opacity-60">
                          Q: {Math.round(cell.demand).toLocaleString()}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>* Celdas con borde azul indican el escenario de costo y precio base actual.</span>
        <span>Unidades demandadas calculadas mediante la función lineal Q = a - bP ajustada.</span>
      </div>
    </div>
  );
};
