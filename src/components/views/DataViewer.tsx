import React, { useState } from 'react';
import { ColumnMetadata, DataQualityReport } from '../../types/pricing';
import { Search, Filter, ShieldCheck, Download, Table } from 'lucide-react';

interface Props {
  data: Record<string, any>[];
  cleanedData: Record<string, any>[];
  columns: string[];
  metadata: ColumnMetadata[];
  qualityReport: DataQualityReport;
  onOpenQualityAudit: () => void;
}

export const DataViewer: React.FC<Props> = ({
  data,
  cleanedData,
  columns,
  metadata,
  qualityReport,
  onOpenQualityAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'clean' | 'raw'>('clean');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const currentData = viewMode === 'clean' ? cleanedData : data;

  const filteredRows = currentData.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const pagedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleExportDataCSV = () => {
    const headers = columns.join(',');
    const rows = currentData.map((r) => columns.map((c) => JSON.stringify(r[c] ?? '')).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Datos_${viewMode === 'clean' ? 'Limpios' : 'Brutos'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <Table className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">Explorador de Datos y Auditoría de Calidad</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspección tabular registro a registro, alternancia entre datos limpios y brutos y diagnóstico de consistencia
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQualityAudit}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ver Auditoría de Limpieza</span>
            </button>
            <button
              onClick={handleExportDataCSV}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Mode Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en cualquier columna..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Segmented Filter: Clean vs Raw */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-end sm:self-auto text-xs">
            <button
              onClick={() => {
                setViewMode('clean');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors font-medium ${
                viewMode === 'clean' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Base Limpia ({cleanedData.length})
            </button>
            <button
              onClick={() => {
                setViewMode('raw');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-md transition-colors font-medium ${
                viewMode === 'raw' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Base Bruta ({data.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5 border-r border-slate-200 text-center w-10">#</th>
                {columns.map((c) => (
                  <th key={c} className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                    <div>{c}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {metadata.find((m) => m.name === c)?.type.replace('_', ' ') || ''}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-8 text-center text-xs text-slate-400">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, rIdx) => {
                  const absoluteIdx = (currentPage - 1) * rowsPerPage + rIdx + 1;
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50 border-b border-slate-100">
                      <td className="p-2.5 border-r border-slate-200 text-center font-mono text-[11px] text-slate-400">
                        {absoluteIdx}
                      </td>
                      {columns.map((c) => {
                        const val = row[c];
                        const isNum = typeof val === 'number';
                        return (
                          <td
                            key={c}
                            className={`p-2.5 border-r border-slate-200 whitespace-nowrap ${
                              isNum ? 'font-mono text-right text-slate-800' : 'text-slate-700'
                            }`}
                          >
                            {val !== null && val !== undefined ? (
                              isNum ? (
                                Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)
                              ) : (
                                String(val)
                              )
                            ) : (
                              <span className="text-slate-300 italic">null</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Mostrando registros {(currentPage - 1) * rowsPerPage + 1} a{' '}
            {Math.min(currentPage * rowsPerPage, filteredRows.length)} de {filteredRows.length}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-2 font-mono text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
