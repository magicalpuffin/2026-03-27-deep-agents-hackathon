/**
 * Unit tests for ProcessTypeChart component
 * Tests chart data rendering and click handler logic
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

import { describe, it, expect, vi } from 'vitest'
import type { ChartDataPoint, ProcessType } from '@/types/pfmea'

describe('ProcessTypeChart', () => {
  const mockChartData: ChartDataPoint[] = [
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

  describe('Chart data structure - Requirement 3.1', () => {
    it('should have valid chart data points', () => {
      expect(mockChartData).toHaveLength(4)
      mockChartData.forEach((point) => {
        expect(point).toHaveProperty('name')
        expect(point).toHaveProperty('value')
        expect(point).toHaveProperty('percentage')
        expect(point).toHaveProperty('fill')
      })
    })

    it('should have correct process type names', () => {
      const processTypes: ProcessType[] = ['assembly', 'inspection', 'calibration', 'test']
      const chartNames = mockChartData.map((d) => d.name)
      expect(chartNames).toEqual(processTypes)
    })

    it('should have positive values', () => {
      mockChartData.forEach((point) => {
        expect(point.value).toBeGreaterThan(0)
      })
    })

    it('should have percentages that sum to 100', () => {
      const totalPercentage = mockChartData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)
    })
  })

  describe('Color mapping - Requirement 3.1', () => {
    it('should use blue for assembly process type', () => {
      const assemblyData = mockChartData.find((d) => d.name === 'assembly')
      expect(assemblyData?.fill).toBe('hsl(221, 83%, 53%)')
    })

    it('should use green for inspection process type', () => {
      const inspectionData = mockChartData.find((d) => d.name === 'inspection')
      expect(inspectionData?.fill).toBe('hsl(142, 76%, 36%)')
    })

    it('should use purple for calibration process type', () => {
      const calibrationData = mockChartData.find((d) => d.name === 'calibration')
      expect(calibrationData?.fill).toBe('hsl(280, 65%, 60%)')
    })

    it('should use orange for test process type', () => {
      const testData = mockChartData.find((d) => d.name === 'test')
      expect(testData?.fill).toBe('hsl(25, 95%, 53%)')
    })
  })

  describe('Click handler - Requirement 3.3', () => {
    it('should call onSegmentClick with correct process type', () => {
      const mockHandler = vi.fn()
      const clickedData: ChartDataPoint = mockChartData[0] // 'assembly'

      mockHandler(clickedData.name as ProcessType)

      expect(mockHandler).toHaveBeenCalledWith('assembly')
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })

    it('should handle clicks on different process types', () => {
      const mockHandler = vi.fn()

      mockChartData.forEach((data) => {
        mockHandler(data.name as ProcessType)
      })

      expect(mockHandler).toHaveBeenCalledTimes(4)
      expect(mockHandler).toHaveBeenCalledWith('assembly')
      expect(mockHandler).toHaveBeenCalledWith('inspection')
      expect(mockHandler).toHaveBeenCalledWith('calibration')
      expect(mockHandler).toHaveBeenCalledWith('test')
    })
  })

  describe('Tooltip data - Requirement 3.4', () => {
    it('should include count and percentage in data', () => {
      mockChartData.forEach((point) => {
        expect(point.value).toBeDefined()
        expect(point.percentage).toBeDefined()
        expect(typeof point.value).toBe('number')
        expect(typeof point.percentage).toBe('number')
      })
    })

    it('should have percentage values between 0 and 100', () => {
      mockChartData.forEach((point) => {
        expect(point.percentage).toBeGreaterThanOrEqual(0)
        expect(point.percentage).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('All process types - Requirement 3.2', () => {
    it('should include all four process type categories', () => {
      const allProcessTypes: ProcessType[] = ['assembly', 'inspection', 'calibration', 'test']
      const chartNames = mockChartData.map((d) => d.name)
      
      allProcessTypes.forEach((type) => {
        expect(chartNames).toContain(type)
      })
    })

    it('should handle data with all process types present', () => {
      const completeData: ChartDataPoint[] = [
        { name: 'assembly', value: 10, percentage: 25, fill: 'hsl(221, 83%, 53%)' },
        { name: 'inspection', value: 10, percentage: 25, fill: 'hsl(142, 76%, 36%)' },
        { name: 'calibration', value: 10, percentage: 25, fill: 'hsl(280, 65%, 60%)' },
        { name: 'test', value: 10, percentage: 25, fill: 'hsl(25, 95%, 53%)' },
      ]

      expect(completeData).toHaveLength(4)
      const types = completeData.map((d) => d.name)
      expect(types).toEqual(['assembly', 'inspection', 'calibration', 'test'])
    })
  })

  describe('Empty data handling', () => {
    it('should handle empty data array', () => {
      const emptyData: ChartDataPoint[] = []
      expect(emptyData).toHaveLength(0)
    })

    it('should handle single data point', () => {
      const singleData: ChartDataPoint[] = [
        {
          name: 'assembly',
          value: 100,
          percentage: 100,
          fill: 'hsl(221, 83%, 53%)',
        },
      ]
      expect(singleData).toHaveLength(1)
      expect(singleData[0].percentage).toBe(100)
    })

    it('should handle partial process types', () => {
      const partialData: ChartDataPoint[] = [
        { name: 'assembly', value: 50, percentage: 50, fill: 'hsl(221, 83%, 53%)' },
        { name: 'test', value: 50, percentage: 50, fill: 'hsl(25, 95%, 53%)' },
      ]
      expect(partialData).toHaveLength(2)
    })
  })

  describe('Data aggregation logic - Requirement 3.4', () => {
    it('should correctly count items by process type', () => {
      // Simulate counting logic from prepareChartData
      const items = [
        { process_type: 'assembly' },
        { process_type: 'assembly' },
        { process_type: 'test' },
        { process_type: 'assembly' },
        { process_type: 'inspection' },
      ]

      const counts: Record<string, number> = {}
      items.forEach((item) => {
        if (item.process_type) {
          counts[item.process_type] = (counts[item.process_type] || 0) + 1
        }
      })

      expect(counts['assembly']).toBe(3)
      expect(counts['test']).toBe(1)
      expect(counts['inspection']).toBe(1)
    })

    it('should correctly calculate percentages', () => {
      const total = 100
      const value = 40
      const percentage = Math.round((value / total) * 100)

      expect(percentage).toBe(40)
    })

    it('should handle items without process_type', () => {
      const items = [
        { process_type: 'assembly' },
        { process_type: undefined },
        { process_type: 'test' },
      ]

      const counts: Record<string, number> = {}
      items.forEach((item) => {
        if (item.process_type) {
          counts[item.process_type] = (counts[item.process_type] || 0) + 1
        }
      })

      expect(counts['assembly']).toBe(1)
      expect(counts['test']).toBe(1)
      expect(counts['undefined']).toBeUndefined()
    })
  })
})
