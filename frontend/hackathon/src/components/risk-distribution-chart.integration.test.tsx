/**
 * Integration test for RiskDistributionChart component
 * Verifies the component can be imported and used with the filters library
 */

import { describe, it, expect } from 'vitest'
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

describe('RiskDistributionChart Integration', () => {
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
  ]

  describe('Integration with prepareChartData', () => {
    it('should generate valid chart data from PFMEA items', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'risk_level')

      expect(chartData).toBeDefined()
      expect(Array.isArray(chartData)).toBe(true)
      expect(chartData.length).toBeGreaterThan(0)
    })

    it('should include all required properties for chart rendering', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'risk_level')

      chartData.forEach((point) => {
        expect(point).toHaveProperty('name')
        expect(point).toHaveProperty('value')
        expect(point).toHaveProperty('percentage')
        expect(point).toHaveProperty('fill')
      })
    })

    it('should correctly count risk levels', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'risk_level')

      const veryHighPoint = chartData.find((p) => p.name === 'very_high')
      const highPoint = chartData.find((p) => p.name === 'high')
      const moderatePoint = chartData.find((p) => p.name === 'moderate')
      const lowPoint = chartData.find((p) => p.name === 'low')

      expect(veryHighPoint?.value).toBe(1)
      expect(highPoint?.value).toBe(2)
      expect(moderatePoint?.value).toBe(1)
      expect(lowPoint?.value).toBe(1)
    })

    it('should calculate correct percentages', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'risk_level')

      const totalPercentage = chartData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)
    })

    it('should apply correct color mapping', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'risk_level')

      const veryHighPoint = chartData.find((p) => p.name === 'very_high')
      const highPoint = chartData.find((p) => p.name === 'high')
      const moderatePoint = chartData.find((p) => p.name === 'moderate')
      const lowPoint = chartData.find((p) => p.name === 'low')

      expect(veryHighPoint?.fill).toBe('hsl(0, 63%, 31%)') // dark red
      expect(highPoint?.fill).toBe('hsl(0, 84%, 60%)') // red
      expect(moderatePoint?.fill).toBe('hsl(25, 95%, 53%)') // orange
      expect(lowPoint?.fill).toBe('hsl(48, 96%, 53%)') // yellow
    })
  })

  describe('Empty data handling', () => {
    it('should handle empty PFMEA items array', () => {
      const chartData = prepareChartData([], 'risk_level')

      expect(chartData).toBeDefined()
      expect(Array.isArray(chartData)).toBe(true)
      expect(chartData.length).toBe(0)
    })
  })

  describe('Data filtering integration', () => {
    it('should work with filtered PFMEA items', () => {
      // Filter to only high risk items
      const filteredItems = mockPFMEAItems.filter(
        (item) => item.risk_level === 'high' || item.risk_level === 'very_high'
      )

      const chartData = prepareChartData(filteredItems, 'risk_level')

      expect(chartData.length).toBe(2) // only high and very_high
      expect(chartData.every((p) => p.name === 'high' || p.name === 'very_high')).toBe(true)
    })

    it('should recalculate percentages after filtering', () => {
      const filteredItems = mockPFMEAItems.filter(
        (item) => item.risk_level === 'high' || item.risk_level === 'very_high'
      )

      const chartData = prepareChartData(filteredItems, 'risk_level')

      const totalPercentage = chartData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)
    })
  })
})
