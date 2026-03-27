# SeverityDistributionChart Component

## Overview

The `SeverityDistributionChart` component displays a bar chart visualization of PFMEA items grouped by severity rating (1-5). It uses a gradient color scheme from light green (severity 1) to dark red (severity 5) to visually communicate the severity distribution.

## Requirements

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- **2.1**: Display chart showing count of PFMEA items grouped by Severity_Scale
- **2.2**: Use gradient color scheme for severity visualization (1=light, 5=dark)
- **2.3**: Display severity name and count on hover
- **2.4**: Calculate and display percentage of items at each Severity_Scale level

## Usage

```tsx
import { SeverityDistributionChart } from '@/components/severity-distribution-chart'
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

function Dashboard() {
  const [pfmeaItems, setPfmeaItems] = useState<PFMEAItem[]>([])
  
  // Prepare chart data from PFMEA items
  const severityData = prepareChartData(pfmeaItems, 'severity')
  
  return (
    <SeverityDistributionChart data={severityData} />
  )
}
```

## Props

### `data: ChartDataPoint[]`

Array of chart data points prepared by `prepareChartData()` utility function.

**ChartDataPoint Interface:**
```typescript
interface ChartDataPoint {
  name: string        // Severity level as string ('1', '2', '3', '4', '5')
  value: number       // Count of PFMEA items at this severity
  percentage: number  // Percentage of total items (0-100)
  fill: string        // HSL color for the bar
}
```

**Example:**
```typescript
const data = [
  { name: '1', value: 15, percentage: 15, fill: 'hsl(142, 76%, 36%)' },
  { name: '2', value: 25, percentage: 25, fill: 'hsl(48, 96%, 53%)' },
  { name: '3', value: 30, percentage: 30, fill: 'hsl(25, 95%, 53%)' },
  { name: '4', value: 20, percentage: 20, fill: 'hsl(0, 84%, 60%)' },
  { name: '5', value: 10, percentage: 10, fill: 'hsl(0, 63%, 31%)' },
]
```

## Color Scheme

The component uses a gradient color scheme that progresses from light green to dark red:

| Severity | Label        | Color                  | HSL Value            |
|----------|--------------|------------------------|----------------------|
| 1        | Negligible   | Light Green            | hsl(142, 76%, 36%)   |
| 2        | Minor        | Yellow                 | hsl(48, 96%, 53%)    |
| 3        | Moderate     | Orange                 | hsl(25, 95%, 53%)    |
| 4        | Critical     | Red                    | hsl(0, 84%, 60%)     |
| 5        | Catastrophic | Dark Red               | hsl(0, 63%, 31%)     |

## Features

### Gradient Visualization
The color scheme provides an intuitive visual gradient from low severity (light green) to high severity (dark red), making it easy to identify critical items at a glance.

### Interactive Tooltip
Hovering over any bar displays a tooltip with:
- Severity name (e.g., "Critical")
- Count of items
- Percentage of total items

### Responsive Design
The chart adapts to different screen sizes using container queries and responsive padding.

### Accessibility
- Uses `accessibilityLayer` prop for screen reader support
- Semantic color choices that work for most color vision deficiencies
- Clear labels and tooltips

## Data Preparation

Use the `prepareChartData()` utility function from `@/lib/filters` to transform PFMEA items into chart data:

```typescript
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

const pfmeaItems: PFMEAItem[] = [
  { severity: 4, /* ... */ },
  { severity: 4, /* ... */ },
  { severity: 3, /* ... */ },
  { severity: 5, /* ... */ },
]

const chartData = prepareChartData(pfmeaItems, 'severity')
// Returns:
// [
//   { name: '3', value: 1, percentage: 25, fill: 'hsl(25, 95%, 53%)' },
//   { name: '4', value: 2, percentage: 50, fill: 'hsl(0, 84%, 60%)' },
//   { name: '5', value: 1, percentage: 25, fill: 'hsl(0, 63%, 31%)' },
// ]
```

## Empty State Handling

The component gracefully handles empty data:
- Empty array: Displays empty chart with axes
- Single severity level: Shows single bar with 100% percentage
- Partial data: Only displays bars for severity levels present in data

## Integration with Dashboard

The SeverityDistributionChart integrates with the dashboard filtering system:

```typescript
function DashboardContent() {
  const [pfmeaItems, setPfmeaItems] = useState<PFMEAItem[]>([])
  const [filters, setFilters] = useState<FilterState>({})
  
  // Apply filters to get filtered dataset
  const filteredItems = useMemo(
    () => applyFilters(pfmeaItems, filters),
    [pfmeaItems, filters]
  )
  
  // Prepare chart data from filtered items
  const severityData = useMemo(
    () => prepareChartData(filteredItems, 'severity'),
    [filteredItems]
  )
  
  return (
    <div>
      <FilterBar {...filterProps} />
      <SeverityDistributionChart data={severityData} />
    </div>
  )
}
```

## Testing

The component includes comprehensive unit tests covering:
- Chart data structure validation
- Gradient color mapping (Requirement 2.2)
- Tooltip data (Requirements 2.3, 2.4)
- Empty data handling
- Data aggregation logic
- Percentage calculation (Requirement 2.4)

Run tests:
```bash
npm test -- severity-distribution-chart.test.tsx
```

## Dependencies

- `recharts`: Chart rendering library
- `@/components/ui/card`: Card container component
- `@/components/ui/chart`: Chart configuration and tooltip components
- `@/types/pfmea`: TypeScript type definitions

## Related Components

- `RiskDistributionChart`: Similar chart for risk level distribution
- `ProcessTypeChart`: Chart for process type breakdown
- `HazardCategoryChart`: Chart for hazard category distribution
- `FilterBar`: Filtering controls that affect chart data
