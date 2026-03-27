/**
 * Integration test for ProcessTypeChart component
 * Verifies the component can be imported and used with the filters library
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

import { describe, it, expect } from 'vitest'
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

describe('ProcessTypeChart Integration', () => {
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
      process_type: 'assembly',
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
      process_type: 'assembly',
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
      process_type: 'inspection',
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
      process_type: 'calibration',
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
      process_type: 'test',
    },
    {
      item_id: '6',
      procedure_id: 'proc-2',
      process_key: 'step-3',
      summary: 'Failure mode 6',
      hazard: 'Hazard 6',
      hazard_category: 'Electrical',
      severity: 3,
      risk_level: 'moderate',
      mitigation: 'Mitigation 6',
      process_type: 'test',
    },
  ]

  describe('Integration with prepareChartData', () => {
    it('should generate valid chart data from PFMEA items', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'process_type')

      expect(chartData).toBeDefined()
      expect(Array.isArray(chartData)).toBe(true)
      expect(chartData.length).toBeGreaterThan(0)
    })

    it('should include all required properties for chart rendering', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'process_type')

      chartData.forEach((point) => {
        expect(point).toHaveProperty('name')
        expect(point).toHaveProperty('value')
        expect(point).toHaveProperty('percentage')
        expect(point).toHaveProperty('fill')
      })
    })

    it('should correctly count process types - Requirement 3.4', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'process_type')

      const assemblyPoint = chartData.find((p) => p.name === 'assembly')
      const inspectionPoint = chartData.find((p) => p.name === 'inspection')
      const calibrationPoint = chartData.find((p) => p.name === 'calibration')
      const testPoint = chartData.find((p) => p.name === 'test')

      expect(assemblyPoint?.value).toBe(2)
      expect(inspectionPoint?.value).toBe(1)
      expect(calibrationPoint?.value).toBe(1)
      expect(testPoint?.value).toBe(2)
    })

    it('should calculate correct percentages', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'process_type')

      const totalPercentage = chartData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)
    })

    it('should apply correct color mapping - Requirement 3.1', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'process_type')

      const assemblyPoint = chartData.find((p) => p.name === 'assembly')
      const inspectionPoint = chartData.find((p) => p.name === 'inspection')
      const calibrationPoint = chartData.find((p) => p.name === 'calibration')
      const testPoint = chartData.find((p) => p.name === 'test')

      expect(assemblyPoint?.fill).toBe('hsl(221, 83%, 53%)') // blue
      expect(inspectionPoint?.fill).toBe('hsl(142, 76%, 36%)') // green
      expect(calibrationPoint?.fill).toBe('hsl(280, 65%, 60%)') // purple
      expect(testPoint?.fill).toBe('hsl(25, 95%, 53%)') // orange
    })
  })

  describe('All process types - Requirement 3.2', () => {
    it('should include all four process type categories when present', () => {
      const chartData = prepareChartData(mockPFMEAItems, 'process_type')

      const processTypes = chartData.map((p) => p.name)
      expect(processTypes).toContain('assembly')
      expect(processTypes).toContain('inspection')
      expect(processTypes).toContain('calibration')
      expect(processTypes).toContain('test')
      expect(chartData.length).toBe(4)
    })

    it('should handle subset of process types', () => {
      const subsetItems = mockPFMEAItems.filter(
        (item) => item.process_type === 'assembly' || item.process_type === 'test'
      )

      const chartData = prepareChartData(subsetItems, 'process_type')

      expect(chartData.length).toBe(2)
      const processTypes = chartData.map((p) => p.name)
      expect(processTypes).toContain('assembly')
      expect(processTypes).toContain('test')
    })
  })

  describe('Empty data handling', () => {
    it('should handle empty PFMEA items array', () => {
      const chartData = prepareChartData([], 'process_type')

      expect(chartData).toBeDefined()
      expect(Array.isArray(chartData)).toBe(true)
      expect(chartData.length).toBe(0)
    })

    it('should handle items without process_type', () => {
      const itemsWithoutType: PFMEAItem[] = [
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
          // No process_type
        },
      ]

      const chartData = prepareChartData(itemsWithoutType, 'process_type')

      expect(chartData).toBeDefined()
      expect(chartData.length).toBe(0)
    })
  })

  describe('Data filtering integration - Requirement 3.3', () => {
    it('should work with filtered PFMEA items', () => {
      // Filter to only assembly and test process types
      const filteredItems = mockPFMEAItems.filter(
        (item) => item.process_type === 'assembly' || item.process_type === 'test'
      )

      const chartData = prepareChartData(filteredItems, 'process_type')

      expect(chartData.length).toBe(2)
      expect(chartData.every((p) => p.name === 'assembly' || p.name === 'test')).toBe(true)
    })

    it('should recalculate percentages after filtering', () => {
      const filteredItems = mockPFMEAItems.filter(
        (item) => item.process_type === 'assembly' || item.process_type === 'test'
      )

      const chartData = prepareChartData(filteredItems, 'process_type')

      const totalPercentage = chartData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)
    })

    it('should handle single process type after filtering', () => {
      const filteredItems = mockPFMEAItems.filter((item) => item.process_type === 'calibration')

      const chartData = prepareChartData(filteredItems, 'process_type')

      expect(chartData.length).toBe(1)
      expect(chartData[0].name).toBe('calibration')
      expect(chartData[0].percentage).toBe(100)
    })
  })
})
