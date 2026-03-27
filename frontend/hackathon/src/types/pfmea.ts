/**
 * TypeScript interfaces for PFMEA data models
 * Matches backend schema from agent/src/schemas.py and agent/src/api_models.py
 */

/**
 * Risk level categorization based on probability of harm
 * Maps to ProbabilityOfHarmScale enum in backend
 */
export type RiskLevel = 'remote' | 'low' | 'moderate' | 'high' | 'very_high';

/**
 * Severity scale rating (1-5)
 * 1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Critical, 5 = Catastrophic
 */
export type SeverityScale = 1 | 2 | 3 | 4 | 5;

/**
 * Manufacturing process type categories
 * Maps to ManufacturingProcessType enum in backend
 */
export type ProcessType = 'assembly' | 'inspection' | 'calibration' | 'test';

/**
 * Manufacturing procedure containing multiple processes
 * Maps to ProcedureListItem from backend API
 */
export interface Procedure {
  procedure_id: string;
  title: string;
  file_path: string;
}

/**
 * Process Failure Mode and Effects Analysis item
 * Maps to PFMEAItem from backend API
 */
export interface PFMEAItem {
  item_id: string;
  procedure_id: string;
  process_key: string;
  summary: string;
  hazard: string;
  hazard_category: string;
  severity: SeverityScale;
  risk_level: RiskLevel;
  mitigation: string;
  // Optional fields for enriched display (joined from process data)
  process_name?: string;
  process_type?: ProcessType;
}

/**
 * Aggregated metrics for dashboard summary cards
 */
export interface DashboardMetrics {
  totalPFMEAItems: number;
  highRiskCount: number;
  criticalSeverityCount: number;
  totalProcedures: number;
}

/**
 * Chart data point for visualizations
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}
