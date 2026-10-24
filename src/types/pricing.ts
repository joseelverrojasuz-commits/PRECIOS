export type VariableType =
  | 'cuantitativa_continua'
  | 'cuantitativa_discreta'
  | 'cualitativa_nominal'
  | 'cualitativa_ordinal'
  | 'fecha_tiempo'
  | 'identificador'
  | 'otra';

export interface ColumnMetadata {
  name: string;
  type: VariableType;
  description: string;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  topCategories?: { value: string; count: number }[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  potentialQualityIssues: string[];
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  missingCells: number;
  missingPercentage: number;
  duplicateRows: number;
  outlierCounts: Record<string, number>;
  impossibleValuesCount: number;
  formatIssuesCount: number;
  appliedRules: CleaningRule[];
}

export interface CleaningRule {
  id: string;
  field: string;
  issue: string;
  ruleDescription: string;
  action: 'filter_invalid' | 'impute_median' | 'impute_mean' | 'winsorize' | 'custom';
  appliedCount: number;
  justification: string;
}

export interface ColumnMapping {
  priceCol: string;
  quantityCol: string;
  costCol?: string; // unit variable cost
  fixedCost?: number; // optional fixed cost input or column
  dateCol?: string;
  productCol?: string;
  segmentCol?: string;
  channelCol?: string;
  competitorPriceCol?: string;
  promotionCol?: string;
}

export interface SectorDetection {
  sector: string;
  industry: string;
  confidence: 'Alta' | 'Media' | 'Baja';
  clues: string[];
  probableAlternative?: string;
}

export interface LinearRegressionResult {
  a: number; // intercept (autonomous demand)
  b: number; // slope (price sensitivity: -b)
  rSquared: number;
  adjustedRSquared: number;
  fStatistic: number;
  standardErrorSlope: number;
  standardErrorIntercept: number;
  tStatSlope: number;
  pValueSlope: number;
  tStatIntercept: number;
  pValueIntercept: number;
  residualStdError: number;
  durbinWatson: number;
  elasticityAtMean: number;
  arcElasticity?: number;
  elasticityInterpretation: 'Inelástica' | 'Unitaria' | 'Elástica';
  residuals: number[];
  fittedValues: number[];
  heteroscedasticityWarning?: boolean;
}

export interface AlternativeModelResult {
  modelType: 'Multivariante con Competencia' | 'Log-Log (Elasticidad Constante)' | 'Segmentado';
  formula: string;
  rSquared: number;
  adjustedRSquared: number;
  coefficients: {
    variable: string;
    coefficient: number;
    stdError: number;
    tStat: number;
    pValue: number;
  }[];
  notes: string[];
  comparisonWithLinear: {
    r2Diff: number;
    behavioralInsight: string;
    pros: string[];
    cons: string[];
  };
}

export interface ProfitModelParameters {
  fixedCost: number;
  unitVariableCost: number;
  meanHistoricalPrice: number;
  meanHistoricalQuantity: number;
}

export interface CommercialScenario {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDemand: number;
  revenue: number;
  costs: number;
  profit: number;
  marginPercent: number;
  breakEvenQuantity: number;
  varianceVsBaseProfit: number;
  varianceVsBaseRevenue: number;
  isOptimal?: boolean;
  objective?: string;
}

export interface SensitivityMatrixCell {
  price: number;
  variableCost: number;
  demand: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
}

export interface PricingPolicyRecommendation {
  area: 'Lanzamiento' | 'Entrada de Competencia' | 'Productos Complementarios';
  strategyName: string;
  description: string;
  econometricRationale: string;
  conditions: string[];
  implementationSteps: string[];
  risks: string[];
}

export interface DatasetItem {
  id: string;
  name: string;
  sectorTag: string;
  description: string;
  data: Record<string, any>[];
  suggestedMapping: ColumnMapping;
  defaultFixedCost: number;
  defaultUnitCost: number;
}
