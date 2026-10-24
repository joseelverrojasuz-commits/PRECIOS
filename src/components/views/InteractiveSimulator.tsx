import React, { useState } from 'react';
import {
  LinearRegressionResult,
  AlternativeModelResult,
  CommercialScenario,
} from '../../types/pricing';
import { InteractiveDemandChart } from '../charts/InteractiveDemandChart';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  Target,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Props {
  data: Record<string, any>[];
  priceCol: string;
  quantityCol: string;
  linearModel: LinearRegressionResult;
  alternativeModel: AlternativeModelResult;
  baseScenarios: CommercialScenario[];
  defaultFixedCost: number;
  defaultUnitCost: number;
  historicalMeanPrice: number;
  currencySymbol?: string;
}

export const InteractiveSimulator: React.FC<Props> = ({
  data,
  priceCol,
  quantityCol,
  linearModel,
  baseScenarios,
  defaultFixedCost,
  defaultUnitCost,
  historicalMeanPrice,
  currencySymbol = '$',
}) => {
  const [simPrice, setSimPrice] = useState<number>(Number(historicalMeanPrice.toFixed(2)));
  const [fixedCost, setFixedCost] = useState<number>(defaultFixedCost);
  const [unitCost, setUnitCost] = useState<number>(defaultUnitCost);

  // Analytical optimal prices
  const optimalProfitPrice = Number(
    ((linearModel.a + linearModel.b * unitCost) / (2 * linearModel.b)).toFixed(2)
  );
  const optimalRevenuePrice = Number((linearModel.a / (2 * linearModel.b)).toFixed(2));

  // Current calculations
  const demand = Math.max(0, linearModel.a - linearModel.b * simPrice);
  const revenue = simPrice * demand;
  const variableCostsTotal = unitCost * demand;
  const totalCosts = fixedCost + variableCostsTotal;
  const profit = revenue - totalCosts;
  const marginPercent = simPrice > 0 ? ((simPrice - unitCost) / simPrice) * 100 : 0;
  const unitContribution = simPrice - unitCost;
  const breakEvenQty = unitContribution > 0 ? fixedCost / unitContribution : Infinity;

  // Baseline comparison
  const baseDem = Math.max(0, linearModel.a - linearModel.b * historicalMeanPrice);
  const baseProf = historicalMeanPrice * baseDem - (fixedCost + unitCost * baseDem);
  const profitDelta = profit - baseProf;
  const profitDeltaPct = baseProf !== 0 ? (profitDelta / Math.abs(baseProf)) * 100 : 0;

  const handleReset = () => {
    setSimPrice(Number(historicalMeanPrice.toFixed(2)));
    setFixedCost(defaultFixedCost);
    setUnitCost(defaultUnitCost);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Sliders className="w-3.5 h-3.5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Simulador Comercial y Motor de Optimización</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modela en tiempo real el precio unitario y la estructura de costos para encontrar el balance perfecto entre volumen y rentabilidad
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Parámetros</span>
        </button>
      </div>

      {/* Main Grid: Controls + Interactive Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Optimizadores Automáticos</span>
            </h3>

            {/* Target Objective Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSimPrice(optimalProfitPrice)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  Math.abs(simPrice - optimalProfitPrice) < 0.05
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>Max Utilidad (P*)</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
                  {currencySymbol}{optimalProfitPrice.toFixed(2)}
                </div>
              </button>

              <button
                onClick={() => setSimPrice(optimalRevenuePrice)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  Math.abs(simPrice - optimalRevenuePrice) < 0.05
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="text-xs font-semibold flex items-center justify-between">
                  <span>Max Facturación</span>
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[11px] font-mono text-blue-700 mt-0.5">
                  {currencySymbol}{optimalRevenuePrice.toFixed(2)}
                </div>
              </button>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Price Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-800">Precio Unitario de Venta:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold font-mono text-blue-600">{currencySymbol}{simPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">
                      ({simPrice >= historicalMeanPrice ? '+' : ''}
                      {(((simPrice - historicalMeanPrice) / historicalMeanPrice) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={Math.max(unitCost + 0.1, historicalMeanPrice * 0.5)}
                  max={historicalMeanPrice * 1.8}
                  step={0.1}
                  value={simPrice}
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>Mín: {currencySymbol}{(historicalMeanPrice * 0.5).toFixed(1)}</span>
                  <span>Base: {currencySymbol}{historicalMeanPrice.toFixed(1)}</span>
                  <span>Máx: {currencySymbol}{(historicalMeanPrice * 1.8).toFixed(1)}</span>
                </div>
              </div>

              {/* Unit Variable Cost Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-slate-700">Costo Variable Unitario (CV):</span>
                  <span className="text-xs font-mono font-semibold text-slate-900">{currencySymbol}{unitCost.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={Math.max(0.5, defaultUnitCost * 0.4)}
                  max={defaultUnitCost * 2.2}
                  step={0.1}
                  value={unitCost}
                  onChange={(e) => setUnitCost(Number(e.target.value))}
                  className="w-full accent-slate-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>{currencySymbol}{(defaultUnitCost * 0.4).toFixed(1)}</span>
                  <span>Base: {currencySymbol}{defaultUnitCost.toFixed(1)}</span>
                  <span>{currencySymbol}{(defaultUnitCost * 2.2).toFixed(1)}</span>
                </div>
              </div>

              {/* Fixed Cost Input */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-slate-700">Costos Fijos del Período (CF):</span>
                  <span className="text-xs font-mono font-semibold text-slate-900">{currencySymbol}{fixedCost.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  step={1000}
                  value={fixedCost}
                  onChange={(e) => setFixedCost(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Financial Waterfall Readout */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                Cascada de Resultados Financieros Proyectados:
              </h4>

              <div className="flex justify-between text-slate-600">
                <span>Demanda estimada (Q):</span>
                <span className="font-mono font-semibold text-slate-900">{Math.round(demand).toLocaleString()} unidades</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ingreso Total Bruto (P × Q):</span>
                <span className="font-mono font-semibold text-slate-900">{currencySymbol}{Math.round(revenue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>(-) Costos Variables (CV × Q):</span>
                <span className="font-mono text-rose-700">-{currencySymbol}{Math.round(variableCostsTotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-medium pt-1 border-t border-slate-200">
                <span>(=) Margen de Contribución Total:</span>
                <span className="font-mono font-bold text-slate-900">{currencySymbol}{Math.round(revenue - variableCostsTotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>(-) Costos Fijos Totales (CF):</span>
                <span className="font-mono text-rose-700">-{currencySymbol}{Math.round(fixedCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300 text-sm">
                <span className="font-bold text-slate-900">(=) Utilidad Neta π:</span>
                <span className={`font-mono font-bold text-base ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {currencySymbol}{Math.round(profit).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Margen sobre Ventas: <strong className="text-slate-800 font-mono">{marginPercent.toFixed(1)}%</strong></span>
                <span>Punto de Equilibrio: <strong className="text-slate-800 font-mono">{Math.round(breakEvenQty).toLocaleString()} unid.</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <InteractiveDemandChart
            data={data}
            priceCol={priceCol}
            quantityCol={quantityCol}
            linearModel={linearModel}
            currentSimulatedPrice={simPrice}
            fixedCost={fixedCost}
            unitVariableCost={unitCost}
            onPriceChange={setSimPrice}
            currencySymbol={currencySymbol}
          />

          {/* Quick Scenario Assessment Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">Comparación vs Operación Histórica:</span>
              <p className="text-slate-600 mt-0.5">
                Al precio simulado de {currencySymbol}{simPrice.toFixed(2)}, la utilidad neta varía en{' '}
                <strong className={profitDelta >= 0 ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                  {profitDelta >= 0 ? '+' : ''}{currencySymbol}{Math.round(profitDelta).toLocaleString()} ({profitDeltaPct >= 0 ? '+' : ''}{profitDeltaPct.toFixed(1)}%)
                </strong>{' '}
                respecto al escenario base.
              </p>
            </div>
            {Math.abs(simPrice - optimalProfitPrice) < 0.1 && (
              <div className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Punto Óptimo</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
