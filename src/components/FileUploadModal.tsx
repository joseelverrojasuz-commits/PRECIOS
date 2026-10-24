import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { parseUploadedFile, ParsedFileResult } from '../utils/fileParser';
import { DatasetItem } from '../types/pricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (newDataset: DatasetItem) => void;
}

export const FileUploadModal: React.FC<Props> = ({ isOpen, onClose, onDatasetLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedFileResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await parseUploadedFile(file);
      if (result.error) {
        setErrorMessage(result.error);
        setParsedResult(null);
      } else if (result.rows.length === 0) {
        setErrorMessage('El archivo no contiene filas de datos legibles.');
        setParsedResult(null);
      } else {
        setParsedResult(result);
      }
    } catch (err: any) {
      setErrorMessage(`Fallo al leer el archivo: ${err?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult) return;

    // Detect likely price and quantity columns
    const cols = parsedResult.columns;
    let priceCol = cols.find((c) => /precio|price|tarifa|coste_unitario|p_unit/i.test(c)) || cols[0];
    let quantityCol = cols.find((c) => /cantidad|unidades|quantity|demand|volumen|q/i.test(c)) || cols[1] || cols[0];
    let costCol = cols.find((c) => /costo_var|variable_cost|costo_unit/i.test(c));
    let dateCol = cols.find((c) => /fecha|date|semana|mes|periodo/i.test(c));
    let compCol = cols.find((c) => /competidor|comp|rival|mercado/i.test(c));
    let segCol = cols.find((c) => /segmento|canal|categoria|tier/i.test(c));

    const newDataset: DatasetItem = {
      id: `custom_${Date.now()}`,
      name: parsedResult.fileName.replace(/\.[^/.]+$/, ''),
      sectorTag: 'Base Personalizada Cargada',
      description: `Archivo cargado por el usuario (${parsedResult.fileName}) con ${parsedResult.totalRows} registros y ${parsedResult.columns.length} variables.`,
      defaultFixedCost: 20000,
      defaultUnitCost: 10,
      suggestedMapping: {
        priceCol,
        quantityCol,
        costCol,
        fixedCost: 20000,
        dateCol,
        competitorPriceCol: compCol,
        segmentCol: segCol,
      },
      data: parsedResult.rows,
    };

    onDatasetLoaded(newDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Importar Base de Datos Comercial</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formatos soportados: CSV, Excel (.xlsx, .xls), JSON y TXT delimitado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!parsedResult ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleProcessFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                Arrastra tu archivo aquí o haz clic para examinar
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                CSV, Excel (.xlsx, .xls), JSON o TXT (con encabezados en la primera fila)
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
                <span>Detección automática de delimitadores (coma, punto y coma, tabulador)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-950">
                      Archivo cargado con éxito: {parsedResult.fileName}
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      {parsedResult.totalRows.toLocaleString()} registros detectados · {parsedResult.columns.length} columnas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setParsedResult(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 underline"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Preview table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">
                  Vista previa de las primeras 5 filas (Etapa 1):
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-48 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-medium">
                      <tr>
                        {parsedResult.columns.map((c) => (
                          <th key={c} className="p-2 border-b border-r border-slate-200 whitespace-nowrap">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedResult.previewRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {parsedResult.columns.map((c) => (
                            <td key={c} className="p-2 border-b border-r border-slate-200 whitespace-nowrap font-mono text-[11px]">
                              {String(row[c] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-4 p-3 text-center text-xs text-blue-600 animate-pulse">
              Analizando estructura de columnas y codificación de datos...
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parsedResult}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
          >
            Iniciar Estudio Econométrico
          </button>
        </div>
      </div>
    </div>
  );
};
