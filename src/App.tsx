/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { DatasetItem, ColumnMapping } from './types/pricing';
import {
  characterizeVariables,
  runDataQualityAudit,
  detectSectorFromData,
  estimateLinearDemand,
  estimateAlternativeDemand,
  generateCommercialScenarios,
  generateSensitivityMatrix,
  calculateStats,
} from './utils/econometrics';
import { TopNavigation } from './components/TopNavigation';
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { StageExplorer } from './components/views/StageExplorer';
import { InteractiveSimulator } from './components/views/InteractiveSimulator';
import { ExecutiveReport } from './components/views/ExecutiveReport';
import { DataViewer } from './components/views/DataViewer';
import { FileUploadModal } from './components/FileUploadModal';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { DataCleaningModal } from './components/DataCleaningModal';

export default function App() {
  // Current active dataset
  const [currentDataset, setCurrentDataset] = useState<DatasetItem>(SAMPLE_DATASETS[0]);

  // Current column mapping (can be adjusted by user)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(SAMPLE_DATASETS[0].suggestedMapping);

  // Active view
  const [activeView, setActiveView] = useState<'dashboard' | 'stages' | 'simulator' | 'report' | 'data'>('dashboard');
  const [initialStageIdx, setInitialStageIdx] = useState<number>(0);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);

  // Raw dataset columns
  const rawColumns = useMemo(() => {
    if (currentDataset.data.length === 0) return [];
    return Object.keys(currentDataset.data[0]);
  }, [currentDataset]);

  // Ensure column mapping has valid keys for current dataset
  const activePriceCol = useMemo(() => {
    if (columnMapping.priceCol && rawColumns.includes(columnMapping.priceCol)) {
      return columnMapping.priceCol;
    }
    const found = rawColumns.find((c) => /precio|price|tarifa|coste/i.test(c));
    return found || rawColumns[0] || '';
  }, [columnMapping.priceCol, rawColumns]);

  const activeQuantityCol = useMemo(() => {
    if (columnMapping.quantityCol && rawColumns.includes(columnMapping.quantityCol)) {
      return columnMapping.quantityCol;
    }
    const found = rawColumns.find((c) => /cantidad|unidades|quantity|demand|volumen|q/i.test(c));
    return found || rawColumns[1] || rawColumns[0] || '';
  }, [columnMapping.quantityCol, rawColumns]);

  const activeCostCol = useMemo(() => {
    if (columnMapping.costCol && rawColumns.includes(columnMapping.costCol)) {
      return columnMapping.costCol;
    }
    return rawColumns.find((c) => /costo_var|variable_cost|costo_unit/i.test(c));
  }, [columnMapping.costCol, rawColumns]);

  // Variable characterization (Etapa 2)
  const metadata = useMemo(() => {
    return characterizeVariables(currentDataset.data, rawColumns);
  }, [currentDataset.data, rawColumns]);

  // Data Quality Audit & Cleaned Data (Etapa 3)
  const qualityAudit = useMemo(() => {
    return runDataQualityAudit(currentDataset.data, metadata, activePriceCol, activeQuantityCol);
  }, [currentDataset.data, metadata, activePriceCol, activeQuantityCol]);

  const cleanedData = qualityAudit.cleanedData;
  const qualityReport = qualityAudit.report;

  // Sector detection (Etapa 1)
  const sectorDetection = useMemo(() => {
    return detectSectorFromData(rawColumns, currentDataset.data.slice(0, 10));
  }, [rawColumns, currentDataset.data]);

  // Descriptive statistics for price & demand
  const priceStats = useMemo(() => {
    const prices = cleanedData.map((d) => Number(d[activePriceCol])).filter((v) => !isNaN(v));
    return calculateStats(prices);
  }, [cleanedData, activePriceCol]);

  const quantityStats = useMemo(() => {
    const quantities = cleanedData.map((d) => Number(d[activeQuantityCol])).filter((v) => !isNaN(v));
    return calculateStats(quantities);
  }, [cleanedData, activeQuantityCol]);

  const historicalMeanPrice = priceStats.mean || 10;
  const historicalMeanQuantity = quantityStats.mean || 100;

  // Unit Variable Cost and Fixed Cost
  const unitVariableCost = useMemo(() => {
    if (activeCostCol) {
      const costs = cleanedData.map((d) => Number(d[activeCostCol])).filter((v) => !isNaN(v));
      const st = calculateStats(costs);
      if (st.mean > 0) return Number(st.mean.toFixed(2));
    }
    return currentDataset.defaultUnitCost || Number((historicalMeanPrice * 0.4).toFixed(2));
  }, [activeCostCol, cleanedData, currentDataset.defaultUnitCost, historicalMeanPrice]);

  const fixedCost = useMemo(() => {
    if (columnMapping.fixedCost !== undefined) return columnMapping.fixedCost;
    return currentDataset.defaultFixedCost || 20000;
  }, [columnMapping.fixedCost, currentDataset.defaultFixedCost]);

  // Stage 5: Linear Demand Model (OLS)
  const linearModel = useMemo(() => {
    return estimateLinearDemand(cleanedData, activePriceCol, activeQuantityCol);
  }, [cleanedData, activePriceCol, activeQuantityCol]);

  // Stage 5B: Alternative Demand Model (Multivariate with competitor or Log-Log)
  const alternativeModel = useMemo(() => {
    return estimateAlternativeDemand(
      cleanedData,
      activePriceCol,
      activeQuantityCol,
      columnMapping.competitorPriceCol,
      linearModel.rSquared
    );
  }, [cleanedData, activePriceCol, activeQuantityCol, columnMapping.competitorPriceCol, linearModel.rSquared]);

  // Stage 7: Commercial Scenarios
  const scenarios = useMemo(() => {
    return generateCommercialScenarios(
      linearModel,
      fixedCost,
      unitVariableCost,
      historicalMeanPrice,
      priceStats.min,
      priceStats.max
    );
  }, [linearModel, fixedCost, unitVariableCost, historicalMeanPrice, priceStats.min, priceStats.max]);

  // Stage 7B: 2D Sensitivity Matrix
  const sensitivity = useMemo(() => {
    return generateSensitivityMatrix(historicalMeanPrice, unitVariableCost, fixedCost, linearModel);
  }, [historicalMeanPrice, unitVariableCost, fixedCost, linearModel]);

  // Live simulation price
  const [simulatedPrice, setSimulatedPrice] = useState<number>(Number(historicalMeanPrice.toFixed(2)));

  // Sync simulation price when dataset changes
  React.useEffect(() => {
    setSimulatedPrice(Number(historicalMeanPrice.toFixed(2)));
  }, [historicalMeanPrice]);

  // Handle dataset switch
  const handleSelectDataset = (ds: DatasetItem) => {
    setCurrentDataset(ds);
    setColumnMapping(ds.suggestedMapping);
  };

  // Handle uploaded dataset
  const handleDatasetLoaded = (newDataset: DatasetItem) => {
    setCurrentDataset(newDataset);
    setColumnMapping(newDataset.suggestedMapping);
    setActiveView('stages');
    setInitialStageIdx(0);
  };

  // Stage navigation helper
  const handleNavigateToStage = (stageIdx: number) => {
    setInitialStageIdx(stageIdx);
    setActiveView('stages');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Navigation */}
      <TopNavigation
        currentDataset={currentDataset}
        sampleDatasets={SAMPLE_DATASETS}
        onSelectDataset={handleSelectDataset}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenMapping={() => setIsMappingOpen(true)}
        activeView={activeView}
        onChangeView={setActiveView}
        onExportReportPDF={() => {
          setActiveView('report');
          setTimeout(() => window.print(), 350);
        }}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <OverviewDashboard
            data={cleanedData}
            priceCol={activePriceCol}
            quantityCol={activeQuantityCol}
            linearModel={linearModel}
            alternativeModel={alternativeModel}
            scenarios={scenarios}
            sectorDetection={sectorDetection}
            fixedCost={fixedCost}
            unitVariableCost={unitVariableCost}
            historicalMeanPrice={historicalMeanPrice}
            historicalMeanQuantity={historicalMeanQuantity}
            simulatedPrice={simulatedPrice}
            onPriceChange={setSimulatedPrice}
            sensitivity={sensitivity}
            onNavigateToStage={handleNavigateToStage}
            onNavigateToReport={() => setActiveView('report')}
            onNavigateToSimulator={() => setActiveView('simulator')}
          />
        )}

        {activeView === 'stages' && (
          <StageExplorer
            data={currentDataset.data}
            cleanedData={cleanedData}
            columns={rawColumns}
            metadata={metadata}
            qualityReport={qualityReport}
            sectorDetection={sectorDetection}
            linearModel={linearModel}
            alternativeModel={alternativeModel}
            scenarios={scenarios}
            fixedCost={fixedCost}
            unitVariableCost={unitVariableCost}
            priceCol={activePriceCol}
            quantityCol={activeQuantityCol}
            historicalMeanPrice={historicalMeanPrice}
            historicalMeanQuantity={historicalMeanQuantity}
            sensitivity={sensitivity}
            initialStage={initialStageIdx}
          />
        )}

        {activeView === 'simulator' && (
          <InteractiveSimulator
            data={cleanedData}
            priceCol={activePriceCol}
            quantityCol={activeQuantityCol}
            linearModel={linearModel}
            alternativeModel={alternativeModel}
            baseScenarios={scenarios}
            defaultFixedCost={fixedCost}
            defaultUnitCost={unitVariableCost}
            historicalMeanPrice={historicalMeanPrice}
          />
        )}

        {activeView === 'report' && (
          <ExecutiveReport
            datasetName={currentDataset.name}
            data={currentDataset.data}
            cleanedData={cleanedData}
            columns={rawColumns}
            metadata={metadata}
            qualityReport={qualityReport}
            sectorDetection={sectorDetection}
            linearModel={linearModel}
            alternativeModel={alternativeModel}
            scenarios={scenarios}
            fixedCost={fixedCost}
            unitVariableCost={unitVariableCost}
            priceCol={activePriceCol}
            quantityCol={activeQuantityCol}
            historicalMeanPrice={historicalMeanPrice}
            historicalMeanQuantity={historicalMeanQuantity}
            sensitivity={sensitivity}
          />
        )}

        {activeView === 'data' && (
          <DataViewer
            data={currentDataset.data}
            cleanedData={cleanedData}
            columns={rawColumns}
            metadata={metadata}
            qualityReport={qualityReport}
            onOpenQualityAudit={() => setIsCleaningModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      <ColumnMappingModal
        isOpen={isMappingOpen}
        onClose={() => setIsMappingOpen(false)}
        columns={rawColumns}
        currentMapping={columnMapping}
        onSaveMapping={setColumnMapping}
      />

      <DataCleaningModal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        report={qualityReport}
        metadata={metadata}
        cleanRowsCount={cleanedData.length}
      />
    </div>
  );
}
