import React from 'react';
import { X, CheckCircle, ShieldCheck, AlertTriangle, Filter, Database } from 'lucide-react';
import { DataQualityReport, ColumnMetadata } from '../types/pricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: DataQualityReport;
  metadata: ColumnMetadata[];
  cleanRowsCount: number;
}

export const DataCleaningModal: React.FC<Props> = ({
  isOpen,
  onClose,
  report,
  metadata,
  cleanRowsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Diagnóstico de Calidad y Reglas de Limpieza (Etapa 3)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocolo metodológico de validación, filtrado justificado y tratamiento de inconsistencias
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Summary KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[11px] text-slate-500 block">Registros Brutos</span>
              <span className="text-base font-semibold font-mono text-slate-800">
                {report.totalRows.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[11px] text-slate-500 block">Registros Limpios</span>
              <span className="text-base font-semibold font-mono text-emerald-700">
                {cleanRowsCount.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[11px] text-slate-500 block">Duplicados Excluidos</span>
              <span className="text-base font-semibold font-mono text-slate-800">
                {report.duplicateRows}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[11px] text-slate-500 block">% Datos Faltantes</span>
              <span className="text-base font-semibold font-mono text-slate-800">
                {report.missingPercentage}%
              </span>
            </div>
          </div>

          {/* Applied Rules Documentation */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              Reglas de Tratamiento de Datos Documentadas y Justificadas:
            </h3>

            {report.appliedRules.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Base limpia y consistente: no se requirieron filtros ni transformaciones de contingencia.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {report.appliedRules.map((rule) => (
                  <div key={rule.id} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        <span>{rule.issue}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {rule.appliedCount} afectadas
                      </span>
                    </div>
                    <p className="text-slate-600 mb-1">
                      <strong className="text-slate-800">Regla:</strong> {rule.ruleDescription}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      <strong className="text-slate-700">Justificación Econométrica:</strong> {rule.justification}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quality Audit by Variable */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              Auditoría por Variable (Identificación de Alertas):
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-medium">
                  <tr>
                    <th className="p-2 border-b border-r border-slate-200">Variable</th>
                    <th className="p-2 border-b border-r border-slate-200">Tipo</th>
                    <th className="p-2 border-b border-r border-slate-200">Faltantes (%)</th>
                    <th className="p-2 border-b border-slate-200">Alertas de Calidad</th>
                  </tr>
                </thead>
                <tbody>
                  {metadata.map((m) => (
                    <tr key={m.name} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-2 border-r border-slate-200 font-mono font-medium text-slate-800">
                        {m.name}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-600">
                        {m.type.replace('_', ' ')}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono text-slate-600">
                        {m.missingPercentage}% ({m.missingCount})
                      </td>
                      <td className="p-2 text-slate-600">
                        {m.potentialQualityIssues.length > 0 ? (
                          <div className="space-y-0.5">
                            {m.potentialQualityIssues.map((issue, idx) => (
                              <div key={idx} className="text-amber-700 flex items-center gap-1 text-[11px]">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{issue}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Óptimo / Sin anomalías</span>
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

        <div className="flex items-center justify-end px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
