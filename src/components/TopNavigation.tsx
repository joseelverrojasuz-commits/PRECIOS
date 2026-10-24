import React from 'react';
import { Upload, FileSpreadsheet, Settings, Download, BookOpen, BarChart3, Sliders, Database } from 'lucide-react';
import { DatasetItem } from '../types/pricing';

interface Props {
  currentDataset: DatasetItem;
  sampleDatasets: DatasetItem[];
  onSelectDataset: (ds: DatasetItem) => void;
  onOpenUpload: () => void;
  onOpenMapping: () => void;
  activeView: 'dashboard' | 'stages' | 'simulator' | 'report' | 'data';
  onChangeView: (view: 'dashboard' | 'stages' | 'simulator' | 'report' | 'data') => void;
  onExportReportPDF: () => void;
}

export const TopNavigation: React.FC<Props> = ({
  currentDataset,
  sampleDatasets,
  onSelectDataset,
  onOpenUpload,
  onOpenMapping,
  activeView,
  onChangeView,
  onExportReportPDF,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-semibold text-sm shadow-xs">
                P€
              </span>
              <span>PrecioMetrix</span>
            </span>
            <div className="hidden lg:flex items-center text-xs text-slate-400">
              <span className="text-slate-300">/</span>
              <span className="ml-2 font-medium text-slate-600 truncate max-w-[200px]" title={currentDataset.name}>
                {currentDataset.name}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-Line, clean tabs) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Resumen Ejecutivo</span>
            </button>

            <button
              onClick={() => onChangeView('stages')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'stages'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Etapas 1-8</span>
            </button>

            <button
              onClick={() => onChangeView('simulator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'simulator'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulador Comercial</span>
            </button>

            <button
              onClick={() => onChangeView('report')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'report'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Informe 17 Secciones</span>
            </button>

            <button
              onClick={() => onChangeView('data')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeView === 'data'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Base & Calidad</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sample Dataset selector dropdown */}
            <div className="relative hidden md:block">
              <select
                aria-label="Seleccionar caso empresarial precargado"
                value={currentDataset.id}
                onChange={(e) => {
                  const found = sampleDatasets.find((d) => d.id === e.target.value);
                  if (found) onSelectDataset(found);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[180px] truncate"
              >
                {sampleDatasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.sectorTag}: {ds.name.split(':')[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenMapping}
              title="Configurar mapeo de columnas (Precio, Demanda, Costos)"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenUpload}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cargar Datos</span>
            </button>

            <button
              onClick={onExportReportPDF}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
