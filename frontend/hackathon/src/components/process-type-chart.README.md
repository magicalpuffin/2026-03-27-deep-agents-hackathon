# ProcessTypeChart Component

## Overview

The `ProcessTypeChart` component displays a pie chart showing the distribution of PFMEA items by manufacturing process type. It provides an interactive visualization with color-coded segments and click handlers for filtering.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Features

- **Pie Chart Visualization**: Uses Recharts PieChart to display process type distribution
- **Color Mapping**: Each process type has a distinct color:
  - Assembly: Blue (`hsl(221, 83%, 53%)`)
  - Inspection: Green (`hsl(142, 76%, 36%)`)
  - Calibration: Purple (`hsl(280, 65%, 60%)`)
  - Test: Orange (`hsl(25, 95%, 53%)`)
- **Interactive Segments**: Click on a segment to filter the data table by that process type
- **Tooltip**: Hover over segments to see count and percentage
- **Responsive Design**: Adapts to different screen sizes

## Props

```typescript
interface ProcessTypeChartProps {
  data: ChartDataPoint[]
  onSegmentClick?: (processType: ProcessType) => void
}
```

### `data`
- **Type**: `ChartDataPoint[]`
- **Required**: Yes
- **Description**: Array of chart data points with name, value, percentage, and fill color

### `onSegmentClick`
- **Type**: `(processType: ProcessType) => void`
- **Required**: No
- **Description**: Callback function invoked when a segment is clicked, receives the process type as parameter

## Usage

### Basic Usage

```typescript
import { ProcessTypeChart } from '@/components/process-type-chart'
import type { ChartDataPoint, ProcessType } from '@/types/pfmea'

const chartData: ChartDataPoint[] = [
  { name: 'assembly', value: 25, percentage: 40, fill: 'hsl(221, 83%, 53%)' },
  { name: 'inspection', value: 20, percentage: 32, fill: 'hsl(142, 76%, 36%)' },
  { name: 'calibration', value: 10, percentage: 16, fill: 'hsl(280, 65%, 60%)' },
  { name: 'test', value: 7, percentage: 12, fill: 'hsl(25, 95%, 53%)' },
]

function MyComponent() {
  const handleSegmentClick = (processType: ProcessType) => {
    console.log('Process type clicked:', processType)
  }

  return (
    <ProcessTypeChart
      data={chartData}
      onSegmentClick={handleSegmentClick}
    />
  )
}
```

### With prepareChartData Utility

```typescript
import { ProcessTypeChart } from '@/components/process-type-chart'
import { prepareChartData } from '@/lib/filters'
import type { PFMEAItem, ProcessType } from '@/types/pfmea'

function MyComponent({ pfmeaItems }: { pfmeaItems: PFMEAItem[] }) {
  // Prepare chart data from PFMEA items
  const chartData = prepareChartData(pfmeaItems, 'process_type')

  const handleSegmentClick = (processType: ProcessType) => {
    // Filter data table by process type
    setSelectedProcessType(processType)
  }

  return (
    <ProcessTypeChart
      data={chartData}
      onSegmentClick={handleSegmentClick}
    />
  )
}
```

### Without Click Handler

```typescript
import { ProcessTypeChart } from '@/components/process-type-chart'

function MyComponent({ chartData }: { chartData: ChartDataPoint[] }) {
  return <ProcessTypeChart data={chartData} />
}
```

## Data Structure

The component expects data in the following format:

```typescript
interface ChartDataPoint {
  name: string          // Process type: 'assembly', 'inspection', 'calibration', 'test'
  value: number         // Count of PFMEA items
  percentage: number    // Percentage of total (0-100)
  fill: string          // Color in HSL format
}
```

## Process Types

The component supports four manufacturing process types:

1. **Assembly** - Blue
2. **Inspection** - Green
3. **Calibration** - Purple
4. **Test** - Orange

## Integration with Dashboard

The ProcessTypeChart is designed to work with the PFMEA dashboard:

1. **Data Preparation**: Use `prepareChartData(items, 'process_type')` to generate chart data
2. **Filtering**: Connect `onSegmentClick` to update filter state
3. **Responsive Layout**: Place in a grid with other charts

## Accessibility

- Uses Recharts `accessibilityLayer` for keyboard navigation
- Provides semantic HTML structure with Card components
- Includes descriptive labels and tooltips

## Testing

The component includes comprehensive test coverage:

- **Unit Tests**: `process-type-chart.test.tsx`
  - Data structure validation
  - Color mapping verification
  - Click handler testing
  - Empty data handling
- **Integration Tests**: `process-type-chart.integration.test.tsx`
  - Integration with `prepareChartData` utility
  - Filtering scenarios
  - Data transformation

## Dependencies

- `recharts`: Chart rendering library
- `@/components/ui/card`: Card container components
- `@/components/ui/chart`: Chart configuration and tooltip components
- `@/types/pfmea`: TypeScript type definitions

## Related Components

- `RiskDistributionChart`: Displays risk level distribution
- `SeverityDistributionChart`: Displays severity rating distribution
- `HazardCategoryChart`: Displays hazard category distribution
- `FilterBar`: Provides filtering controls for the dashboard

## Requirements Mapping

- **Requirement 3.1**: Chart shows count of PFMEA items grouped by process type
- **Requirement 3.2**: Includes all four process type categories
- **Requirement 3.3**: Click handler filters data table by process type
- **Requirement 3.4**: Displays total count for each process type with tooltip
