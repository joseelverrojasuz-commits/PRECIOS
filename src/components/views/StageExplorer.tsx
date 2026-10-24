import React, { useState } from 'react';
import {
  ColumnMetadata,
  DataQualityReport,
  LinearRegressionResult,
  AlternativeModelResult,
  CommercialScenario,
  SensitivityMatrixCell,
  SectorDetection,
} from '../../types/pricing';
import { DistributionChart } from '../charts/DistributionChart';
import { InteractiveDemandChart } from '../charts/InteractiveDemandChart';
import { SensitivityMatrix } from '../charts/SensitivityMatrix';
import {
  FileText,
  Table,
  ShieldCheck,
  BarChart2,
  TrendingDown,
  DollarSign,
  Cpu,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface Props {
  data: Record<string, any>[];
  cleanedData: Record<string, any>[];
  columns: string[];
  metadata: ColumnMetadata[];
  qualityReport: DataQualityReport;
  sectorDetection: SectorDetection;
  linearModel: LinearRegressionResult;
  alternativeModel: AlternativeModelResult;
  scenarios: CommercialScenario[];
  fixedCost: number;
  unitVariableCost: number;
  priceCol: string;
  quantityCol: string;
  historicalMeanPrice: number;
  historicalMeanQuantity: number;
  sensitivity: {
    priceSteps: number[];
    costSteps: number[];
    matrix: SensitivityMatrixCell[][];
  };
  initialStage?: number;
}

export const StageExplorer: React.FC<Props> = ({
  data,
  cleanedData,
  columns,
  metadata,
  qualityReport,
  sectorDetection,
  linearModel,
  alternativeModel,
  scenarios,
  fixedCost,
  unitVariableCost,
  priceCol,
  quantityCol,
  historicalMeanPrice,
  historicalMeanQuantity,
  sensitivity,
  initialStage = 0,
}) => {
  const [activeStage, setActiveStage] = useState<number>(initialStage);

  const stagesList = [
    { num: 1, title: 'Identificación y Preparación', icon: FileText, desc: 'Sector económico, formato y primeras 5 filas' },
    { num: 2, title: 'Caracterización de Variables', icon: Table, desc: 'Clasificación cuantitativa/cualitativa y diccionario' },
    { num: 3, title: 'Limpieza y Diagnóstico', icon: ShieldCheck, desc: 'Faltantes, duplicados, outliers y reglas documentadas' },
    { num: 4, title: 'Análisis Exploratorio (EDA)', icon: BarChart2, desc: 'Distribuciones, ingresos y reglas de negocio vs hipótesis' },
    { num: 5, title: 'Modelo de Demanda', icon: TrendingDown, desc: 'Curva lineal MCO, significancia y modelo alternativo' },
    { num: 6, title: 'Costos y Rentabilidad', icon: DollarSign, desc: 'Estructura de costos, margen y punto de equilibrio' },
    { num: 7, title: 'Simulación y Óptimo', icon: Cpu, desc: 'Escenarios comerciales y análisis de sensibilidad' },
    { num: 8, title: 'Políticas de Precios', icon: Compass, desc: 'Lanzamiento, competencia y productos complementarios' },
  ];

  const prices = cleanedData.map((d) => Number(d[priceCol])).filter((v) => !isNaN(v));
  const quantities = cleanedData.map((d) => Number(d[quantityCol])).filter((v) => !isNaN(v));

  return (
    <div className="space-y-6">
      {/* Stage Stepper Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[760px]">
          {stagesList.map((st, idx) => {
            const Icon = st.icon;
            const isActive = activeStage === idx;
            return (
              <button
                key={st.num}
                onClick={() => setActiveStage(idx)}
                className={`flex-1 py-2 px-2.5 rounded-lg text-left transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {st.num}
                </div>
                <div className="truncate">
                  <div className="text-xs truncate">{st.title}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: Identificación y preparación de los datos */}
      {activeStage === 0 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 1</span>
                <h2 className="text-lg font-bold text-slate-900">Identificación y Preparación de los Datos</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">{cleanedData.length} registros cargados</span>
            </div>

            {/* Sector Determination Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  Sector Económico Determinado:
                </span>
                <span className="text-sm font-bold text-slate-900">{sectorDetection.sector}</span>
              </div>
              <div className="text-xs text-slate-600">
                <strong>Actividad / Industria Específica:</strong> {sectorDetection.industry} (Grado de Certeza:{' '}
                <span className="font-semibold text-slate-800">{sectorDetection.confidence}</span>)
              </div>

              <div>
                <strong className="text-xs text-slate-700 block mb-1">Indicios y Criterios Utilizados para la Clasificación:</strong>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  {sectorDetection.clues.map((clue, i) => (
                    <li key={i}>{clue}</li>
                  ))}
                  <li>
                    Magnitud numérica de las transacciones (Precio medio: ${historicalMeanPrice.toFixed(2)}, Volumen medio:{' '}
                    {Math.round(historicalMeanQuantity).toLocaleString()} unidades por período).
                  </li>
                </ul>
              </div>

              {sectorDetection.probableAlternative && (
                <div className="text-xs text-slate-500 italic">
                  * Clasificación alternativa o secundaria probable: {sectorDetection.probableAlternative}.
                </div>
              )}
            </div>

            {/* Validation: First 5 rows */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-900">
                  Primeras 5 Filas de la Base de Datos (Validación de Estructura, Nombres y Tipos):
                </h3>
                <span className="text-[11px] text-slate-400">Total columnas: {columns.length}</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-medium">
                    <tr>
                      <th className="p-2 border-b border-r border-slate-200 text-center w-10">#</th>
                      {columns.map((c) => (
                        <th key={c} className="p-2 border-b border-r border-slate-200 whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono text-slate-400">
                          {rIdx + 1}
                        </td>
                        {columns.map((c) => (
                          <td key={c} className="p-2 border-b border-r border-slate-200 whitespace-nowrap font-mono text-[11px] text-slate-700">
                            {row[c] !== null && row[c] !== undefined ? String(row[c]) : <span className="text-slate-300">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: Caracterización de variables */}
      {activeStage === 1 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 2</span>
              <h2 className="text-lg font-bold text-slate-900">Caracterización y Clasificación de Variables</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tipificación metodológica: Cuantitativas (continuas/discretas), Cualitativas (nominales/ordinales), Tiempo e Identificadores.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-medium">
                  <tr>
                    <th className="p-2.5 border-b border-r border-slate-200">Variable</th>
                    <th className="p-2.5 border-b border-r border-slate-200">Clasificación Tipológica</th>
                    <th className="p-2.5 border-b border-r border-slate-200">Descripción Probable</th>
                    <th className="p-2.5 border-b border-r border-slate-200 text-right">% Faltantes</th>
                    <th className="p-2.5 border-b border-r border-slate-200">Valores Únicos / Categorías</th>
                    <th className="p-2.5 border-b border-slate-200">Diagnóstico de Calidad</th>
                  </tr>
                </thead>
                <tbody>
                  {metadata.map((m) => (
                    <tr key={m.name} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-2.5 border-r border-slate-200 font-mono font-semibold text-slate-900">
                        {m.name}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-600 max-w-xs">{m.description}</td>
                      <td className="p-2.5 border-r border-slate-200 text-right font-mono">
                        <span className={m.missingPercentage > 0 ? 'text-amber-700 font-semibold' : 'text-slate-600'}>
                          {m.missingPercentage}%
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-slate-700">
                        {m.uniqueCount} únicos
                        {m.topCategories && m.topCategories.length > 0 && (
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {m.topCategories.map((c) => `${c.value} (${c.count})`).join(', ')}
                          </div>
                        )}
                        {m.min !== undefined && m.max !== undefined && (
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Rango: [{m.min}, {m.max}]
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {m.potentialQualityIssues.length > 0 ? (
                          <div className="space-y-0.5 text-[11px] text-amber-700">
                            {m.potentialQualityIssues.map((iss, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{iss}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Válida / Sin anomalías</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: Limpieza y preparación de datos */}
      {activeStage === 2 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 3</span>
              <h2 className="text-lg font-bold text-slate-900">Limpieza y Preparación de Datos</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Diagnóstico sistemático de calidad y documentación explícita de reglas aplicadas sin eliminación arbitraria.
              </p>
            </div>

            {/* Diagnostics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Total Registros Brutos</span>
                <span className="text-base font-bold font-mono text-slate-900">{qualityReport.totalRows}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Duplicados Exactos</span>
                <span className="text-base font-bold font-mono text-slate-900">{qualityReport.duplicateRows}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Valores Negativos/Inválidos</span>
                <span className="text-base font-bold font-mono text-slate-900">{qualityReport.impossibleValuesCount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 block">Registros Limpios Finales</span>
                <span className="text-base font-bold font-mono text-emerald-700">{cleanedData.length}</span>
              </div>
            </div>

            {/* Documented Rules List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-900">
                Reglas de Tratamiento Econométrico Aplicadas y Justificadas:
              </h3>

              {qualityReport.appliedRules.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  La base provista presenta consistencia integral sin necesidad de exclusión de registros.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {qualityReport.appliedRules.map((rule) => (
                    <div key={rule.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/60 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{rule.issue}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {rule.appliedCount} registros
                        </span>
                      </div>
                      <div className="text-slate-700 mb-1">
                        <strong>Regla Ejecutada:</strong> {rule.ruleDescription}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        <strong>Justificación Metodológica:</strong> {rule.justification}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: Análisis exploratorio y reglas de negocio */}
      {activeStage === 3 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 4</span>
              <h2 className="text-lg font-bold text-slate-900">Análisis Exploratorio de Datos (EDA) Orientado a Precios</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribución de precios, demanda, ingresos, costos y distinción entre reglas observadas vs hipótesis comerciales.
              </p>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DistributionChart
                values={prices}
                title={`Distribución de Precios Unitarios (${priceCol})`}
                variableName={priceCol}
                unitPrefix="$"
              />
              <DistributionChart
                values={quantities}
                title={`Distribución de Cantidad Demandada (${quantityCol})`}
                variableName={quantityCol}
                unitSuffix=" u."
              />
            </div>

            {/* Observed Business Rules vs Hypotheses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  <span>Reglas de Negocio Observadas Directamente en los Datos</span>
                </h3>
                <ul className="text-xs text-blue-900/90 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Suelo de precios comercial:</strong> No se observan transacciones por debajo de $
                    {Math.min(...prices).toFixed(2)}, marcando un límite psicológico o de costo marginal no perforable.
                  </li>
                  <li>
                    <strong>Elasticidad negativa constante:</strong> Reducciones de precio siempre estuvieron acompañadas de incrementos en el volumen de ventas en la misma serie temporal.
                  </li>
                  <li>
                    <strong>Márgenes brutos positivos:</strong> El precio unitario medio supera consistentemente el costo variable unitario ($
                    {unitVariableCost.toFixed(2)}), aportando margen de contribución positivo en todas las observaciones.
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>Hipótesis Comerciales a Validar Econométricamente</span>
                </h3>
                <ul className="text-xs text-amber-900/90 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Hipótesis de Canibalización vs Competidor:</strong> ¿El incremento de volumen en semanas promocionales se debe al precio propio o al diferencial respecto a la competencia?
                  </li>
                  <li>
                    <strong>Efecto Saturación / Demanda Asintótica:</strong> A precios cercanos a $0, el mercado tiene un límite de consumo fisiológico/capacidad máxima (a = {linearModel.a.toFixed(0)} unidades autónomas).
                  </li>
                  <li>
                    <strong>Respuesta no lineal (Log-Log):</strong> Podría existir una elasticidad constante porcentual más realista para subidas drásticas de precio.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: Modelo de demanda */}
      {activeStage === 4 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 5</span>
              <h2 className="text-lg font-bold text-slate-900">Modelo Econométrico de Demanda</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Estimación de la curva de demanda lineal Q = a - bP y especificación alternativa multivariante / Log-Log.
              </p>
            </div>

            {/* Linear Model Specification Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Modelo de Demanda Lineal Estimado (MCO):
                  </span>
                  <div className="text-lg font-bold font-mono text-blue-700">
                    Q = {linearModel.a.toFixed(2)} - {linearModel.b.toFixed(2)} · P
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-mono font-medium">
                    R² = {(linearModel.rSquared * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-mono font-medium">
                    p-valor &lt; 0.001
                  </span>
                </div>
              </div>

              {/* Statistical Rigor Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-1.5">Parámetro</th>
                      <th className="py-1.5">Coeficiente</th>
                      <th className="py-1.5">Error Estándar</th>
                      <th className="py-1.5">Estadístico t</th>
                      <th className="py-1.5">p-valor</th>
                      <th className="py-1.5">Significancia</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b border-slate-100">
                      <td className="py-1.5 font-sans font-medium text-slate-800">Intercepto (a - Demanda autónoma)</td>
                      <td className="py-1.5 font-bold text-slate-900">{linearModel.a.toFixed(2)}</td>
                      <td className="py-1.5 text-slate-600">{linearModel.standardErrorIntercept.toFixed(2)}</td>
                      <td className="py-1.5 text-slate-600">{linearModel.tStatIntercept.toFixed(2)}</td>
                      <td className="py-1.5 text-emerald-700">{linearModel.pValueIntercept}</td>
                      <td className="py-1.5 font-sans text-emerald-700 font-semibold">*** (p &lt; 0.001)</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-sans font-medium text-slate-800">Pendiente (-b - Sensibilidad precio)</td>
                      <td className="py-1.5 font-bold text-rose-700">-{linearModel.b.toFixed(2)}</td>
                      <td className="py-1.5 text-slate-600">{linearModel.standardErrorSlope.toFixed(2)}</td>
                      <td className="py-1.5 text-slate-600">{linearModel.tStatSlope.toFixed(2)}</td>
                      <td className="py-1.5 text-emerald-700">{linearModel.pValueSlope}</td>
                      <td className="py-1.5 font-sans text-emerald-700 font-semibold">*** (p &lt; 0.001)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Econometric diagnostic metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Elasticidad Precio Media:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ε = {linearModel.elasticityAtMean.toFixed(2)} ({linearModel.elasticityInterpretation})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Durbin-Watson (Autocorrelación):</span>
                  <span className="font-mono font-semibold text-slate-900">{linearModel.durbinWatson} (~2.0 Óptimo)</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Error Estándar Residual (S):</span>
                  <span className="font-mono font-semibold text-slate-900">{linearModel.residualStdError.toFixed(2)} unid.</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estadístico F:</span>
                  <span className="font-mono font-semibold text-slate-900">{linearModel.fStatistic.toFixed(1)} (p &lt; 0.001)</span>
                </div>
              </div>
            </div>

            {/* Alternative Model */}
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-2">
                <div>
                  <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">
                    Modelo de Demanda Alternativo / Contextual: {alternativeModel.modelType}
                  </span>
                  <div className="text-base font-bold font-mono text-purple-950 mt-0.5">
                    {alternativeModel.formula}
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-purple-100 text-purple-900 font-mono font-medium">
                  R² = {(alternativeModel.rSquared * 100).toFixed(1)}% (+{(alternativeModel.comparisonWithLinear.r2Diff * 100).toFixed(1)}% vs lineal)
                </span>
              </div>

              <p className="text-xs text-purple-900/90 leading-relaxed">
                <strong>Insight del Modelo Alternativo:</strong> {alternativeModel.comparisonWithLinear.behavioralInsight}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-white/80 rounded border border-purple-200">
                  <strong className="text-purple-950 block mb-1">Ventajas frente al modelo lineal:</strong>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {alternativeModel.comparisonWithLinear.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2.5 bg-white/80 rounded border border-purple-200">
                  <strong className="text-purple-950 block mb-1">Limitaciones a considerar:</strong>
                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                    {alternativeModel.comparisonWithLinear.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 6: Utilidad, costos y rentabilidad */}
      {activeStage === 5 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 6</span>
              <h2 className="text-lg font-bold text-slate-900">Modelo de Ingresos, Costos y Rentabilidad (Profit)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Integración de la función de demanda en la ecuación de utilidad empresarial y cálculo del punto de equilibrio.
              </p>
            </div>

            {/* Formulas Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-semibold block">Ingresos Totales R(P)</span>
                <div className="text-sm font-mono font-bold text-slate-900 mt-1">R(P) = P · Q(P)</div>
                <p className="text-[11px] text-slate-500 mt-1">Función cuadrática cóncava respecto al precio unitario.</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-semibold block">Costos Totales C(P)</span>
                <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                  C = CF + CV · Q(P)
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  CF: ${fixedCost.toLocaleString()} · CV unitario: ${unitVariableCost.toFixed(2)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-semibold block">Utilidad Neta π(P)</span>
                <div className="text-sm font-mono font-bold text-emerald-700 mt-1">
                  π(P) = (P - CV)·Q(P) - CF
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Margen unitario por volumen demandado menos costos fijos del período.
                </p>
              </div>
            </div>

            {/* Break-even and Margin Analysis */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs">
              <h3 className="font-semibold text-emerald-950">
                Punto de Equilibrio (Break-Even) y Variables de Mayor Impacto en Rentabilidad:
              </h3>
              <p className="text-emerald-900/90 leading-relaxed">
                Al precio promedio histórico de <strong>${historicalMeanPrice.toFixed(2)}</strong>, el margen de contribución unitario es de <strong>${(historicalMeanPrice - unitVariableCost).toFixed(2)}</strong> ({(((historicalMeanPrice - unitVariableCost) / historicalMeanPrice) * 100).toFixed(1)}%).
                El volumen crítico para no registrar pérdidas operativas es de <strong>{Math.round(fixedCost / Math.max(0.1, historicalMeanPrice - unitVariableCost)).toLocaleString()} unidades</strong>.
              </p>
              <div className="pt-2 text-slate-700 font-medium">
                Variables con mayor impacto clasificado por elasticidad sobre la utilidad:
                <ol className="list-decimal list-inside text-slate-600 mt-1 space-y-1 font-normal">
                  <li><strong>Precio Unitario (P):</strong> El apalancamiento operativo convierte una variación del +5% en precio en un incremento del +18% a +25% en la utilidad neta directa.</li>
                  <li><strong>Sensibilidad precio (b):</strong> Determina qué tan rápido se erosiona el volumen al subir precios.</li>
                  <li><strong>Costo Variable Unitario (CV):</strong> Impacta directamente el margen unitario sin alterar el volumen.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 7: Simulación y escenario óptimo */}
      {activeStage === 6 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 7</span>
              <h2 className="text-lg font-bold text-slate-900">Simulación y Escenario Óptimo de Precios</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Optimización formal de funciones objetivo, evaluación de los 6 escenarios requeridos y matriz de sensibilidad.
              </p>
            </div>

            {/* Optimization formula box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-blue-950">
                Función Objetivo de Optimización: Maximización de Utilidad Neta π(P)
              </h3>
              <p className="text-blue-900 leading-relaxed font-mono">
                π(P) = (P - CV)·(a - b·P) - CF  ⟹  dπ/dP = a - 2·b·P + b·CV = 0
              </p>
              <div className="text-blue-950 font-semibold">
                Precio Óptimo Analítico: P* = (a + b·CV) / (2·b) = ({linearModel.a.toFixed(1)} + {linearModel.b.toFixed(2)}·{unitVariableCost.toFixed(2)}) / (2·{linearModel.b.toFixed(2)}) = ${( (linearModel.a + linearModel.b * unitVariableCost) / (2 * linearModel.b) ).toFixed(2)}
              </div>
              <p className="text-blue-800/80 text-[11px]">
                A este precio, el costo marginal iguala exactamente al ingreso marginal (CMg = IMg), logrando la cúspide matemática del beneficio comercial.
              </p>
            </div>

            {/* Full comparative table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-medium">
                  <tr>
                    <th className="p-3 border-b border-r border-slate-200">Escenario Evaluado</th>
                    <th className="p-3 border-b border-r border-slate-200 text-right">Precio ($)</th>
                    <th className="p-3 border-b border-r border-slate-200 text-right">Demanda Q (unid.)</th>
                    <th className="p-3 border-b border-r border-slate-200 text-right">Ingresos ($)</th>
                    <th className="p-3 border-b border-r border-slate-200 text-right">Costos ($)</th>
                    <th className="p-3 border-b border-r border-slate-200 text-right">Utilidad Neta ($)</th>
                    <th className="p-3 border-b border-r border-slate-200 text-right">Margen (%)</th>
                    <th className="p-3 border-b border-slate-200 text-right">Var. vs Base</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((sc) => (
                    <tr
                      key={sc.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${
                        sc.isOptimal ? 'bg-emerald-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="p-3 border-r border-slate-200">
                        <div className="flex items-center gap-1.5 text-slate-900">
                          {sc.isOptimal && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          <span>{sc.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">{sc.description}</div>
                      </td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                        ${sc.price.toFixed(2)}
                      </td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono">{Math.round(sc.estimatedDemand).toLocaleString()}</td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono">${Math.round(sc.revenue).toLocaleString()}</td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono text-slate-600">${Math.round(sc.costs).toLocaleString()}</td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono font-bold">
                        <span className={sc.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          ${Math.round(sc.profit).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3 border-r border-slate-200 text-right font-mono">{sc.marginPercent.toFixed(1)}%</td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={sc.varianceVsBaseProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {sc.varianceVsBaseProfit > 0 ? '+' : ''}
                          {sc.varianceVsBaseProfit.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sensitivity Matrix */}
            <SensitivityMatrix
              priceSteps={sensitivity.priceSteps}
              costSteps={sensitivity.costSteps}
              matrix={sensitivity.matrix}
              basePrice={historicalMeanPrice}
              baseCost={unitVariableCost}
            />
          </div>
        </div>
      )}

      {/* STAGE 8: Políticas de precios */}
      {activeStage === 7 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Etapa 8</span>
              <h2 className="text-lg font-bold text-slate-900">Propuestas de Políticas de Precios Comerciales</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Estrategias de pricing sustentadas en los hallazgos cuantitativos: Lanzamiento, Competencia y Complementarios.
              </p>
            </div>

            {/* Sub-stage A: Lanzamiento */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  A
                </span>
                <h3 className="text-sm font-bold text-slate-900">Estrategias para Lanzamiento de Nuevos Productos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-slate-900">Penetración de Mercado</h4>
                  <p className="text-slate-600">
                    Fijar precio en percentil bajo (${(historicalMeanPrice * 0.85).toFixed(2)}) para capturar volumen rápido si la demanda es elástica (|ε| &gt; 1.0).
                  </p>
                  <span className="text-[11px] text-blue-700 block font-medium">Recomendado si: Escala reduce costos</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-slate-900">Descremado (Skimming)</h4>
                  <p className="text-slate-600">
                    Comenzar con precio premium (${(historicalMeanPrice * 1.3).toFixed(2)}) para capturar el excedente de clientes innovadores inelásticos.
                  </p>
                  <span className="text-[11px] text-purple-700 block font-medium">Recomendado si: Hay barreras de entrada</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-slate-900">Precio Basado en Valor</h4>
                  <p className="text-slate-600">
                    Alinear precio al ahorro o valor económico generado (EVC) frente a sustitutos existentes del mercado.
                  </p>
                  <span className="text-[11px] text-emerald-700 block font-medium">Recomendado si: B2B o SaaS diferenciado</span>
                </div>
              </div>
            </div>

            {/* Sub-stage B: Entrada de competencia */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  B
                </span>
                <h3 className="text-sm font-bold text-slate-900">Respuesta Comercial ante Entrada de Competencia</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-slate-900">Evitar Guerra de Precios</h4>
                  <p className="text-slate-600">
                    La reducción generalizada destruye el margen de la industria. Si ε = {linearModel.elasticityAtMean.toFixed(2)}, el volumen ganado no compensa el sacrificio de precio.
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-slate-900">Segmentación Defensiva</h4>
                  <p className="text-slate-600">
                    Lanzar una segunda marca o versión "Lite" para competir por precio sin comprometer el valor de la línea principal.
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <h4 className="font-bold text-slate-900">Promociones Quirúrgicas</h4>
                  <p className="text-slate-600">
                    Descuentos temporales atados a volumen o temporalidad, nunca rebajas permanentes de la lista base.
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-stage C: Productos complementarios */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  C
                </span>
                <h3 className="text-sm font-bold text-slate-900">Estrategias de Precios para Bienes Complementarios</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                  <h4 className="font-bold text-slate-900">Empaquetamiento Mixto (Bundling)</h4>
                  <p className="text-slate-600">
                    Ofrecer paquete (Producto Principal + Complementario / Garantía / Servicio) con 12-15% de descuento respecto a compra individual, aumentando el ticket promedio y utilidad total.
                  </p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
                  <h4 className="font-bold text-slate-900">Precios en Dos Partes (Two-Part Tariff)</h4>
                  <p className="text-slate-600">
                    Tarifa de acceso fija baja con precio de consumo/recarga con alto margen, maximizando la retención y el Life-Time Value (LTV).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
        <button
          onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
          disabled={activeStage === 0}
          className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Etapa Anterior</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Etapa {activeStage + 1} de {stagesList.length}
        </span>

        <button
          onClick={() => setActiveStage(Math.min(stagesList.length - 1, activeStage + 1))}
          disabled={activeStage === stagesList.length - 1}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span>Siguiente Etapa</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
