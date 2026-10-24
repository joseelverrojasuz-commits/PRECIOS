import React from 'react';
import {
  LinearRegressionResult,
  AlternativeModelResult,
  CommercialScenario,
  SensitivityMatrixCell,
  SectorDetection,
  DataQualityReport,
} from '../../types/pricing';
import { InteractiveDemandChart } from '../charts/InteractiveDemandChart';
import { SensitivityMatrix } from '../charts/SensitivityMatrix';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  Sliders,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  data: Record<string, any>[];
  priceCol: string;
  quantityCol: string;
  linearModel: LinearRegressionResult;
  alternativeModel: AlternativeModelResult;
  scenarios: CommercialScenario[];
  sectorDetection: SectorDetection;
  fixedCost: number;
  unitVariableCost: number;
  historicalMeanPrice: number;
  historicalMeanQuantity: number;
  simulatedPrice: number;
  onPriceChange: (p: number) => void;
  sensitivity: {
    priceSteps: number[];
    costSteps: number[];
    matrix: SensitivityMatrixCell[][];
  };
  onNavigateToStage: (stageIndex: number) => void;
  onNavigateToReport: () => void;
  onNavigateToSimulator: () => void;
}

export const OverviewDashboard: React.FC<Props> = ({
  data,
  priceCol,
  quantityCol,
  linearModel,
  alternativeModel,
  scenarios,
  sectorDetection,
  fixedCost,
  unitVariableCost,
  historicalMeanPrice,
  historicalMeanQuantity,
  simulatedPrice,
  onPriceChange,
  sensitivity,
  onNavigateToStage,
  onNavigateToReport,
  onNavigateToSimulator,
}) => {
  const optimalScenario = scenarios.find((s) => s.isOptimal) || scenarios[0];
  const baseScenario = scenarios.find((s) => s.id === 'sc_base') || scenarios[0];

  const profitUplift = optimalScenario.profit - baseScenario.profit;
  const profitUpliftPercent = baseScenario.profit > 0 ? (profitUplift / baseScenario.profit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Sector & Executive Context Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <Building2 className="w-4 h-4" />
              <span>Sector Económico Detectado: {sectorDetection.sector}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Certeza: {sectorDetection.confidence}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Estudio Integral de Estimación y Optimización de Precios
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Modelización econométrica de demanda mediante MCO, estimación de elasticidades precio, evaluación de estructura de costos y simulación de escenarios comerciales para la maximización del beneficio económico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onNavigateToSimulator}
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Abrir Simulador</span>
            </button>
            <button
              onClick={onNavigateToReport}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Ver Informe Completo (17 Secc.)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Diagnostic clues tags */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-300 font-medium">Indicios del Sector:</span>
          {sectorDetection.clues.map((clue, idx) => (
            <span key={idx} className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md text-[11px]">
              {clue}
            </span>
          ))}
        </div>
      </div>

      {/* KPI Cards: The 4 Core Econometric Outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Precio Óptimo */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Precio Óptimo (Max Utilidad)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ${optimalScenario.price.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <span className="font-mono text-slate-500">Histórico: ${historicalMeanPrice.toFixed(2)}</span>
            <span className="text-emerald-700 font-medium ml-1">
              ({optimalScenario.price >= historicalMeanPrice ? '+' : ''}
              {(((optimalScenario.price - historicalMeanPrice) / historicalMeanPrice) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            d(Utilidad)/dP = 0 · Solución analítica MCO
          </div>
        </div>

        {/* Utilidad Óptima vs Base */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Utilidad Neta Proyectada</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            ${Math.round(optimalScenario.profit).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">
              +{profitUpliftPercent.toFixed(1)}% vs Escenario Base
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Ganancia incremental: +${Math.round(profitUplift).toLocaleString()}
          </div>
        </div>

        {/* Elasticidad Precio */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Elasticidad Precio Media (ε)</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {linearModel.elasticityAtMean.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <span className="font-semibold text-slate-800">
              Demanda {linearModel.elasticityInterpretation}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Sensibilidad marginal: b = -{linearModel.b.toFixed(2)} unid./$
          </div>
        </div>

        {/* Ajuste del Modelo R² */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Bondad de Ajuste R²</span>
            <PieChart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {(linearModel.rSquared * 100).toFixed(1)}%
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <span className="font-mono text-slate-700">p-valor: {linearModel.pValueSlope}</span>
            <span className="text-emerald-700 font-medium ml-1">· Significativo</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Alternativo R²: {(alternativeModel.rSquared * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Main Interactive Chart & Live Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InteractiveDemandChart
            data={data}
            priceCol={priceCol}
            quantityCol={quantityCol}
            linearModel={linearModel}
            currentSimulatedPrice={simulatedPrice}
            fixedCost={fixedCost}
            unitVariableCost={unitVariableCost}
            onPriceChange={onPriceChange}
          />
        </div>

        {/* Commercial Quick Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Simulación Rápida de Precio</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ajusta el precio para observar el impacto instantáneo en demanda y rentabilidad
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">Precio Simulado (P):</span>
                  <span className="text-sm font-bold font-mono text-blue-600">${simulatedPrice.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={Math.max(unitVariableCost + 0.5, historicalMeanPrice * 0.6)}
                  max={historicalMeanPrice * 1.6}
                  step={0.1}
                  value={simulatedPrice}
                  onChange={(e) => onPriceChange(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>${(historicalMeanPrice * 0.6).toFixed(1)}</span>
                  <span>Base: ${historicalMeanPrice.toFixed(1)}</span>
                  <span>${(historicalMeanPrice * 1.6).toFixed(1)}</span>
                </div>
              </div>

              {/* Readout parameters */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Demanda proyectada Q:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {Math.round(Math.max(0, linearModel.a - linearModel.b * simulatedPrice)).toLocaleString()} unid.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingreso bruto (P × Q):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ${Math.round(simulatedPrice * Math.max(0, linearModel.a - linearModel.b * simulatedPrice)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Costos totales (CF + CV·Q):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    ${Math.round(fixedCost + unitVariableCost * Math.max(0, linearModel.a - linearModel.b * simulatedPrice)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Utilidad Neta Estimada:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${Math.round(
                      simulatedPrice * Math.max(0, linearModel.a - linearModel.b * simulatedPrice) -
                        (fixedCost + unitVariableCost * Math.max(0, linearModel.a - linearModel.b * simulatedPrice))
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Fast buttons to presets */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Fijar en escenarios clave:</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => onPriceChange(baseScenario.price)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-center transition-colors text-[11px]"
                  >
                    Precio Base
                  </button>
                  <button
                    onClick={() => onPriceChange(scenarios.find((s) => s.id === 'sc_rev')?.price || baseScenario.price)}
                    className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-center transition-colors text-[11px]"
                  >
                    Max Ingresos
                  </button>
                  <button
                    onClick={() => onPriceChange(optimalScenario.price)}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium rounded text-center transition-colors text-[11px]"
                  >
                    Max Utilidad
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onNavigateToSimulator}
              className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Abrir Simulador Comercial Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Scenarios Table (Mandatory Spec) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Tabla Comparativa de Escenarios Comerciales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluación sistemática de precios según diferentes objetivos de negocio frente al escenario base
            </p>
          </div>
          <button
            onClick={() => onNavigateToStage(6)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver Etapa 7: Simulación Detallada</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-medium border-b border-slate-200">
                <th className="p-3">Escenario</th>
                <th className="p-3 text-right">Precio ($)</th>
                <th className="p-3 text-right">Demanda (Q)</th>
                <th className="p-3 text-right">Ingresos ($)</th>
                <th className="p-3 text-right">Costos ($)</th>
                <th className="p-3 text-right">Utilidad ($)</th>
                <th className="p-3 text-right">Margen (%)</th>
                <th className="p-3 text-right">Var. Utilidad vs Base</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc) => (
                <tr
                  key={sc.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    sc.isOptimal ? 'bg-emerald-50/70 font-medium' : ''
                  }`}
                >
                  <td className="p-3 text-slate-900">
                    <div className="font-semibold flex items-center gap-1.5">
                      {sc.isOptimal && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{sc.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal">{sc.objective}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800">${sc.price.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono">{Math.round(sc.estimatedDemand).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono">${Math.round(sc.revenue).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-slate-600">${Math.round(sc.costs).toLocaleString()}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    <span className={sc.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      ${Math.round(sc.profit).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{sc.marginPercent.toFixed(1)}%</td>
                  <td className="p-3 text-right font-mono font-semibold">
                    <span
                      className={
                        sc.varianceVsBaseProfit > 0
                          ? 'text-emerald-700'
                          : sc.varianceVsBaseProfit < 0
                          ? 'text-rose-700'
                          : 'text-slate-500'
                      }
                    >
                      {sc.varianceVsBaseProfit > 0 ? '+' : ''}
                      {sc.varianceVsBaseProfit.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Matrix Preview */}
      <SensitivityMatrix
        priceSteps={sensitivity.priceSteps}
        costSteps={sensitivity.costSteps}
        matrix={sensitivity.matrix}
        basePrice={historicalMeanPrice}
        baseCost={unitVariableCost}
      />
    </div>
  );
};
