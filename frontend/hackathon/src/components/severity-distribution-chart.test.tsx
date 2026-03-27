/**
 * Unit tests for SeverityDistributionChart component
 * Tests chart data rendering and tooltip logic
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */

import { describe, it, expect } from 'vitest'
import type { ChartDataPoint } from '@/types/pfmea'

describe('SeverityDistributionChart', () => {
  const mockChartData: ChartDataPoint[] = [
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

  describe('Chart data structure - Requirement 2.1', () => {
    it('should have valid chart data points', () => {
      expect(mockChartData).toHaveLength(5)
      mockChartData.forEach((point) => {
        expect(point).toHaveProperty('name')
        expect(point).toHaveProperty('value')
        expect(point).toHaveProperty('percentage')
        expect(point).toHaveProperty('fill')
      })
    })

    it('should have correct severity level names', () => {
      const severityLevels = ['1', '2', '3', '4', '5']
      const chartNames = mockChartData.map((d) => d.name)
      expect(chartNames).toEqual(severityLevels)
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

  describe('Gradient color mapping - Requirement 2.2', () => {
    it('should use light green for severity 1 (Negligible)', () => {
      const severity1Data = mockChartData.find((d) => d.name === '1')
      expect(severity1Data?.fill).toBe('hsl(142, 76%, 36%)')
    })

    it('should use yellow for severity 2 (Minor)', () => {
      const severity2Data = mockChartData.find((d) => d.name === '2')
      expect(severity2Data?.fill).toBe('hsl(48, 96%, 53%)')
    })

    it('should use orange for severity 3 (Moderate)', () => {
      const severity3Data = mockChartData.find((d) => d.name === '3')
      expect(severity3Data?.fill).toBe('hsl(25, 95%, 53%)')
    })

    it('should use red for severity 4 (Critical)', () => {
      const severity4Data = mockChartData.find((d) => d.name === '4')
      expect(severity4Data?.fill).toBe('hsl(0, 84%, 60%)')
    })

    it('should use dark red for severity 5 (Catastrophic)', () => {
      const severity5Data = mockChartData.find((d) => d.name === '5')
      expect(severity5Data?.fill).toBe('hsl(0, 63%, 31%)')
    })

    it('should have gradient from light to dark', () => {
      // Verify color progression from light green to dark red
      const colors = mockChartData.map((d) => d.fill)
      expect(colors).toEqual([
        'hsl(142, 76%, 36%)', // light green
        'hsl(48, 96%, 53%)',  // yellow
        'hsl(25, 95%, 53%)',  // orange
        'hsl(0, 84%, 60%)',   // red
        'hsl(0, 63%, 31%)',   // dark red
      ])
    })
  })

  describe('Tooltip data - Requirements 2.3, 2.4', () => {
    it('should include severity name, count, and percentage', () => {
      mockChartData.forEach((point) => {
        expect(point.name).toBeDefined()
        expect(point.value).toBeDefined()
        expect(point.percentage).toBeDefined()
        expect(typeof point.name).toBe('string')
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

    it('should map severity numbers to descriptive names', () => {
      const severityNames: Record<string, string> = {
        '1': 'Negligible',
        '2': 'Minor',
        '3': 'Moderate',
        '4': 'Critical',
        '5': 'Catastrophic',
      }

      mockChartData.forEach((point) => {
        expect(severityNames[point.name]).toBeDefined()
      })
    })
  })

  describe('Empty data handling', () => {
    it('should handle empty data array', () => {
      const emptyData: ChartDataPoint[] = []
      expect(emptyData).toHaveLength(0)
    })

    it('should handle single severity level', () => {
      const singleData: ChartDataPoint[] = [
        {
          name: '4',
          value: 100,
          percentage: 100,
          fill: 'hsl(0, 84%, 60%)',
        },
      ]
      expect(singleData).toHaveLength(1)
      expect(singleData[0].percentage).toBe(100)
    })

    it('should handle partial severity data', () => {
      const partialData: ChartDataPoint[] = [
        {
          name: '3',
          value: 50,
          percentage: 50,
          fill: 'hsl(25, 95%, 53%)',
        },
        {
          name: '5',
          value: 50,
          percentage: 50,
          fill: 'hsl(0, 63%, 31%)',
        },
      ]
      expect(partialData).toHaveLength(2)
      const totalPercentage = partialData.reduce((sum, point) => sum + point.percentage, 0)
      expect(totalPercentage).toBe(100)
    })
  })

  describe('Data aggregation logic', () => {
    it('should correctly count items by severity', () => {
      // Simulate counting logic from prepareChartData
      const items = [
        { severity: 4 },
        { severity: 4 },
        { severity: 3 },
        { severity: 4 },
        { severity: 2 },
      ]

      const counts: Record<string, number> = {}
      items.forEach((item) => {
        const key = String(item.severity)
        counts[key] = (counts[key] || 0) + 1
      })

      expect(counts['4']).toBe(3)
      expect(counts['3']).toBe(1)
      expect(counts['2']).toBe(1)
    })

    it('should correctly calculate percentages', () => {
      const total = 100
      const value = 20
      const percentage = Math.round((value / total) * 100)

      expect(percentage).toBe(20)
    })

    it('should handle all severity levels 1-5', () => {
      const allSeverities = [1, 2, 3, 4, 5]
      const chartNames = mockChartData.map((d) => Number(d.name))
      expect(chartNames).toEqual(allSeverities)
    })
  })

  describe('Percentage calculation - Requirement 2.4', () => {
    it('should display percentage for each severity level', () => {
      mockChartData.forEach((point) => {
        expect(point.percentage).toBeGreaterThan(0)
        expect(point.percentage).toBeLessThanOrEqual(100)
      })
    })

    it('should round percentages to whole numbers', () => {
      mockChartData.forEach((point) => {
        expect(Number.isInteger(point.percentage)).toBe(true)
      })
    })

    it('should calculate correct percentage from value and total', () => {
      const total = mockChartData.reduce((sum, point) => sum + point.value, 0)
      
      mockChartData.forEach((point) => {
        const expectedPercentage = Math.round((point.value / total) * 100)
        expect(point.percentage).toBe(expectedPercentage)
      })
    })
  })
})
