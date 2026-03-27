/**
 * Example usage of RiskDistributionChart component
 * 
 * This example demonstrates how to use the RiskDistributionChart component
 * with sample data and a click handler.
 */

import { RiskDistributionChart } from './risk-distribution-chart'
import type { ChartDataPoint, RiskLevel } from '@/types/pfmea'

export function RiskDistributionChartExample() {
  // Sample chart data
  const sampleData: ChartDataPoint[] = [
    {
      name: 'remote',
      value: 10,
      percentage: 10,
      fill: 'hsl(142, 76%, 36%)',
    },
    {
      name: 'low',
      value: 20,
      percentage: 20,
      fill: 'hsl(48, 96%, 53%)',
    },
    {
      name: 'moderate',
      value: 30,
      percentage: 30,
      fill: 'hsl(25, 95%, 53%)',
    },
    {
      name: 'high',
      value: 25,
      percentage: 25,
      fill: 'hsl(0, 84%, 60%)',
    },
    {
      name: 'very_high',
      value: 15,
      percentage: 15,
      fill: 'hsl(0, 63%, 31%)',
    },
  ]

  // Click handler for segment selection
  const handleSegmentClick = (riskLevel: RiskLevel) => {
    console.log('Risk level clicked:', riskLevel)
    // In a real application, this would filter the data table
    // by the selected risk level
  }

  return (
    <div className="p-4">
      <RiskDistributionChart
        data={sampleData}
        onSegmentClick={handleSegmentClick}
      />
    </div>
  )
}

/**
 * Example with prepareChartData utility
 * 
 * This example shows how to use the prepareChartData utility function
 * from the filters library to generate chart data from PFMEA items.
 */

import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

export function RiskDistributionChartWithRealData() {
  // Sample PFMEA items
  const pfmeaItems: PFMEAItem[] = [
    {
      item_id: '1',
      procedure_id: 'proc-1',
      process_key: 'step-1',
      summary: 'Test failure mode 1',
      hazard: 'Test hazard 1',
      hazard_category: 'Electrical',
      severity: 4,
      risk_level: 'high',
      mitigation: 'Test mitigation 1',
    },
    {
      item_id: '2',
      procedure_id: 'proc-1',
      process_key: 'step-2',
      summary: 'Test failure mode 2',
      hazard: 'Test hazard 2',
      hazard_category: 'Mechanical',
      severity: 3,
      risk_level: 'moderate',
      mitigation: 'Test mitigation 2',
    },
    {
      item_id: '3',
      procedure_id: 'proc-2',
      process_key: 'step-1',
      summary: 'Test failure mode 3',
      hazard: 'Test hazard 3',
      hazard_category: 'Electrical',
      severity: 5,
      risk_level: 'very_high',
      mitigation: 'Test mitigation 3',
    },
  ]

  // Prepare chart data using the utility function
  const chartData = prepareChartData(pfmeaItems, 'risk_level')

  const handleSegmentClick = (riskLevel: RiskLevel) => {
    console.log('Filtering by risk level:', riskLevel)
  }

  return (
    <div className="p-4">
      <RiskDistributionChart
        data={chartData}
        onSegmentClick={handleSegmentClick}
      />
    </div>
  )
}
