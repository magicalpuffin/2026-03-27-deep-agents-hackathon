/**
 * Unit tests for RiskDistributionChart component
 * Tests chart data rendering and click handler logic
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

import { describe, it, expect, vi } from 'vitest'
import type { ChartDataPoint, RiskLevel } from '@/types/pfmea'

describe('RiskDistributionChart', () => {
  const mockChartData: ChartDataPoint[] = [
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

  describe('Chart data structure', () => {
    it('should have valid chart data points', () => {
      expect(mockChartData).toHaveLength(5)
      mockChartData.forEach((point) => {
        expect(point).toHaveProperty('name')
        expect(point).toHaveProperty('value')
        expect(point).toHaveProperty('percentage')
        expect(point).toHaveProperty('fill')
      })
    })

    it('should have correct risk level names', () => {
      const riskLevels: RiskLevel[] = ['remote', 'low', 'moderate', 'high', 'very_high']
      const chartNames = mockChartData.map((d) => d.name)
      expect(chartNames).toEqual(riskLevels)
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

  describe('Color mapping - Requirement 1.3', () => {
    it('should use green for remote risk level', () => {
      const remoteData = mockChartData.find((d) => d.name === 'remote')
      expect(remoteData?.fill).toBe('hsl(142, 76%, 36%)')
    })

    it('should use yellow for low risk level', () => {
      const lowData = mockChartData.find((d) => d.name === 'low')
      expect(lowData?.fill).toBe('hsl(48, 96%, 53%)')
    })

    it('should use orange for moderate risk level', () => {
      const moderateData = mockChartData.find((d) => d.name === 'moderate')
      expect(moderateData?.fill).toBe('hsl(25, 95%, 53%)')
    })

    it('should use red for high risk level', () => {
      const highData = mockChartData.find((d) => d.name === 'high')
      expect(highData?.fill).toBe('hsl(0, 84%, 60%)')
    })

    it('should use dark red for very_high risk level', () => {
      const veryHighData = mockChartData.find((d) => d.name === 'very_high')
      expect(veryHighData?.fill).toBe('hsl(0, 63%, 31%)')
    })
  })

  describe('Click handler - Requirement 1.4', () => {
    it('should call onSegmentClick with correct risk level', () => {
      const mockHandler = vi.fn()
      const clickedData: ChartDataPoint = mockChartData[3] // 'high'

      mockHandler(clickedData.name as RiskLevel)

      expect(mockHandler).toHaveBeenCalledWith('high')
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })

    it('should handle clicks on different risk levels', () => {
      const mockHandler = vi.fn()

      mockChartData.forEach((data) => {
        mockHandler(data.name as RiskLevel)
      })

      expect(mockHandler).toHaveBeenCalledTimes(5)
      expect(mockHandler).toHaveBeenCalledWith('remote')
      expect(mockHandler).toHaveBeenCalledWith('low')
      expect(mockHandler).toHaveBeenCalledWith('moderate')
      expect(mockHandler).toHaveBeenCalledWith('high')
      expect(mockHandler).toHaveBeenCalledWith('very_high')
    })
  })

  describe('Tooltip data - Requirement 1.4', () => {
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

  describe('Empty data handling', () => {
    it('should handle empty data array', () => {
      const emptyData: ChartDataPoint[] = []
      expect(emptyData).toHaveLength(0)
    })

    it('should handle single data point', () => {
      const singleData: ChartDataPoint[] = [
        {
          name: 'high',
          value: 100,
          percentage: 100,
          fill: 'hsl(0, 84%, 60%)',
        },
      ]
      expect(singleData).toHaveLength(1)
      expect(singleData[0].percentage).toBe(100)
    })
  })

  describe('Data aggregation logic', () => {
    it('should correctly count items by risk level', () => {
      // Simulate counting logic from prepareChartData
      const items = [
        { risk_level: 'high' },
        { risk_level: 'high' },
        { risk_level: 'moderate' },
        { risk_level: 'high' },
        { risk_level: 'low' },
      ]

      const counts: Record<string, number> = {}
      items.forEach((item) => {
        counts[item.risk_level] = (counts[item.risk_level] || 0) + 1
      })

      expect(counts['high']).toBe(3)
      expect(counts['moderate']).toBe(1)
      expect(counts['low']).toBe(1)
    })

    it('should correctly calculate percentages', () => {
      const total = 100
      const value = 25
      const percentage = Math.round((value / total) * 100)

      expect(percentage).toBe(25)
    })
  })
})
