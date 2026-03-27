# RiskDistributionChart Component

A bar chart component that visualizes the distribution of PFMEA items by risk level.

## Overview

The `RiskDistributionChart` component displays a color-coded bar chart showing how PFMEA (Process Failure Mode and Effects Analysis) items are distributed across different risk levels. It supports interactive filtering through click handlers and provides detailed tooltips with count and percentage information.

## Requirements Validation

This component validates the following requirements from the PFMEA Dashboard Customization spec:

- **Requirement 1.1**: Fetches and displays aggregated risk data
- **Requirement 1.2**: Shows count of PFMEA items grouped by risk level
- **Requirement 1.3**: Uses color coding for risk level visualization
- **Requirement 1.4**: Supports click-to-filter interaction

## Features

- **Color-coded bars**: Each risk level has a distinct color
  - Remote: Green (`hsl(142, 76%, 36%)`)
  - Low: Yellow (`hsl(48, 96%, 53%)`)
  - Moderate: Orange (`hsl(25, 95%, 53%)`)
  - High: Red (`hsl(0, 84%, 60%)`)
  - Very High: Dark Red (`hsl(0, 63%, 31%)`)

- **Interactive tooltips**: Hover over bars to see count and percentage
- **Click-to-filter**: Click on a bar to filter the data table by that risk level
- **Responsive design**: Adapts to different screen sizes
- **Accessible**: Uses Recharts' accessibility features

## Props

```typescript
interface RiskDistributionChartProps {
  data: ChartDataPoint[]
  onSegmentClick?: (riskLevel: RiskLevel) => void
}
```

### `data`
- **Type**: `ChartDataPoint[]`
- **Required**: Yes
- **Description**: Array of chart data points containing risk level distribution data

Each `ChartDataPoint` should have:
```typescript
{
  name: string          // Risk level name (e.g., 'high', 'moderate')
  value: number         // Count of items at this risk level
  percentage: number    // Percentage of total items
  fill: string          // Color for the bar (HSL format)
}
```

### `onSegmentClick`
- **Type**: `(riskLevel: RiskLevel) => void`
- **Required**: No
- **Description**: Callback function invoked when a bar is clicked. Receives the risk level as a parameter.

## Usage

### Basic Usage

```tsx
import { RiskDistributionChart } from '@/components/risk-distribution-chart'
import type { ChartDataPoint } from '@/types/pfmea'

const chartData: ChartDataPoint[] = [
  { name: 'remote', value: 10, percentage: 10, fill: 'hsl(142, 76%, 36%)' },
  { name: 'low', value: 20, percentage: 20, fill: 'hsl(48, 96%, 53%)' },
  { name: 'moderate', value: 30, percentage: 30, fill: 'hsl(25, 95%, 53%)' },
  { name: 'high', value: 25, percentage: 25, fill: 'hsl(0, 84%, 60%)' },
  { name: 'very_high', value: 15, percentage: 15, fill: 'hsl(0, 63%, 31%)' },
]

function MyDashboard() {
  return <RiskDistributionChart data={chartData} />
}
```

### With Click Handler

```tsx
import { RiskDistributionChart } from '@/components/risk-distribution-chart'
import { prepareChartData } from '@/lib/filters'
import type { RiskLevel } from '@/types/pfmea'

function MyDashboard() {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | null>(null)
  
  const handleSegmentClick = (riskLevel: RiskLevel) => {
    setSelectedRiskLevel(riskLevel)
    // Filter your data table here
  }

  return (
    <RiskDistributionChart
      data={chartData}
      onSegmentClick={handleSegmentClick}
    />
  )
}
```

### With prepareChartData Utility

The `prepareChartData` utility function from `@/lib/filters` can automatically generate chart data from PFMEA items:

```tsx
import { RiskDistributionChart } from '@/components/risk-distribution-chart'
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem } from '@/types/pfmea'

function MyDashboard({ pfmeaItems }: { pfmeaItems: PFMEAItem[] }) {
  // Automatically generate chart data grouped by risk level
  const chartData = prepareChartData(pfmeaItems, 'risk_level')

  return <RiskDistributionChart data={chartData} />
}
```

## Integration with Dashboard

The component is designed to work seamlessly with the PFMEA dashboard:

1. **Data Preparation**: Use `prepareChartData(items, 'risk_level')` to transform PFMEA items into chart data
2. **Filtering**: Connect `onSegmentClick` to your filter state management
3. **Responsive Layout**: The component uses the `@container/card` class for container queries

Example integration:

```tsx
import { RiskDistributionChart } from '@/components/risk-distribution-chart'
import { prepareChartData, applyFilters } from '@/lib/filters'

function Dashboard() {
  const [pfmeaItems, setPfmeaItems] = useState<PFMEAItem[]>([])
  const [filters, setFilters] = useState<FilterState>({
    selectedRiskLevels: [],
  })

  // Apply filters to get filtered items
  const filteredItems = applyFilters(pfmeaItems, filters)

  // Prepare chart data from filtered items
  const chartData = prepareChartData(filteredItems, 'risk_level')

  // Handle bar click to update filters
  const handleRiskLevelClick = (riskLevel: RiskLevel) => {
    setFilters({
      ...filters,
      selectedRiskLevels: [riskLevel],
    })
  }

  return (
    <RiskDistributionChart
      data={chartData}
      onSegmentClick={handleRiskLevelClick}
    />
  )
}
```

## Testing

The component includes comprehensive test coverage:

- **Unit tests**: Test chart data structure, color mapping, click handlers, and tooltip data
- **Integration tests**: Verify integration with the `prepareChartData` utility and filtering logic

Run tests:
```bash
npm test -- risk-distribution-chart --run
```

## Dependencies

- `recharts`: Chart rendering library
- `@/components/ui/card`: Card container component
- `@/components/ui/chart`: Chart utilities and tooltip components
- `@/types/pfmea`: TypeScript type definitions

## Accessibility

The component uses Recharts' built-in accessibility features:
- `accessibilityLayer` prop on BarChart for keyboard navigation
- Semantic HTML structure
- ARIA labels for chart elements
- Keyboard-accessible tooltips

## Styling

The component uses:
- Tailwind CSS for layout and spacing
- HSL color values for consistent theming
- Container queries for responsive behavior
- shadcn/ui design tokens for consistency

## Related Components

- `SeverityDistributionChart`: Similar chart for severity distribution
- `ProcessTypeChart`: Pie chart for process type distribution
- `FilterBar`: Filter controls that work with this chart
- `DataTable`: Table that displays filtered PFMEA items
