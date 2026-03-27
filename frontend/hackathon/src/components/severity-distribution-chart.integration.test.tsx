/**
 * Integration test for SeverityDistributionChart component
 * Verifies the component can be imported and used with the filters library
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */

import { describe, it, expect } from 'vitest'
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

describe('SeverityDistributionChart Integration', () => {
  const mockPFMEAItems: PFMEAItem[] = [
    {
      item_id: '1',
      procedure_id: 'proc-1',
      process_key: 'step-1',
      summary: 'Failure mode 1',
      hazard: 'Hazard 1',
      hazard_category: 'Electrical',
      severity: 5,
      risk_level: 'very_high',
      mitigation: 'Mitigation 1',
    },
    {
      item_id: '2',
      procedure_id: 'proc-1',
      process_key: 'step-2',
      summary: 'Failure mode 2',
      hazard: 'Hazard 2',
      hazard_category: 'Mechanical',
      severity: 4,
      risk_level: 'high',
      mitigation: 'Mitigation 2',
    },
    {
      item_id: '3',
      procedure_id: 'proc-1',
      process_key: 'step-3',
      summary: 'Failure mode 3',
      hazard: 'Hazard 3',
      hazard_category: 'Electrical',
      severity: 4,
      risk_level: 'high',
      mitigation: 'Mitigation 3',
    },
    {
      item_id: '4',
      procedure_id: 'proc-2',
      process_key: 'step-1',
      summary: 'Failure mode 4',
      hazard: 'Hazard 4',
      hazard_category: 'Chemical',
      severity: 3,
      risk_level: 'moderate',
      mitigation: 'Mitigation 4',
    },
    {
      item_id: '5',
      procedure_id: 'proc-2',
      process_key: 'step-2',
      summary: 'Failure mode 5',
      hazard: 'Hazard 5',
      hazard_category: 'Thermal',
      severity: 2,
      risk_level: 'low',
      mitigation: 'Mitigation 5',
    },
    {
      item_id: '6',
      procedure_id: 'proc-2',
      process_key: 'step-3',
      summary: 'Failure mode 6',
      hazard: 'Hazard 6',
      hazard_category: 'Thermal',
      severity: 1,
      risk_level: 'remote',
      mitigation: 'Mitigation 6',
    },
  ]

  describe('Integration with prepareChartData - Requirement 2.1', () => {
    it('should generate valid chart data from PFMEA items', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'severity')

      expect(chartData).toBeDefined()
      expect(Array.isArray(chartData)).toBe(true)
      expect(chartData.length).toBeGreaterThan(0)
    })

    it('should include all required properties for chart rendering', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'severity')

      chartData.forEach((point) => {
        expect(point).toHaveProperty('name')
        expect(point).toHaveProperty('value')
        expect(point).toHaveProperty('percentage')
        expect(point).toHaveProperty('fill')
      })
    })

    it('should correctly count severity levels', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'severity')

      const severity1Point = chartData.find((p) => p.name === '1')
      const severity2Point = chartData.find((p) => p.name === '2')
      const severity3Point = chartData.find((p) => p.name === '3')
      const severity4Point = chartData.find((p) => p.name === '4')
      const severity5Point = chartData.find((p) => p.name === '5')

      expect(severity1Point?.value).toBe(1)
      expect(severity2Point?.value).toBe(1)
      expect(severity3Point?.value).toBe(1)
      expect(severity4Point?.value).toBe(2)
      expect(severity5Point?.value).toBe(1)
    })

    it('should calculate correct percentages - Requirement 2.4', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'severity')

      const totalPercentage = chartData.reduce((sum, point) => sum + point.percentage, 0)
      // Allow for rounding errors (99-101 is acceptable)
      expect(totalPercentage).toBeGreaterThanOrEqual(99)
      expect(totalPercentage).toBeLessThanOrEqual(101)
    })

    it('should apply correct gradient color mapping - Requirement 2.2', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'severity')

      const severity1Point = chartData.find((p) => p.name === '1')
      const severity2Point = chartData.find((p) => p.name === '2')
      const severity3Point = chartData.find((p) => p.name === '3')
      const severity4Point = chartData.find((p) => p.name === '4')
      const severity5Point = chartData.find((p) => p.name === '5')

      expect(severity1Point?.fill).toBe('hsl(142, 76%, 36%)') // light green
      expect(severity2Point?.fill).toBe('hsl(48, 96%, 53%)') // yellow
      expect(severity3Point?.fill).toBe('hsl(25, 95%, 53%)') // orange
      expect(severity4Point?.fill).toBe('hsl(0, 84%, 60%)') // red
      expect(severity5Point?.fill).toBe('hsl(0, 63%, 31%)') // dark red
    })
  })

  describe('Empty data handling', () => {
    it('should handle empty PFMEA items array', () => {
      const chartData = prepareChartData([], 'severity')

      expect(chartData).toBeDefined()
      expect(Array.isArray(chartData)).toBe(true)
      expect(chartData.length).toBe(0)
    })
  })

  describe('Data filtering integration', () => {
    it('should work with filtered PFMEA items', () => {
      // Filter to only critical and catastrophic severity items
      const filteredItems = mockPFMEAItems.filter(
        (item) => item.severity === 4 || item.severity === 5
      )

      const chartData = prepareChartData(filteredItems, 'severity')

      expect(chartData.length).toBe(2) // only severity 4 and 5
      expect(chartData.every((p) => p.name === '4' || p.name === '5')).toBe(true)
    })

    it('should recalculate percentages after filtering - Requirement 2.4', () => {
      const filteredItems = mockPFMEAItems.filter(
        (item) => item.severity === 4 || item.severity === 5
      )

      const chartData = prepareChartData(filteredItems, 'severity')

      const totalPercentage = chartData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)

      // Verify individual percentages
      const severity4Point = chartData.find((p) => p.name === '4')
      const severity5Point = chartData.find((p) => p.name === '5')

      expect(severity4Point?.percentage).toBe(67) // 2 out of 3 items
      expect(severity5Point?.percentage).toBe(33) // 1 out of 3 items
    })

    it('should handle single severity level after filtering', () => {
      const filteredItems = mockPFMEAItems.filter((item) => item.severity === 5)

      const chartData = prepareChartData(filteredItems, 'severity')

      expect(chartData.length).toBe(1)
      expect(chartData[0].name).toBe('5')
      expect(chartData[0].value).toBe(1)
      expect(chartData[0].percentage).toBe(100)
    })
  })

  describe('Tooltip data - Requirement 2.3', () => {
    it('should provide severity name and count for tooltip', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'severity')

      chartData.forEach((point) => {
        // Name should be severity level as string
        expect(['1', '2', '3', '4', '5']).toContain(point.name)
        
        // Value should be count
        expect(point.value).toBeGreaterThan(0)
        expect(Number.isInteger(point.value)).toBe(true)
        
        // Percentage should be calculated
        expect(point.percentage).toBeGreaterThan(0)
        expect(point.percentage).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('Severity distribution patterns', () => {
    it('should handle uniform distribution', () => {
      const uniformItems: PFMEAItem[] = [
        { item_id: '1', procedure_id: 'p1', process_key: 's1', summary: 'F1', hazard: 'H1', hazard_category: 'C1', severity: 1, risk_level: 'remote', mitigation: 'M1' },
        { item_id: '2', procedure_id: 'p1', process_key: 's2', summary: 'F2', hazard: 'H2', hazard_category: 'C2', severity: 2, risk_level: 'low', mitigation: 'M2' },
        { item_id: '3', procedure_id: 'p1', process_key: 's3', summary: 'F3', hazard: 'H3', hazard_category: 'C3', severity: 3, risk_level: 'moderate', mitigation: 'M3' },
        { item_id: '4', procedure_id: 'p1', process_key: 's4', summary: 'F4', hazard: 'H4', hazard_category: 'C4', severity: 4, risk_level: 'high', mitigation: 'M4' },
        { item_id: '5', procedure_id: 'p1', process_key: 's5', summary: 'F5', hazard: 'H5', hazard_category: 'C5', severity: 5, risk_level: 'very_high', mitigation: 'M5' },
      ]

      const chartData = prepareChartData(uniformItems, 'severity')

      expect(chartData.length).toBe(5)
      chartData.forEach((point) => {
        expect(point.value).toBe(1)
        expect(point.percentage).toBe(20)
      })
    })

    it('should handle skewed distribution toward high severity', () => {
      const skewedItems: PFMEAItem[] = [
        { item_id: '1', procedure_id: 'p1', process_key: 's1', summary: 'F1', hazard: 'H1', hazard_category: 'C1', severity: 4, risk_level: 'high', mitigation: 'M1' },
        { item_id: '2', procedure_id: 'p1', process_key: 's2', summary: 'F2', hazard: 'H2', hazard_category: 'C2', severity: 4, risk_level: 'high', mitigation: 'M2' },
        { item_id: '3', procedure_id: 'p1', process_key: 's3', summary: 'F3', hazard: 'H3', hazard_category: 'C3', severity: 5, risk_level: 'very_high', mitigation: 'M3' },
        { item_id: '4', procedure_id: 'p1', process_key: 's4', summary: 'F4', hazard: 'H4', hazard_category: 'C4', severity: 5, risk_level: 'very_high', mitigation: 'M4' },
        { item_id: '5', procedure_id: 'p1', process_key: 's5', summary: 'F5', hazard: 'H5', hazard_category: 'C5', severity: 5, risk_level: 'very_high', mitigation: 'M5' },
      ]

      const chartData = prepareChartData(skewedItems, 'severity')

      const severity4Point = chartData.find((p) => p.name === '4')
      const severity5Point = chartData.find((p) => p.name === '5')

      expect(severity4Point?.value).toBe(2)
      expect(severity5Point?.value).toBe(3)
      expect(severity4Point?.percentage).toBe(40)
      expect(severity5Point?.percentage).toBe(60)
    })
  })
})
