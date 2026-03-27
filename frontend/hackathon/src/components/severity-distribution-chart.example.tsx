/**
 * Example usage of SeverityDistributionChart component
 * Demonstrates how to use the chart with sample data
 */

import { SeverityDistributionChart } from './severity-distribution-chart'
import type { ChartDataPoint } from '@/types/pfmea'

/**
 * Example 1: Full severity distribution
 * Shows all five severity levels with realistic distribution
 */
export function SeverityDistributionExample() {
  const data: ChartDataPoint[] = [
    {
      name: '1',
      value: 15,
      percentage: 15,
      fill: 'hsl(142, 76%, 36%)',
    },
    {
      name: '2',
      value: 25,
      percentage: 25,
      fill: 'hsl(48, 96%, 53%)',
    },
    {
      name: '3',
      value: 30,
      percentage: 30,
      fill: 'hsl(25, 95%, 53%)',
    },
    {
      name: '4',
      value: 20,
      percentage: 20,
      fill: 'hsl(0, 84%, 60%)',
    },
    {
      name: '5',
      value: 10,
      percentage: 10,
      fill: 'hsl(0, 63%, 31%)',
    },
  ]

  return <SeverityDistributionChart data={data} />
}

/**
 * Example 2: High severity concentration
 * Shows a distribution skewed toward higher severity levels
 */
export function HighSeverityExample() {
  const data: ChartDataPoint[] = [
    {
      name: '1',
      value: 5,
      percentage: 5,
      fill: 'hsl(142, 76%, 36%)',
    },
    {
      name: '2',
      value: 10,
      percentage: 10,
      fill: 'hsl(48, 96%, 53%)',
    },
    {
      name: '3',
      value: 15,
      percentage: 15,
      fill: 'hsl(25, 95%, 53%)',
    },
    {
      name: '4',
      value: 35,
      percentage: 35,
      fill: 'hsl(0, 84%, 60%)',
    },
    {
      name: '5',
      value: 35,
      percentage: 35,
      fill: 'hsl(0, 63%, 31%)',
    },
  ]

  return <SeverityDistributionChart data={data} />
}

/**
 * Example 3: Low severity concentration
 * Shows a distribution skewed toward lower severity levels
 */
export function LowSeverityExample() {
  const data: ChartDataPoint[] = [
    {
      name: '1',
      value: 40,
      percentage: 40,
      fill: 'hsl(142, 76%, 36%)',
    },
    {
      name: '2',
      value: 30,
      percentage: 30,
      fill: 'hsl(48, 96%, 53%)',
    },
    {
      name: '3',
      value: 20,
      percentage: 20,
      fill: 'hsl(25, 95%, 53%)',
    },
    {
      name: '4',
      value: 7,
      percentage: 7,
      fill: 'hsl(0, 84%, 60%)',
    },
    {
      name: '5',
      value: 3,
      percentage: 3,
      fill: 'hsl(0, 63%, 31%)',
    },
  ]

  return <SeverityDistributionChart data={data} />
}

/**
 * Example 4: Partial severity data
 * Shows only some severity levels (e.g., after filtering)
 */
export function PartialSeverityExample() {
  const data: ChartDataPoint[] = [
    {
      name: '3',
      value: 40,
      percentage: 40,
      fill: 'hsl(25, 95%, 53%)',
    },
    {
      name: '4',
      value: 35,
      percentage: 35,
      fill: 'hsl(0, 84%, 60%)',
    },
    {
      name: '5',
      value: 25,
      percentage: 25,
      fill: 'hsl(0, 63%, 31%)',
    },
  ]

  return <SeverityDistributionChart data={data} />
}

/**
 * Example 5: Single severity level
 * Shows what happens when all items have the same severity
 */
export function SingleSeverityExample() {
  const data: ChartDataPoint[] = [
    {
      name: '4',
      value: 100,
      percentage: 100,
      fill: 'hsl(0, 84%, 60%)',
    },
  ]

  return <SeverityDistributionChart data={data} />
}

/**
 * Example 6: Empty data
 * Shows how the chart handles no data
 */
export function EmptySeverityExample() {
  const data: ChartDataPoint[] = []

  return <SeverityDistributionChart data={data} />
}

/**
 * Example 7: Integration with prepareChartData utility
 * Demonstrates real-world usage with PFMEA items
 */
export function IntegratedExample() {
  // Simulated PFMEA items
  const pfmeaItems = [
    { severity: 4, summary: 'Misalignment during assembly' },
    { severity: 4, summary: 'Calibration drift' },
    { severity: 3, summary: 'Minor surface defect' },
    { severity: 5, summary: 'Critical safety hazard' },
    { severity: 2, summary: 'Cosmetic issue' },
    { severity: 4, summary: 'Measurement error' },
    { severity: 3, summary: 'Process variation' },
    { severity: 1, summary: 'Documentation typo' },
  ]

  // Simulate prepareChartData logic
  const counts: Record<string, number> = {}
  pfmeaItems.forEach((item) => {
    const key = String(item.severity)
    counts[key] = (counts[key] || 0) + 1
  })

  const total = pfmeaItems.length
  const colorMap: Record<string, string> = {
    '1': 'hsl(142, 76%, 36%)',
    '2': 'hsl(48, 96%, 53%)',
    '3': 'hsl(25, 95%, 53%)',
    '4': 'hsl(0, 84%, 60%)',
    '5': 'hsl(0, 63%, 31%)',
  }

  const data: ChartDataPoint[] = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / total) * 100),
    fill: colorMap[name],
  }))

  return <SeverityDistributionChart data={data} />
}
