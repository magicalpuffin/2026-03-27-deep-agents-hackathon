/**
 * Unit tests for filter utility functions
 */

import { describe, it, expect } from 'vitest';
import { applyFilters, computeMetrics, prepareChartData } from './filters';
import type { PFMEAItem } from '../types/pfmea';

// Mock PFMEA items for testing
const mockItems: PFMEAItem[] = [
  {
    item_id: '1',
    procedure_id: 'proc-1',
    process_key: 'p1',
    summary: 'Test item 1',
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
    process_key: 'p2',
    summary: 'Test item 2',
    hazard: 'Hazard 2',
    hazard_category: 'Mechanical',
    severity: 3,
    risk_level: 'moderate',
    mitigation: 'Mitigation 2',
    process_type: 'inspection',
  },
  {
    item_id: '3',
    procedure_id: 'proc-2',
    process_key: 'p3',
    summary: 'Test item 3',
    hazard: 'Hazard 3',
    hazard_category: 'Chemical',
    severity: 4,
    risk_level: 'high',
    mitigation: 'Mitigation 3',
    process_type: 'test',
  },
  {
    item_id: '4',
    procedure_id: 'proc-2',
    process_key: 'p4',
    summary: 'Test item 4',
    hazard: 'Hazard 4',
    hazard_category: 'Thermal',
    severity: 1,
    risk_level: 'remote',
    mitigation: 'Mitigation 4',
    process_type: 'calibration',
  },
];

describe('applyFilters', () => {
  it('should return all items when no filters are applied', () => {
    const result = applyFilters(mockItems, {});
    expect(result).toEqual(mockItems);
    expect(result.length).toBe(4);
  });

  it('should filter by procedure ID', () => {
    const result = applyFilters(mockItems, {
      selectedProcedureId: 'proc-1',
    });
    expect(result.length).toBe(2);
    expect(result.every((item) => item.procedure_id === 'proc-1')).toBe(true);
  });

  it('should return all items when procedure filter is "all"', () => {
    const result = applyFilters(mockItems, {
      selectedProcedureId: 'all',
    });
    expect(result.length).toBe(4);
  });

  it('should filter by single risk level', () => {
    const result = applyFilters(mockItems, {
      selectedRiskLevels: ['high'],
    });
    expect(result.length).toBe(1);
    expect(result[0].risk_level).toBe('high');
  });

  it('should filter by multiple risk levels', () => {
    const result = applyFilters(mockItems, {
      selectedRiskLevels: ['high', 'very_high'],
    });
    expect(result.length).toBe(2);
    expect(result.every((item) => ['high', 'very_high'].includes(item.risk_level))).toBe(true);
  });

  it('should filter by single severity', () => {
    const result = applyFilters(mockItems, {
      selectedSeverities: [5],
    });
    expect(result.length).toBe(1);
    expect(result[0].severity).toBe(5);
  });

  it('should filter by multiple severities', () => {
    const result = applyFilters(mockItems, {
      selectedSeverities: [4, 5],
    });
    expect(result.length).toBe(2);
    expect(result.every((item) => [4, 5].includes(item.severity))).toBe(true);
  });

  it('should filter by single process type', () => {
    const result = applyFilters(mockItems, {
      selectedProcessTypes: ['assembly'],
    });
    expect(result.length).toBe(1);
    expect(result[0].process_type).toBe('assembly');
  });

  it('should filter by multiple process types', () => {
    const result = applyFilters(mockItems, {
      selectedProcessTypes: ['assembly', 'inspection'],
    });
    expect(result.length).toBe(2);
    expect(result.every((item) => ['assembly', 'inspection'].includes(item.process_type!))).toBe(true);
  });

  it('should apply multiple filters with AND logic', () => {
    const result = applyFilters(mockItems, {
      selectedProcedureId: 'proc-1',
      selectedRiskLevels: ['moderate'],
      selectedSeverities: [3],
    });
    expect(result.length).toBe(1);
    expect(result[0].item_id).toBe('2');
  });

  it('should return empty array when no items match all filters', () => {
    const result = applyFilters(mockItems, {
      selectedProcedureId: 'proc-1',
      selectedRiskLevels: ['remote'],
    });
    expect(result.length).toBe(0);
  });

  it('should handle empty filter arrays', () => {
    const result = applyFilters(mockItems, {
      selectedRiskLevels: [],
      selectedSeverities: [],
      selectedProcessTypes: [],
    });
    expect(result.length).toBe(4);
  });

  it('should handle items without process_type', () => {
    const itemsWithoutType: PFMEAItem[] = [
      {
        item_id: '5',
        procedure_id: 'proc-3',
        process_key: 'p5',
        summary: 'Test item 5',
        hazard: 'Hazard 5',
        hazard_category: 'Other',
        severity: 2,
        risk_level: 'low',
        mitigation: 'Mitigation 5',
      },
    ];

    const result = applyFilters(itemsWithoutType, {
      selectedProcessTypes: ['assembly'],
    });
    expect(result.length).toBe(0);
  });

  it('should combine procedure and risk level filters', () => {
    const result = applyFilters(mockItems, {
      selectedProcedureId: 'proc-2',
      selectedRiskLevels: ['high', 'remote'],
    });
    expect(result.length).toBe(2);
    expect(result.every((item) => item.procedure_id === 'proc-2')).toBe(true);
  });

  it('should combine all four filter types', () => {
    const result = applyFilters(mockItems, {
      selectedProcedureId: 'proc-1',
      selectedRiskLevels: ['very_high', 'moderate'],
      selectedSeverities: [3, 5],
      selectedProcessTypes: ['assembly', 'inspection'],
    });
    expect(result.length).toBe(2);
    expect(result.every((item) => item.procedure_id === 'proc-1')).toBe(true);
  });
});

describe('computeMetrics', () => {
  it('should compute correct metrics for all items', () => {
    const metrics = computeMetrics(mockItems);
    
    expect(metrics.totalPFMEAItems).toBe(4);
    expect(metrics.highRiskCount).toBe(2); // 'high' and 'very_high'
    expect(metrics.criticalSeverityCount).toBe(2); // severity 4 and 5
    expect(metrics.totalProcedures).toBe(2); // 'proc-1' and 'proc-2'
  });

  it('should return zero metrics for empty array', () => {
    const metrics = computeMetrics([]);
    
    expect(metrics.totalPFMEAItems).toBe(0);
    expect(metrics.highRiskCount).toBe(0);
    expect(metrics.criticalSeverityCount).toBe(0);
    expect(metrics.totalProcedures).toBe(0);
  });

  it('should count only high and very_high risk levels', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], risk_level: 'very_high' },
      { ...mockItems[1], risk_level: 'high' },
      { ...mockItems[2], risk_level: 'moderate' },
      { ...mockItems[3], risk_level: 'low' },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.highRiskCount).toBe(2);
  });

  it('should count only severity 4 and 5 as critical', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], severity: 5 },
      { ...mockItems[1], severity: 4 },
      { ...mockItems[2], severity: 3 },
      { ...mockItems[3], severity: 2 },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.criticalSeverityCount).toBe(2);
  });

  it('should count unique procedures correctly', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], procedure_id: 'proc-1' },
      { ...mockItems[1], procedure_id: 'proc-1' },
      { ...mockItems[2], procedure_id: 'proc-2' },
      { ...mockItems[3], procedure_id: 'proc-3' },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.totalProcedures).toBe(3);
  });

  it('should handle single procedure with multiple items', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], procedure_id: 'proc-1' },
      { ...mockItems[1], procedure_id: 'proc-1' },
      { ...mockItems[2], procedure_id: 'proc-1' },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.totalPFMEAItems).toBe(3);
    expect(metrics.totalProcedures).toBe(1);
  });

  it('should compute metrics for filtered data', () => {
    const filtered = applyFilters(mockItems, {
      selectedProcedureId: 'proc-1',
    });
    const metrics = computeMetrics(filtered);
    
    expect(metrics.totalPFMEAItems).toBe(2);
    expect(metrics.highRiskCount).toBe(1); // only 'very_high' from proc-1
    expect(metrics.criticalSeverityCount).toBe(1); // only severity 5 from proc-1
    expect(metrics.totalProcedures).toBe(1); // only proc-1
  });

  it('should handle all items with high risk', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], risk_level: 'very_high' },
      { ...mockItems[1], risk_level: 'high' },
      { ...mockItems[2], risk_level: 'very_high' },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.highRiskCount).toBe(3);
    expect(metrics.totalPFMEAItems).toBe(3);
  });

  it('should handle all items with critical severity', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], severity: 5 },
      { ...mockItems[1], severity: 4 },
      { ...mockItems[2], severity: 5 },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.criticalSeverityCount).toBe(3);
    expect(metrics.totalPFMEAItems).toBe(3);
  });

  it('should handle items with no high risk or critical severity', () => {
    const items: PFMEAItem[] = [
      { ...mockItems[0], risk_level: 'low', severity: 1 },
      { ...mockItems[1], risk_level: 'remote', severity: 2 },
      { ...mockItems[2], risk_level: 'moderate', severity: 3 },
    ];
    
    const metrics = computeMetrics(items);
    expect(metrics.highRiskCount).toBe(0);
    expect(metrics.criticalSeverityCount).toBe(0);
    expect(metrics.totalPFMEAItems).toBe(3);
  });
});

describe('prepareChartData', () => {
  describe('risk_level grouping', () => {
    it('should group items by risk level with correct counts', () => {
      const result = prepareChartData(mockItems, 'risk_level');
      
      expect(result.length).toBe(4);
      expect(result.find(d => d.name === 'very_high')?.value).toBe(1);
      expect(result.find(d => d.name === 'moderate')?.value).toBe(1);
      expect(result.find(d => d.name === 'high')?.value).toBe(1);
      expect(result.find(d => d.name === 'remote')?.value).toBe(1);
    });

    it('should calculate correct percentages for risk levels', () => {
      const result = prepareChartData(mockItems, 'risk_level');
      
      // Each risk level appears once out of 4 items = 25%
      expect(result.every(d => d.percentage === 25)).toBe(true);
    });

    it('should apply correct colors for risk levels', () => {
      const result = prepareChartData(mockItems, 'risk_level');
      
      expect(result.find(d => d.name === 'remote')?.fill).toBe('hsl(142, 76%, 36%)');
      expect(result.find(d => d.name === 'moderate')?.fill).toBe('hsl(25, 95%, 53%)');
      expect(result.find(d => d.name === 'high')?.fill).toBe('hsl(0, 84%, 60%)');
      expect(result.find(d => d.name === 'very_high')?.fill).toBe('hsl(0, 63%, 31%)');
    });

    it('should handle multiple items with same risk level', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], risk_level: 'high' },
        { ...mockItems[1], risk_level: 'high' },
        { ...mockItems[2], risk_level: 'low' },
      ];
      
      const result = prepareChartData(items, 'risk_level');
      
      expect(result.find(d => d.name === 'high')?.value).toBe(2);
      expect(result.find(d => d.name === 'high')?.percentage).toBe(67);
      expect(result.find(d => d.name === 'low')?.value).toBe(1);
      expect(result.find(d => d.name === 'low')?.percentage).toBe(33);
    });
  });

  describe('severity grouping', () => {
    it('should group items by severity with correct counts', () => {
      const result = prepareChartData(mockItems, 'severity');
      
      expect(result.length).toBe(4);
      expect(result.find(d => d.name === '1')?.value).toBe(1);
      expect(result.find(d => d.name === '3')?.value).toBe(1);
      expect(result.find(d => d.name === '4')?.value).toBe(1);
      expect(result.find(d => d.name === '5')?.value).toBe(1);
    });

    it('should calculate correct percentages for severity', () => {
      const result = prepareChartData(mockItems, 'severity');
      
      // Each severity appears once out of 4 items = 25%
      expect(result.every(d => d.percentage === 25)).toBe(true);
    });

    it('should apply correct colors for severity levels', () => {
      const result = prepareChartData(mockItems, 'severity');
      
      expect(result.find(d => d.name === '1')?.fill).toBe('hsl(142, 76%, 36%)');
      expect(result.find(d => d.name === '3')?.fill).toBe('hsl(25, 95%, 53%)');
      expect(result.find(d => d.name === '4')?.fill).toBe('hsl(0, 84%, 60%)');
      expect(result.find(d => d.name === '5')?.fill).toBe('hsl(0, 63%, 31%)');
    });

    it('should handle multiple items with same severity', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], severity: 5 },
        { ...mockItems[1], severity: 5 },
        { ...mockItems[2], severity: 4 },
      ];
      
      const result = prepareChartData(items, 'severity');
      
      expect(result.find(d => d.name === '5')?.value).toBe(2);
      expect(result.find(d => d.name === '5')?.percentage).toBe(67);
      expect(result.find(d => d.name === '4')?.value).toBe(1);
      expect(result.find(d => d.name === '4')?.percentage).toBe(33);
    });
  });

  describe('process_type grouping', () => {
    it('should group items by process type with correct counts', () => {
      const result = prepareChartData(mockItems, 'process_type');
      
      expect(result.length).toBe(4);
      expect(result.find(d => d.name === 'assembly')?.value).toBe(1);
      expect(result.find(d => d.name === 'inspection')?.value).toBe(1);
      expect(result.find(d => d.name === 'test')?.value).toBe(1);
      expect(result.find(d => d.name === 'calibration')?.value).toBe(1);
    });

    it('should calculate correct percentages for process types', () => {
      const result = prepareChartData(mockItems, 'process_type');
      
      // Each process type appears once out of 4 items = 25%
      expect(result.every(d => d.percentage === 25)).toBe(true);
    });

    it('should apply correct colors for process types', () => {
      const result = prepareChartData(mockItems, 'process_type');
      
      expect(result.find(d => d.name === 'assembly')?.fill).toBe('hsl(221, 83%, 53%)');
      expect(result.find(d => d.name === 'inspection')?.fill).toBe('hsl(142, 76%, 36%)');
      expect(result.find(d => d.name === 'calibration')?.fill).toBe('hsl(280, 65%, 60%)');
      expect(result.find(d => d.name === 'test')?.fill).toBe('hsl(25, 95%, 53%)');
    });

    it('should skip items without process_type', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], process_type: 'assembly' },
        { ...mockItems[1], process_type: undefined },
        { ...mockItems[2], process_type: 'test' },
      ];
      
      const result = prepareChartData(items, 'process_type');
      
      expect(result.length).toBe(2);
      expect(result.find(d => d.name === 'assembly')?.value).toBe(1);
      expect(result.find(d => d.name === 'test')?.value).toBe(1);
    });

    it('should handle multiple items with same process type', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], process_type: 'assembly' },
        { ...mockItems[1], process_type: 'assembly' },
        { ...mockItems[2], process_type: 'inspection' },
      ];
      
      const result = prepareChartData(items, 'process_type');
      
      expect(result.find(d => d.name === 'assembly')?.value).toBe(2);
      expect(result.find(d => d.name === 'assembly')?.percentage).toBe(67);
      expect(result.find(d => d.name === 'inspection')?.value).toBe(1);
      expect(result.find(d => d.name === 'inspection')?.percentage).toBe(33);
    });
  });

  describe('hazard_category grouping', () => {
    it('should group items by hazard category with correct counts', () => {
      const result = prepareChartData(mockItems, 'hazard_category');
      
      expect(result.length).toBe(4);
      expect(result.find(d => d.name === 'Electrical')?.value).toBe(1);
      expect(result.find(d => d.name === 'Mechanical')?.value).toBe(1);
      expect(result.find(d => d.name === 'Chemical')?.value).toBe(1);
      expect(result.find(d => d.name === 'Thermal')?.value).toBe(1);
    });

    it('should skip items with empty hazard_category', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], hazard_category: 'Electrical' },
        { ...mockItems[1], hazard_category: '' },
        { ...mockItems[2], hazard_category: 'Mechanical' },
      ];
      
      const result = prepareChartData(items, 'hazard_category');
      
      expect(result.length).toBe(2);
      expect(result.find(d => d.name === 'Electrical')?.value).toBe(1);
      expect(result.find(d => d.name === 'Mechanical')?.value).toBe(1);
    });

    it('should skip items with whitespace-only hazard_category', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], hazard_category: 'Electrical' },
        { ...mockItems[1], hazard_category: '   ' },
        { ...mockItems[2], hazard_category: 'Mechanical' },
      ];
      
      const result = prepareChartData(items, 'hazard_category');
      
      expect(result.length).toBe(2);
    });

    it('should return top 10 most frequent hazard categories', () => {
      const items: PFMEAItem[] = Array.from({ length: 15 }, (_, i) => ({
        ...mockItems[0],
        item_id: `item-${i}`,
        hazard_category: `Category ${i + 1}`,
      }));
      
      const result = prepareChartData(items, 'hazard_category');
      
      expect(result.length).toBe(10);
    });

    it('should sort hazard categories by count descending', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], hazard_category: 'A' },
        { ...mockItems[1], hazard_category: 'B' },
        { ...mockItems[2], hazard_category: 'B' },
        { ...mockItems[3], hazard_category: 'C' },
        { ...mockItems[0], hazard_category: 'C' },
        { ...mockItems[1], hazard_category: 'C' },
      ];
      
      const result = prepareChartData(items, 'hazard_category');
      
      expect(result[0].name).toBe('C');
      expect(result[0].value).toBe(3);
      expect(result[1].name).toBe('B');
      expect(result[1].value).toBe(2);
      expect(result[2].name).toBe('A');
      expect(result[2].value).toBe(1);
    });

    it('should calculate correct percentages for hazard categories', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], hazard_category: 'A' },
        { ...mockItems[1], hazard_category: 'A' },
        { ...mockItems[2], hazard_category: 'B' },
        { ...mockItems[3], hazard_category: 'B' },
      ];
      
      const result = prepareChartData(items, 'hazard_category');
      
      expect(result.every(d => d.percentage === 50)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = prepareChartData([], 'risk_level');
      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const result = prepareChartData([mockItems[0]], 'risk_level');
      
      expect(result.length).toBe(1);
      expect(result[0].value).toBe(1);
      expect(result[0].percentage).toBe(100);
    });

    it('should handle all items with same value', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], risk_level: 'high' },
        { ...mockItems[1], risk_level: 'high' },
        { ...mockItems[2], risk_level: 'high' },
      ];
      
      const result = prepareChartData(items, 'risk_level');
      
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('high');
      expect(result[0].value).toBe(3);
      expect(result[0].percentage).toBe(100);
    });

    it('should round percentages correctly', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], risk_level: 'high' },
        { ...mockItems[1], risk_level: 'high' },
        { ...mockItems[2], risk_level: 'low' },
      ];
      
      const result = prepareChartData(items, 'risk_level');
      
      // 2/3 = 66.67% should round to 67%
      expect(result.find(d => d.name === 'high')?.percentage).toBe(67);
      // 1/3 = 33.33% should round to 33%
      expect(result.find(d => d.name === 'low')?.percentage).toBe(33);
    });

    it('should handle items with all process_type undefined', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], process_type: undefined },
        { ...mockItems[1], process_type: undefined },
      ];
      
      const result = prepareChartData(items, 'process_type');
      
      expect(result).toEqual([]);
    });

    it('should handle items with all hazard_category empty', () => {
      const items: PFMEAItem[] = [
        { ...mockItems[0], hazard_category: '' },
        { ...mockItems[1], hazard_category: '  ' },
      ];
      
      const result = prepareChartData(items, 'hazard_category');
      
      expect(result).toEqual([]);
    });
  });

  describe('integration with filters', () => {
    it('should prepare chart data from filtered items', () => {
      const filtered = applyFilters(mockItems, {
        selectedProcedureId: 'proc-1',
      });
      const result = prepareChartData(filtered, 'risk_level');
      
      expect(result.length).toBe(2);
      expect(result.find(d => d.name === 'very_high')?.value).toBe(1);
      expect(result.find(d => d.name === 'moderate')?.value).toBe(1);
    });

    it('should handle empty filtered results', () => {
      const filtered = applyFilters(mockItems, {
        selectedRiskLevels: ['low'],
      });
      const result = prepareChartData(filtered, 'risk_level');
      
      expect(result).toEqual([]);
    });
  });
});
