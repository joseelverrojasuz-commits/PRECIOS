import React, { useState } from 'react';
import { X, Check, Sliders, DollarSign, Package, Calendar, Tag, ShieldAlert } from 'lucide-react';
import { ColumnMapping } from '../types/pricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columns: string[];
  currentMapping: ColumnMapping;
  onSaveMapping: (newMapping: ColumnMapping) => void;
}

export const ColumnMappingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  columns,
  currentMapping,
  onSaveMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...currentMapping });

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveMapping(mapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mapeo de Variables Econométricas</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Asigna las columnas de tu base a los roles requeridos para el modelo de demanda y rentabilidad
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Precio (Obligatorio) */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <label className="text-xs font-semibold text-blue-950 flex items-center gap-1.5 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Variable de Precio Unitario (P) * Obligatorio</span>
            </label>
            <p className="text-[11px] text-blue-800/80 mb-2">
              Precio cobrado por unidad transaccionada (ej. Precio_Venta, ADR, Tarifa, Cuota).
            </p>
            <select
              value={mapping.priceCol}
              onChange={(e) => setMapping({ ...mapping, priceCol: e.target.value })}
              className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad (Obligatorio) */}
          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <label className="text-xs font-semibold text-blue-950 flex items-center gap-1.5 mb-1">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Variable de Cantidad Demandada (Q) * Obligatorio</span>
            </label>
            <p className="text-[11px] text-blue-800/80 mb-2">
              Volumen de unidades físicas vendidas, contratos o transacciones registradas.
            </p>
            <select
              value={mapping.quantityCol}
              onChange={(e) => setMapping({ ...mapping, quantityCol: e.target.value })}
              className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Costo Variable Unitario */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Costo Variable Unitario (CV)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Columna con el costo marginal directo por unidad (o se tomará el valor predeterminado).
            </p>
            <select
              value={mapping.costCol || ''}
              onChange={(e) => setMapping({ ...mapping, costCol: e.target.value || undefined })}
              className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- No especificado en columna (usar parámetro) --</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Costo Fijo */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="text-xs font-semibold text-slate-900 mb-1 block">
              Costo Fijo del Período / Operación ($ CF)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Costos fijos asignados al producto para el cálculo del punto de equilibrio y utilidad neta.
            </p>
            <input
              type="number"
              value={mapping.fixedCost ?? 20000}
              onChange={(e) => setMapping({ ...mapping, fixedCost: Number(e.target.value) || 0 })}
              className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 font-mono focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Precio Competidor */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Precio del Competidor / Benchmark (Demanda Alternativa)</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Permite estimar elasticidad cruzada y modelo multivariante con efecto competencia.
            </p>
            <select
              value={mapping.competitorPriceCol || ''}
              onChange={(e) => setMapping({ ...mapping, competitorPriceCol: e.target.value || undefined })}
              className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sin columna de competidor --</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Segmento / Canal */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Segmento, Canal o Categoría</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Variable cualitativa para evaluar diferenciación de precios y elasticidad por canal.
            </p>
            <select
              value={mapping.segmentCol || ''}
              onChange={(e) => setMapping({ ...mapping, segmentCol: e.target.value || undefined })}
              className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sin segmentación --</option>
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Mapeo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
