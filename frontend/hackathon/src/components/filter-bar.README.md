# FilterBar Component

## Overview

The `FilterBar` component provides interactive filter controls for the PFMEA dashboard. It implements Requirements 7.1, 7.4, 10.1, 10.2, and 10.4 from the PFMEA Dashboard Customization specification.

## Features

- **Procedure Selector**: Dropdown to select a specific procedure or view all procedures
- **Risk Level Filter**: Multi-select checkboxes for filtering by risk level (remote, low, moderate, high, very_high)
- **Severity Filter**: Multi-select checkboxes for filtering by severity rating (1-5)
- **Process Type Filter**: Multi-select checkboxes for filtering by process type (assembly, inspection, calibration, test)
- **Active Filter Count Badge**: Displays the number of active filters
- **Clear Filters Button**: Resets all filters to their default state

## Usage

```tsx
import { FilterBar } from '@/components/filter-bar'
import type { Procedure, RiskLevel, ProcessType } from '@/types/pfmea'

function DashboardPage() {
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | 'all'>('all')
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([])
  const [selectedSeverities, setSelectedSeverities] = useState<number[]>([])
  const [selectedProcessTypes, setSelectedProcessTypes] = useState<ProcessType[]>([])

  const handleClearFilters = () => {
    setSelectedProcedureId('all')
    setSelectedRiskLevels([])
    setSelectedSeverities([])
    setSelectedProcessTypes([])
  }

  return (
    <FilterBar
      procedures={procedures}
      selectedProcedureId={selectedProcedureId}
      selectedRiskLevels={selectedRiskLevels}
      selectedSeverities={selectedSeverities}
      selectedProcessTypes={selectedProcessTypes}
      onProcedureChange={setSelectedProcedureId}
      onRiskLevelsChange={setSelectedRiskLevels}
      onSeveritiesChange={setSelectedSeverities}
      onProcessTypesChange={setSelectedProcessTypes}
      onClearFilters={handleClearFilters}
    />
  )
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `procedures` | `Procedure[]` | Array of available procedures |
| `selectedProcedureId` | `string \| 'all'` | Currently selected procedure ID or 'all' |
| `selectedRiskLevels` | `RiskLevel[]` | Array of selected risk levels |
| `selectedSeverities` | `number[]` | Array of selected severity values (1-5) |
| `selectedProcessTypes` | `ProcessType[]` | Array of selected process types |
| `onProcedureChange` | `(id: string \| 'all') => void` | Callback when procedure selection changes |
| `onRiskLevelsChange` | `(levels: RiskLevel[]) => void` | Callback when risk level selection changes |
| `onSeveritiesChange` | `(severities: number[]) => void` | Callback when severity selection changes |
| `onProcessTypesChange` | `(types: ProcessType[]) => void` | Callback when process type selection changes |
| `onClearFilters` | `() => void` | Callback when clear filters button is clicked |

## Integration with Filter Logic

The FilterBar component works seamlessly with the filter utility functions from `@/lib/filters`:

```tsx
import { applyFilters } from '@/lib/filters'

// Apply filters to PFMEA items
const filteredItems = applyFilters(allPFMEAItems, {
  selectedProcedureId,
  selectedRiskLevels,
  selectedSeverities,
  selectedProcessTypes,
})
```

## Responsive Design

The FilterBar adapts to different screen sizes:
- **Mobile (< 768px)**: Filters stack vertically
- **Tablet (≥ 768px)**: 2-column grid layout
- **Desktop (≥ 1024px)**: 4-column grid layout

## Accessibility

- All checkboxes are properly labeled with `htmlFor` attributes
- Keyboard navigation is fully supported
- Focus states are clearly visible
- ARIA attributes are handled by shadcn/ui components

## Testing

Unit tests are available in `filter-bar.test.tsx` covering:
- Active filter count calculation
- Toggle logic for all filter types
- Procedure data validation

Run tests with:
```bash
npm test -- filter-bar.test.tsx --run
```

## Files

- `filter-bar.tsx` - Main component implementation
- `filter-bar.test.tsx` - Unit tests
- `filter-bar.example.tsx` - Usage example
- `filter-bar.README.md` - This documentation
