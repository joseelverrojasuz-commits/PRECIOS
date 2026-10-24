import React, { useState } from 'react';
import { LinearRegressionResult } from '../../types/pricing';

interface Props {
  data: Record<string, any>[];
  priceCol: string;
  quantityCol: string;
  linearModel: LinearRegressionResult;
  currentSimulatedPrice: number;
  fixedCost: number;
  unitVariableCost: number;
  onPriceChange?: (newPrice: number) => void;
  currencySymbol?: string;
}

export const InteractiveDemandChart: React.FC<Props> = ({
  data,
  priceCol,
  quantityCol,
  linearModel,
  currentSimulatedPrice,
  fixedCost,
  unitVariableCost,
  onPriceChange,
  currencySymbol = '$',
}) => {
  const [activeCurveView, setActiveCurveView] = useState<'demand' | 'revenue_profit'>('demand');

  // Extract empirical points
  const points = data
    .map((d) => ({
      p: Number(d[priceCol]),
      q: Number(d[quantityCol]),
    }))
    .filter((pt) => !isNaN(pt.p) && !isNaN(pt.q) && pt.p > 0 && pt.q >= 0);

  const prices = points.map((pt) => pt.p);
  const quantities = points.map((pt) => pt.q);

  const minP = Math.max(0.1, Math.min(...prices) * 0.8);
  const maxP = Math.max(...prices) * 1.25;

  const minQ = 0;
  const maxQ = Math.max(...quantities) * 1.2;

  // Chart dimensions
  const width = 760;
  const height = 380;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 50;

  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;

  // Scales for Demand curve (X = Price, Y = Quantity)
  const scaleX = (p: number) => padLeft + ((p - minP) / (maxP - minP)) * innerWidth;
  const scaleY = (q: number) => padTop + innerHeight - ((q - minQ) / (maxQ - minQ)) * innerHeight;

  // Theoretical line points
  const p1 = minP;
  const q1 = Math.max(0, linearModel.a - linearModel.b * p1);
  const p2 = maxP;
  const q2 = Math.max(0, linearModel.a - linearModel.b * p2);

  // Revenue & Profit curves
  // Max profit price: P* = (a + b * CV) / (2b)
  const optimalProfitP = (linearModel.a + linearModel.b * unitVariableCost) / (2 * linearModel.b);
  const maxRevenueP = linearModel.a / (2 * linearModel.b);

  // Current simulation point
  const currentDemand = Math.max(0, linearModel.a - linearModel.b * currentSimulatedPrice);
  const currentRevenue = currentSimulatedPrice * currentDemand;
  const currentCost = fixedCost + unitVariableCost * currentDemand;
  const currentProfit = currentRevenue - currentCost;

  // Calculate curves for revenue and profit
  const curveSteps = 50;
  const curveData: { p: number; q: number; rev: number; profit: number }[] = [];
  let maxRevVal = 0;
  let maxProfitVal = 0;
  let minProfitVal = 0;

  for (let i = 0; i <= curveSteps; i++) {
    const p = minP + (i / curveSteps) * (maxP - minP);
    const q = Math.max(0, linearModel.a - linearModel.b * p);
    const rev = p * q;
    const prof = rev - (fixedCost + unitVariableCost * q);
    curveData.push({ p, q, rev, profit: prof });
    if (rev > maxRevVal) maxRevVal = rev;
    if (prof > maxProfitVal) maxProfitVal = prof;
    if (prof < minProfitVal) minProfitVal = prof;
  }

  const upperFinancial = Math.max(maxRevVal, maxProfitVal) * 1.1;
  const lowerFinancial = Math.min(0, minProfitVal * 1.2);
  const scaleFinancialY = (val: number) =>
    padTop + innerHeight - ((val - lowerFinancial) / (upperFinancial - lowerFinancial)) * innerHeight;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {activeCurveView === 'demand' ? 'Curva de Demanda Econométrica Q(P)' : 'Curvas de Ingresos R(P) y Utilidad π(P)'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCurveView === 'demand'
              ? 'Dispersión empírica de transacciones y recta estimada por Mínimos Cuadrados Ordinarios (MCO)'
              : 'Optimización de ingresos brutos y beneficio económico neto según precio unitario'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setActiveCurveView('demand')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeCurveView === 'demand' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Curva de Demanda Q(P)
          </button>
          <button
            onClick={() => setActiveCurveView('revenue_profit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeCurveView === 'revenue_profit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ingresos & Utilidad π(P)
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px] select-none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + innerHeight * pct;
            return (
              <line
                key={`h-${idx}`}
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1}
                strokeDasharray={pct === 1 ? 'none' : '4 4'}
              />
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const x = padLeft + innerWidth * pct;
            return (
              <line
                key={`v-${idx}`}
                x1={x}
                y1={padTop}
                x2={x}
                y2={height - padBottom}
                stroke="#f1f5f9"
                strokeWidth={1}
                strokeDasharray={pct === 0 ? 'none' : '4 4'}
              />
            );
          })}

          {/* Zero profit line in revenue/profit view */}
          {activeCurveView === 'revenue_profit' && lowerFinancial < 0 && (
            <line
              x1={padLeft}
              y1={scaleFinancialY(0)}
              x2={width - padRight}
              y2={scaleFinancialY(0)}
              stroke="#cbd5e1"
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
          )}

          {activeCurveView === 'demand' ? (
            <>
              {/* Linear Demand Line */}
              <line
                x1={scaleX(p1)}
                y1={scaleY(q1)}
                x2={scaleX(p2)}
                y2={scaleY(q2)}
                stroke="#2563eb"
                strokeWidth={2.5}
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <circle
                  key={i}
                  cx={scaleX(pt.p)}
                  cy={scaleY(pt.q)}
                  r={3.5}
                  fill="#0ea5e9"
                  fillOpacity={0.65}
                  stroke="#0284c7"
                  strokeWidth={1}
                />
              ))}

              {/* Current Simulated Price point on demand curve */}
              {currentSimulatedPrice >= minP && currentSimulatedPrice <= maxP && (
                <>
                  <line
                    x1={scaleX(currentSimulatedPrice)}
                    y1={padTop}
                    x2={scaleX(currentSimulatedPrice)}
                    y2={height - padBottom}
                    stroke="#e11d48"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={padLeft}
                    y1={scaleY(currentDemand)}
                    x2={scaleX(currentSimulatedPrice)}
                    y2={scaleY(currentDemand)}
                    stroke="#e11d48"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={scaleX(currentSimulatedPrice)}
                    cy={scaleY(currentDemand)}
                    r={6}
                    fill="#e11d48"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {/* Revenue Curve Path */}
              <path
                d={curveData.reduce(
                  (acc, curr, idx) =>
                    `${acc} ${idx === 0 ? 'M' : 'L'} ${scaleX(curr.p)} ${scaleFinancialY(curr.rev)}`,
                  ''
                )}
                fill="none"
                stroke="#0284c7"
                strokeWidth={2.5}
              />

              {/* Profit Curve Path */}
              <path
                d={curveData.reduce(
                  (acc, curr, idx) =>
                    `${acc} ${idx === 0 ? 'M' : 'L'} ${scaleX(curr.p)} ${scaleFinancialY(curr.profit)}`,
                  ''
                )}
                fill="none"
                stroke="#16a34a"
                strokeWidth={3}
              />

              {/* Max Profit vertical line */}
              {optimalProfitP >= minP && optimalProfitP <= maxP && (
                <line
                  x1={scaleX(optimalProfitP)}
                  y1={padTop}
                  x2={scaleX(optimalProfitP)}
                  y2={height - padBottom}
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              )}

              {/* Max Revenue vertical line */}
              {maxRevenueP >= minP && maxRevenueP <= maxP && (
                <line
                  x1={scaleX(maxRevenueP)}
                  y1={padTop}
                  x2={scaleX(maxRevenueP)}
                  y2={height - padBottom}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              )}

              {/* Current Simulated Price point in Revenue/Profit */}
              {currentSimulatedPrice >= minP && currentSimulatedPrice <= maxP && (
                <>
                  <line
                    x1={scaleX(currentSimulatedPrice)}
                    y1={padTop}
                    x2={scaleX(currentSimulatedPrice)}
                    y2={height - padBottom}
                    stroke="#e11d48"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={scaleX(currentSimulatedPrice)}
                    cy={scaleFinancialY(currentProfit)}
                    r={6}
                    fill="#e11d48"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </>
              )}
            </>
          )}

          {/* Axes */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={height - padBottom}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />

          {/* X Axis Labels (Price) */}
          {[minP, (minP + maxP) / 2, maxP].map((p, idx) => (
            <text
              key={`xl-${idx}`}
              x={scaleX(p)}
              y={height - padBottom + 20}
              textAnchor="middle"
              className="text-[11px] fill-slate-500 font-mono"
            >
              {currencySymbol}{p.toFixed(1)}
            </text>
          ))}
          <text
            x={padLeft + innerWidth / 2}
            y={height - 12}
            textAnchor="middle"
            className="text-xs font-semibold fill-slate-700"
          >
            Precio Unitario P ({currencySymbol})
          </text>

          {/* Y Axis Labels */}
          {activeCurveView === 'demand' ? (
            <>
              {[0, maxQ / 2, maxQ].map((q, idx) => (
                <text
                  key={`yl-${idx}`}
                  x={padLeft - 10}
                  y={scaleY(q) + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-500 font-mono"
                >
                  {Math.round(q).toLocaleString()}
                </text>
              ))}
              <text
                x={18}
                y={padTop + innerHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90, 18, ${padTop + innerHeight / 2})`}
                className="text-xs font-semibold fill-slate-700"
              >
                Cantidad Demandada Q (Unidades)
              </text>
            </>
          ) : (
            <>
              {[lowerFinancial, 0, upperFinancial / 2, upperFinancial].map((val, idx) => (
                <text
                  key={`ylf-${idx}`}
                  x={padLeft - 10}
                  y={scaleFinancialY(val) + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-500 font-mono"
                >
                  {currencySymbol}{Math.round(val / 1000)}k
                </text>
              ))}
              <text
                x={18}
                y={padTop + innerHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90, 18, ${padTop + innerHeight / 2})`}
                className="text-xs font-semibold fill-slate-700"
              >
                Ingresos / Utilidad ({currencySymbol})
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Legend & Current Marker Card */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          {activeCurveView === 'demand' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 inline-block opacity-75"></span>
                <span>Datos empíricos ({points.length} obs.)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-blue-600 inline-block"></span>
                <span className="font-mono">Demanda lineal: Q = {linearModel.a.toFixed(1)} - {linearModel.b.toFixed(2)}P</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-sky-600 inline-block"></span>
                <span>Ingreso Total: R(P)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-emerald-600 inline-block"></span>
                <span>Utilidad Neta: π(P)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-600 border-t border-dashed border-emerald-600 inline-block"></span>
                <span>P* Óptimo ({currencySymbol}{optimalProfitP.toFixed(2)})</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Simulación actual: {currencySymbol}{currentSimulatedPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Live Simulator readout */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500">Demanda est.: <strong className="text-slate-900 font-mono">{Math.round(currentDemand).toLocaleString()}</strong></span>
          <span aria-hidden="true" className="text-slate-300">|</span>
          <span className="text-slate-500">Utilidad est.: <strong className={`font-mono ${currentProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{currencySymbol}{Math.round(currentProfit).toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
