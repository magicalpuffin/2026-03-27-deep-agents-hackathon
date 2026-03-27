/**
 * Filter utility functions for PFMEA dashboard
 * Implements filtering logic for Requirements 7.1, 7.2, 7.3
 * Implements metrics computation for Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 * Implements chart data preparation for Requirements 1.2, 2.1, 3.1, 8.1
 */

import type { PFMEAItem, RiskLevel, ProcessType, DashboardMetrics, ChartDataPoint } from '../types/pfmea';

/**
 * Filter state interface
 */
export interface FilterState {
  selectedProcedureId?: string | 'all';
  selectedRiskLevels?: RiskLevel[];
  selectedSeverities?: number[];
  selectedProcessTypes?: ProcessType[];
}

/**
 * Apply multiple filters to PFMEA items using AND logic
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3**
 * 
 * @param items - Array of PFMEA items to filter
 * @param filters - Filter criteria to apply
 * @returns Filtered array of PFMEA items
 * 
 * @example
 * ```typescript
 * const filtered = applyFilters(allItems, {
 *   selectedProcedureId: 'proc-123',
 *   selectedRiskLevels: ['high', 'very_high'],
 *   selectedSeverities: [4, 5]
 * });
 * ```
 */
export function applyFilters(
  items: PFMEAItem[],
  filters: FilterState
): PFMEAItem[] {
  return items.filter((item) => {
    // Requirement 7.1: Filter by procedure
    if (
      filters.selectedProcedureId &&
      filters.selectedProcedureId !== 'all' &&
      item.procedure_id !== filters.selectedProcedureId
    ) {
      return false;
    }

    // Requirement 7.2: Filter by risk level
    if (
      filters.selectedRiskLevels &&
      filters.selectedRiskLevels.length > 0 &&
      !filters.selectedRiskLevels.includes(item.risk_level)
    ) {
      return false;
    }

    // Requirement 7.3: Filter by severity
    if (
      filters.selectedSeverities &&
      filters.selectedSeverities.length > 0 &&
      !filters.selectedSeverities.includes(item.severity)
    ) {
      return false;
    }

    // Requirement 7.3: Filter by process type
    if (
      filters.selectedProcessTypes &&
      filters.selectedProcessTypes.length > 0
    ) {
      // If item has no process_type, exclude it when filter is active
      if (!item.process_type) {
        return false;
      }
      // If item has process_type but it's not in the filter list, exclude it
      if (!filters.selectedProcessTypes.includes(item.process_type)) {
        return false;
      }
    }

    // All filters passed (AND logic)
    return true;
  });
}

/**
 * Compute aggregated metrics from PFMEA items for dashboard summary cards
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
 * 
 * @param items - Array of PFMEA items to compute metrics from
 * @returns Dashboard metrics object with computed values
 * 
 * @example
 * ```typescript
 * const metrics = computeMetrics(filteredItems);
 * // Returns: {
 * //   totalPFMEAItems: 150,
 * //   highRiskCount: 25,
 * //   criticalSeverityCount: 18,
 * //   totalProcedures: 5
 * // }
 * ```
 */
export function computeMetrics(items: PFMEAItem[]): DashboardMetrics {
  // Requirement 5.1: Total count of PFMEA items
  const totalPFMEAItems = items.length;

  // Requirement 5.2: Count of high and very_high risk level items
  const highRiskCount = items.filter(
    (item) => item.risk_level === 'high' || item.risk_level === 'very_high'
  ).length;

  // Requirement 5.3: Count of critical (4) and catastrophic (5) severity items
  const criticalSeverityCount = items.filter(
    (item) => item.severity === 4 || item.severity === 5
  ).length;

  // Requirement 5.4: Count of unique procedures
  const uniqueProcedureIds = new Set(items.map((item) => item.procedure_id));
  const totalProcedures = uniqueProcedureIds.size;

  return {
    totalPFMEAItems,
    highRiskCount,
    criticalSeverityCount,
    totalProcedures,
  };
}

/**
 * Color mapping for risk levels
 * Matches design specification from design.md
 */
const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  remote: 'hsl(142, 76%, 36%)',      // green
  low: 'hsl(48, 96%, 53%)',          // yellow
  moderate: 'hsl(25, 95%, 53%)',     // orange
  high: 'hsl(0, 84%, 60%)',          // red
  very_high: 'hsl(0, 63%, 31%)',     // dark red
};

/**
 * Color mapping for severity levels
 * Matches design specification from design.md
 */
const SEVERITY_COLORS: Record<number, string> = {
  1: 'hsl(142, 76%, 36%)',  // Negligible - light green
  2: 'hsl(48, 96%, 53%)',   // Minor - yellow
  3: 'hsl(25, 95%, 53%)',   // Moderate - orange
  4: 'hsl(0, 84%, 60%)',    // Critical - red
  5: 'hsl(0, 63%, 31%)',    // Catastrophic - dark red
};

/**
 * Color mapping for process types
 * Matches design specification from design.md
 */
const PROCESS_TYPE_COLORS: Record<ProcessType, string> = {
  assembly: 'hsl(221, 83%, 53%)',    // blue
  inspection: 'hsl(142, 76%, 36%)',  // green
  calibration: 'hsl(280, 65%, 60%)', // purple
  test: 'hsl(25, 95%, 53%)',         // orange
};

/**
 * Default color for unknown/undefined categories
 */
const DEFAULT_COLOR = 'hsl(0, 0%, 50%)';

/**
 * Grouping options for chart data preparation
 */
export type GroupByOption = 'risk_level' | 'severity' | 'process_type' | 'hazard_category';

/**
 * Prepare chart data by grouping PFMEA items and computing counts/percentages
 * 
 * **Validates: Requirements 1.2, 2.1, 3.1, 8.1**
 * 
 * @param items - Array of PFMEA items to transform
 * @param groupBy - Field to group by (risk_level, severity, process_type, hazard_category)
 * @returns Array of chart data points with name, value, percentage, and fill color
 * 
 * @example
 * ```typescript
 * // Group by risk level
 * const riskData = prepareChartData(items, 'risk_level');
 * // Returns: [
 * //   { name: 'high', value: 25, percentage: 50, fill: 'hsl(0, 84%, 60%)' },
 * //   { name: 'moderate', value: 15, percentage: 30, fill: 'hsl(25, 95%, 53%)' },
 * //   ...
 * // ]
 * 
 * // Group by severity
 * const severityData = prepareChartData(items, 'severity');
 * 
 * // Group by process type
 * const processData = prepareChartData(items, 'process_type');
 * 
 * // Group by hazard category (returns top 10)
 * const hazardData = prepareChartData(items, 'hazard_category');
 * ```
 */
export function prepareChartData(
  items: PFMEAItem[],
  groupBy: GroupByOption
): ChartDataPoint[] {
  // Handle empty input
  if (items.length === 0) {
    return [];
  }

  // Count occurrences of each group value
  const counts: Record<string, number> = {};
  
  items.forEach((item) => {
    let key: string;
    
    switch (groupBy) {
      case 'risk_level':
        key = item.risk_level;
        break;
      case 'severity':
        key = String(item.severity);
        break;
      case 'process_type':
        // Skip items without process_type
        if (!item.process_type) return;
        key = item.process_type;
        break;
      case 'hazard_category':
        // Skip items with empty/undefined hazard_category (Requirement 8.4)
        if (!item.hazard_category || item.hazard_category.trim() === '') return;
        key = item.hazard_category;
        break;
      default:
        return;
    }
    
    counts[key] = (counts[key] || 0) + 1;
  });

  // Calculate total for percentage computation
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  // Transform counts into chart data points
  let chartData: ChartDataPoint[] = Object.entries(counts).map(([name, value]) => {
    let fill: string;
    
    // Determine fill color based on groupBy type
    switch (groupBy) {
      case 'risk_level':
        fill = RISK_LEVEL_COLORS[name as RiskLevel] || DEFAULT_COLOR;
        break;
      case 'severity':
        fill = SEVERITY_COLORS[Number(name)] || DEFAULT_COLOR;
        break;
      case 'process_type':
        fill = PROCESS_TYPE_COLORS[name as ProcessType] || DEFAULT_COLOR;
        break;
      case 'hazard_category':
        // Use a hash-based color for hazard categories
        fill = DEFAULT_COLOR;
        break;
      default:
        fill = DEFAULT_COLOR;
    }
    
    return {
      name,
      value,
      percentage: Math.round((value / total) * 100),
      fill,
    };
  });

  // For hazard_category, return top 10 most frequent (Requirement 8.2)
  if (groupBy === 'hazard_category') {
    chartData = chartData
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  return chartData;
}
