# Design Document: PFMEA Dashboard Customization

## Overview

This design customizes the existing React dashboard to display manufacturing process and PFMEA data with interactive visualizations, filtering capabilities, and detailed data tables. The dashboard will transform the current placeholder implementation into a fully functional risk analysis interface for manufacturing engineers.

The dashboard serves as the primary interface for visualizing risk distribution, severity patterns, and process failure modes across manufacturing procedures. It integrates with the existing FastAPI backend to fetch PFMEA data and provides interactive filtering and drill-down capabilities.

### Key Design Goals

- Leverage existing UI components (shadcn/ui, Recharts) to minimize new dependencies
- Maintain responsive design patterns already established in the codebase
- Integrate seamlessly with the existing API layer without backend modifications
- Provide real-time filtering and interaction without page reloads
- Support both aggregated (all procedures) and procedure-specific views

## Architecture

### Component Hierarchy

```
DashboardPage
├── AppSidebar (existing)
├── SiteHeader (existing)
└── DashboardContent (new)
    ├── FilterBar (new)
    │   ├── ProcedureSelector
    │   ├── RiskLevelFilter
    │   ├── SeverityFilter
    │   ├── ProcessTypeFilter
    │   └── ClearFiltersButton
    ├── SectionCards (modified)
    │   ├── TotalPFMEACard
    │   ├── HighRiskCard
    │   ├── CriticalSeverityCard
    │   └── TotalProceduresCard
    ├── ChartsGrid (new)
    │   ├── RiskDistributionChart (modified from existing)
    │   ├── SeverityDistributionChart (new)
    │   ├── ProcessTypeChart (new)
    │   └── HazardCategoryChart (new)
    └── DataTable (modified)
        └── PFMEATableRow (modified)
```

### State Management Strategy

The dashboard uses React hooks for local state management without introducing Redux or other state libraries:

**Primary State Container:** `DashboardContent` component

```typescript
interface DashboardState {
  // Raw data from API
  procedures: Procedure[]
  pfmeaItems: PFMEAItem[]
  
  // Loading and error states
  isLoading: boolean
  error: string | null
  
  // Filter state
  selectedProcedureId: string | 'all'
  selectedRiskLevels: RiskLevel[]
  selectedSeverities: number[]
  selectedProcessTypes: ProcessType[]
  
  // Derived/computed data
  filteredPFMEAItems: PFMEAItem[]
  aggregatedMetrics: DashboardMetrics
}
```

**State Flow:**
1. Initial load: Fetch all procedures and PFMEA items via API
2. Store raw data in state
3. Apply filters to compute `filteredPFMEAItems`
4. Derive metrics from filtered data
5. Pass filtered data and metrics to child components via props

**Why Local State:**
- Single page application with no cross-page state sharing needed
- Filter state is ephemeral (doesn't need persistence)
- API responses are cached in browser for 5 minutes
- Simpler debugging and testing without global state

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Component Mount                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Calls (parallel)                                        │
│  - GET /api/procedures                                       │
│  - GET /api/procedures/{id}/pfmea (for each procedure)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Store in State                                              │
│  - procedures: Procedure[]                                   │
│  - pfmeaItems: PFMEAItem[] (flattened from all procedures)  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  User Interaction (filter change, chart click)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Update Filter State                                         │
│  - selectedProcedureId, selectedRiskLevels, etc.            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Compute Derived Data (useMemo)                              │
│  - filteredPFMEAItems = applyFilters(pfmeaItems, filters)   │
│  - aggregatedMetrics = computeMetrics(filteredPFMEAItems)   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Re-render Child Components                                  │
│  - Charts update with filtered data                          │
│  - Cards update with new metrics                             │
│  - Table updates with filtered rows                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Core Data Types

```typescript
// Matches backend schema from agent/src/schemas.py
type RiskLevel = 'remote' | 'low' | 'moderate' | 'high' | 'very_high'
type ProcessType = 'assembly' | 'inspection' | 'calibration' | 'test'
type SeverityScale = 1 | 2 | 3 | 4 | 5

interface Procedure {
  id: string
  title: string
  created_at: number
  file_name: string
}

interface PFMEAItem {
  id: string
  procedure_id: string
  process_key: string
  summary: string
  hazard: string
  hazard_category: string
  severity: SeverityScale
  probability_of_occurrence: number
  probability_of_harm: number
  risk_level: RiskLevel
  mitigation: string
  // Joined from process for display
  process_name?: string
  process_type?: ProcessType
}

interface DashboardMetrics {
  totalPFMEAItems: number
  highRiskCount: number
  criticalSeverityCount: number
  totalProcedures: number
}

interface ChartDataPoint {
  name: string
  value: number
  percentage: number
  fill: string
}
```

### FilterBar Component

**Purpose:** Provides UI controls for filtering dashboard data

**Props:**
```typescript
interface FilterBarProps {
  procedures: Procedure[]
  selectedProcedureId: string | 'all'
  selectedRiskLevels: RiskLevel[]
  selectedSeverities: number[]
  selectedProcessTypes: ProcessType[]
  onProcedureChange: (id: string | 'all') => void
  onRiskLevelsChange: (levels: RiskLevel[]) => void
  onSeveritiesChange: (severities: number[]) => void
  onProcessTypesChange: (types: ProcessType[]) => void
  onClearFilters: () => void
}
```

**Implementation Notes:**
- Uses shadcn/ui Select component for procedure dropdown
- Uses shadcn/ui Checkbox for multi-select filters
- Clear Filters button resets all filters to default state
- Displays active filter count badge

### SectionCards Component (Modified)

**Purpose:** Display key metrics at a glance

**Props:**
```typescript
interface SectionCardsProps {
  metrics: DashboardMetrics
  isLoading: boolean
}
```

**Cards:**
1. Total PFMEA Items - displays `metrics.totalPFMEAItems`
2. High Risk Items - displays `metrics.highRiskCount` (high + very_high)
3. Critical Severity Items - displays `metrics.criticalSeverityCount` (severity 4 + 5)
4. Total Procedures - displays `metrics.totalProcedures`

**Implementation Notes:**
- Reuses existing Card component structure
- Removes placeholder trend badges
- Shows skeleton loaders when `isLoading` is true

### RiskDistributionChart Component

**Purpose:** Visualize count of PFMEA items by risk level

**Props:**
```typescript
interface RiskDistributionChartProps {
  data: ChartDataPoint[]
  onSegmentClick: (riskLevel: RiskLevel) => void
}
```

**Chart Type:** Bar chart (Recharts BarChart)

**Color Mapping:**
- remote: `hsl(142, 76%, 36%)` (green)
- low: `hsl(48, 96%, 53%)` (yellow)
- moderate: `hsl(25, 95%, 53%)` (orange)
- high: `hsl(0, 84%, 60%)` (red)
- very_high: `hsl(0, 63%, 31%)` (dark red)

**Interactions:**
- Click on bar segment to filter table by that risk level
- Hover shows tooltip with count and percentage

### SeverityDistributionChart Component

**Purpose:** Visualize count of PFMEA items by severity rating

**Props:**
```typescript
interface SeverityDistributionChartProps {
  data: ChartDataPoint[]
}
```

**Chart Type:** Bar chart with gradient colors

**Color Mapping:**
- 1 (Negligible): `hsl(142, 76%, 36%)` (light green)
- 2 (Minor): `hsl(48, 96%, 53%)` (yellow)
- 3 (Moderate): `hsl(25, 95%, 53%)` (orange)
- 4 (Critical): `hsl(0, 84%, 60%)` (red)
- 5 (Catastrophic): `hsl(0, 63%, 31%)` (dark red)

**Display:**
- X-axis: Severity labels (Negligible, Minor, Moderate, Critical, Catastrophic)
- Y-axis: Count
- Tooltip: Shows severity name, count, and percentage

### ProcessTypeChart Component

**Purpose:** Visualize count of PFMEA items by process type

**Props:**
```typescript
interface ProcessTypeChartProps {
  data: ChartDataPoint[]
  onSegmentClick: (processType: ProcessType) => void
}
```

**Chart Type:** Pie chart (Recharts PieChart)

**Color Mapping:**
- assembly: `hsl(221, 83%, 53%)` (blue)
- inspection: `hsl(142, 76%, 36%)` (green)
- calibration: `hsl(280, 65%, 60%)` (purple)
- test: `hsl(25, 95%, 53%)` (orange)

**Interactions:**
- Click on segment to filter table by that process type
- Hover shows tooltip with count and percentage

### HazardCategoryChart Component

**Purpose:** Visualize top 10 most frequent hazard categories

**Props:**
```typescript
interface HazardCategoryChartProps {
  data: ChartDataPoint[]
  onSegmentClick: (category: string) => void
}
```

**Chart Type:** Horizontal bar chart

**Implementation Notes:**
- Aggregates PFMEA items by `hazard_category` field
- Sorts by count descending
- Takes top 10 categories
- Handles empty/undefined categories by filtering them out
- Click on bar to filter table by that hazard category

### DataTable Component (Modified)

**Purpose:** Display detailed PFMEA data in sortable, searchable table

**Props:**
```typescript
interface DataTableProps {
  data: PFMEAItem[]
  isLoading: boolean
}
```

**Columns:**
- Summary (sortable, searchable)
- Hazard (sortable, searchable)
- Hazard Category (sortable, filterable)
- Severity (sortable, badge with color)
- Risk Level (sortable, badge with color)
- Mitigation (searchable)
- Process Name (sortable, linked)
- Process Type (sortable, badge)

**Features:**
- Column sorting (ascending/descending)
- Global search across all text columns
- Pagination (25 rows per page)
- Row selection (for future export functionality)
- Responsive column hiding on mobile

**Implementation Notes:**
- Uses existing DataTable component structure
- Modifies schema to match PFMEAItem type
- Adds custom cell renderers for badges and links

## Data Models

### API Response Caching

To reduce server load and improve performance, API responses are cached in memory using a simple cache utility:

```typescript
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class APICache {
  private cache: Map<string, CacheEntry<any>>
  private ttl: number = 5 * 60 * 1000 // 5 minutes
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }
  
  clear(): void {
    this.cache.clear()
  }
}
```

### Data Transformation Pipeline

**Step 1: Fetch Procedures**
```typescript
const procedures = await fetchProcedures()
// Returns: Procedure[]
```

**Step 2: Fetch PFMEA Items for Each Procedure**
```typescript
const pfmeaPromises = procedures.map(p => 
  fetchProcedurePFMEA(p.id)
)
const pfmeaArrays = await Promise.all(pfmeaPromises)
const allPFMEAItems = pfmeaArrays.flat()
// Returns: PFMEAItem[]
```

**Step 3: Enrich PFMEA Items with Process Data**
```typescript
// Process data is already included in PFMEA response via join
// No additional transformation needed
```

**Step 4: Apply Filters**
```typescript
function applyFilters(
  items: PFMEAItem[],
  filters: FilterState
): PFMEAItem[] {
  return items.filter(item => {
    // Procedure filter
    if (filters.selectedProcedureId !== 'all' && 
        item.procedure_id !== filters.selectedProcedureId) {
      return false
    }
    
    // Risk level filter
    if (filters.selectedRiskLevels.length > 0 && 
        !filters.selectedRiskLevels.includes(item.risk_level)) {
      return false
    }
    
    // Severity filter
    if (filters.selectedSeverities.length > 0 && 
        !filters.selectedSeverities.includes(item.severity)) {
      return false
    }
    
    // Process type filter
    if (filters.selectedProcessTypes.length > 0 && 
        !filters.selectedProcessTypes.includes(item.process_type)) {
      return false
    }
    
    return true
  })
}
```

**Step 5: Compute Aggregated Metrics**
```typescript
function computeMetrics(items: PFMEAItem[]): DashboardMetrics {
  return {
    totalPFMEAItems: items.length,
    highRiskCount: items.filter(i => 
      i.risk_level === 'high' || i.risk_level === 'very_high'
    ).length,
    criticalSeverityCount: items.filter(i => 
      i.severity >= 4
    ).length,
    totalProcedures: new Set(items.map(i => i.procedure_id)).size
  }
}
```

**Step 6: Prepare Chart Data**
```typescript
function prepareChartData(
  items: PFMEAItem[],
  groupBy: keyof PFMEAItem,
  colorMap: Record<string, string>
): ChartDataPoint[] {
  const counts = items.reduce((acc, item) => {
    const key = String(item[groupBy])
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const total = items.length
  
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / total) * 100),
    fill: colorMap[name] || 'hsl(0, 0%, 50%)'
  }))
}
```

### Error Handling Model

```typescript
interface APIError {
  message: string
  status: number
  endpoint: string
}

function handleAPIError(error: unknown): APIError {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.detail || error.message,
      status: error.response?.status || 500,
      endpoint: error.config?.url || 'unknown'
    }
  }
  
  return {
    message: 'An unexpected error occurred',
    status: 500,
    endpoint: 'unknown'
  }
}
```

**Error Display:**
- Show error toast notification using shadcn/ui Sonner
- Display error message in place of charts/tables
- Provide "Retry" button to re-fetch data
- Log errors to console for debugging

