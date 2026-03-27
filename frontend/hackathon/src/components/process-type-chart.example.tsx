/**
 * Example usage of ProcessTypeChart component
 * 
 * This example demonstrates how to use the ProcessTypeChart component
 * with sample data and a click handler.
 */

import { ProcessTypeChart } from './process-type-chart'
import type { ChartDataPoint, ProcessType } from '@/types/pfmea'

export function ProcessTypeChartExample() {
  // Sample chart data
  const sampleData: ChartDataPoint[] = [
    {
      name: 'assembly',
      value: 25,
      percentage: 40,
      fill: 'hsl(221, 83%, 53%)',
    },
    {
      name: 'inspection',
      value: 20,
      percentage: 32,
      fill: 'hsl(142, 76%, 36%)',
    },
    {
      name: 'calibration',
      value: 10,
      percentage: 16,
      fill: 'hsl(280, 65%, 60%)',
    },
    {
      name: 'test',
      value: 7,
      percentage: 12,
      fill: 'hsl(25, 95%, 53%)',
    },
  ]

  // Click handler for segment selection
  const handleSegmentClick = (processType: ProcessType) => {
    console.log('Process type clicked:', processType)
    // In a real application, this would filter the data table
    // by the selected process type
  }

  return (
    <div className="p-4">
      <ProcessTypeChart
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

export function ProcessTypeChartWithRealData() {
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
      process_type: 'assembly',
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
      process_type: 'inspection',
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
      process_type: 'test',
    },
    {
      item_id: '4',
      procedure_id: 'proc-2',
      process_key: 'step-2',
      summary: 'Test failure mode 4',
      hazard: 'Test hazard 4',
      hazard_category: 'Chemical',
      severity: 2,
      risk_level: 'low',
      mitigation: 'Test mitigation 4',
      process_type: 'calibration',
    },
  ]

  // Prepare chart data using the utility function
  const chartData = prepareChartData(pfmeaItems, 'process_type')

  const handleSegmentClick = (processType: ProcessType) => {
    console.log('Filtering by process type:', processType)
  }

  return (
    <div className="p-4">
      <ProcessTypeChart
        data={chartData}
        onSegmentClick={handleSegmentClick}
      />
    </div>
  )
}
