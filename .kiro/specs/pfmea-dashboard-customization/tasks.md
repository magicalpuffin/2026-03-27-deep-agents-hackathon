# Implementation Plan: PFMEA Dashboard Customization

## Overview

This implementation plan transforms the existing React dashboard into a fully functional PFMEA risk analysis interface. The approach builds incrementally from data types and API integration through individual components, culminating in full integration. Each step validates functionality through the browser before proceeding.

## Tasks

- [ ] 1. Set up core data types and API integration layer
  - [x] 1.1 Create TypeScript interfaces for PFMEA data models
    - Create `frontend/hackathon/src/types/pfmea.ts` with interfaces for `RiskLevel`, `ProcessType`, `SeverityScale`, `Procedure`, `PFMEAItem`, `DashboardMetrics`, and `ChartDataPoint`
    - Ensure types match backend schema from `agent/src/schemas.py`
    - _Requirements: 6.1, 6.2_
  
  - [x] 1.2 Create API client with caching
    - Create `frontend/hackathon/src/lib/api-client.ts` with functions for `fetchProcedures()` and `fetchProcedurePFMEA(procedureId)`
    - Implement `APICache` class with 5-minute TTL
    - Add error handling with `APIError` type
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ]* 1.3 Write unit tests for API client
    - Test cache hit/miss scenarios
    - Test error handling for failed API calls
    - _Requirements: 6.3_

- [ ] 2. Create data transformation utilities
  - [x] 2.1 Implement filter application logic
    - Create `frontend/hackathon/src/lib/filters.ts` with `applyFilters()` function
    - Support filtering by procedure, risk level, severity, and process type
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 2.2 Implement metrics computation
    - Add `computeMetrics()` function to calculate dashboard summary metrics
    - Calculate total items, high risk count, critical severity count, and procedure count
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 2.3 Implement chart data preparation
    - Add `prepareChartData()` function to transform PFMEA items into chart-ready format
    - Support grouping by risk level, severity, process type, and hazard category
    - _Requirements: 1.2, 2.1, 3.1, 8.1_
  
  - [ ]* 2.4 Write unit tests for data transformation utilities
    - Test filter combinations with AND logic
    - Test metrics computation with edge cases (empty data, single item)
    - Test chart data preparation with various groupings
    - _Requirements: 7.2, 5.5_

- [x] 3. Checkpoint - Verify data layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create FilterBar component
  - [x] 4.1 Implement FilterBar with all filter controls
    - Create `frontend/hackathon/src/components/filter-bar.tsx`
    - Add procedure selector dropdown using shadcn/ui Select
    - Add multi-select checkboxes for risk levels, severities, and process types
    - Add "Clear Filters" button
    - Display active filter count badge
    - _Requirements: 7.1, 7.4, 10.1, 10.2, 10.4_
  
  - [ ]* 4.2 Write component tests for FilterBar
    - Test filter selection triggers callbacks
    - Test clear filters resets all selections
    - _Requirements: 7.4_

- [ ] 5. Create chart components
  - [x] 5.1 Implement RiskDistributionChart component
    - Create `frontend/hackathon/src/components/risk-distribution-chart.tsx`
    - Use Recharts BarChart with color mapping (remote=green, low=yellow, moderate=orange, high=red, very_high=dark red)
    - Add click handler for segment selection
    - Add tooltip showing count and percentage
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 5.2 Implement SeverityDistributionChart component
    - Create `frontend/hackathon/src/components/severity-distribution-chart.tsx`
    - Use Recharts BarChart with gradient colors (1=light green to 5=dark red)
    - Add hover tooltip with severity name and count
    - Display percentage for each severity level
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 5.3 Implement ProcessTypeChart component
    - Create `frontend/hackathon/src/components/process-type-chart.tsx`
    - Use Recharts PieChart with color mapping (assembly=blue, inspection=green, calibration=purple, test=orange)
    - Add click handler for segment selection
    - Add tooltip showing count and percentage
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [~] 5.4 Implement HazardCategoryChart component
    - Create `frontend/hackathon/src/components/hazard-category-chart.tsx`
    - Use Recharts horizontal BarChart
    - Display top 10 hazard categories by count
    - Filter out empty/undefined categories
    - Add click handler for category selection
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 5.5 Write component tests for chart interactions
    - Test click handlers trigger correct callbacks
    - Test tooltip displays correct data
    - Test empty data handling
    - _Requirements: 1.4, 3.3, 8.3_

- [ ] 6. Modify SectionCards component
  - [~] 6.1 Update SectionCards to accept metrics prop
    - Modify `frontend/hackathon/src/components/section-cards.tsx`
    - Replace placeholder data with `DashboardMetrics` prop
    - Add loading state with skeleton loaders
    - Display total PFMEA items, high risk count, critical severity count, and total procedures
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 6.2 Write component tests for SectionCards
    - Test metrics display correctly
    - Test loading state shows skeletons
    - _Requirements: 5.5_

- [ ] 7. Modify DataTable component
  - [~] 7.1 Update DataTable schema for PFMEA data
    - Modify `frontend/hackathon/src/components/data-table.tsx`
    - Define columns for summary, hazard, hazard_category, severity, risk_level, mitigation, process_name, and process_type
    - Add custom cell renderers for severity badges (color-coded 1-5)
    - Add custom cell renderers for risk level badges (color-coded)
    - Add custom cell renderers for process type badges
    - _Requirements: 4.1, 4.2, 4.6_
  
  - [~] 7.2 Add sorting and search functionality
    - Enable column sorting (ascending/descending)
    - Add global search field that filters across all text columns
    - Add pagination with 25 rows per page
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [~] 7.3 Add responsive column hiding
    - Hide less critical columns on mobile viewports (<768px)
    - Ensure table remains functional on 375px minimum width
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [ ]* 7.4 Write component tests for DataTable
    - Test sorting by each column
    - Test search filtering
    - Test pagination
    - _Requirements: 4.3, 4.4, 4.5_

- [~] 8. Checkpoint - Verify component layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create DashboardContent component
  - [~] 9.1 Implement main DashboardContent container
    - Create `frontend/hackathon/src/components/dashboard-content.tsx`
    - Set up state management with React hooks for procedures, PFMEA items, filters, loading, and error states
    - Implement data fetching on mount (parallel API calls)
    - Implement derived state computation with `useMemo` for filtered items and metrics
    - _Requirements: 6.1, 6.2, 7.2, 7.3_
  
  - [~] 9.2 Add error handling and loading states
    - Display loading indicators while fetching data
    - Show error toast notifications using shadcn/ui Sonner
    - Add "Retry" button for failed API calls
    - _Requirements: 6.3, 6.4_
  
  - [~] 9.3 Wire up FilterBar callbacks
    - Connect filter state changes to FilterBar component
    - Implement filter change handlers that update state
    - Implement clear filters handler
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [~] 9.4 Wire up chart click handlers
    - Connect RiskDistributionChart clicks to risk level filter
    - Connect ProcessTypeChart clicks to process type filter
    - Connect HazardCategoryChart clicks to table filtering
    - _Requirements: 1.4, 3.3, 8.3_
  
  - [~] 9.5 Compose layout with all child components
    - Arrange FilterBar, SectionCards, charts grid, and DataTable
    - Implement responsive grid layout (stack on mobile, grid on desktop)
    - Pass filtered data and metrics to child components via props
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [ ]* 9.6 Write integration tests for DashboardContent
    - Test data fetching and state updates
    - Test filter interactions update all components
    - Test chart clicks update filters
    - _Requirements: 7.2, 1.4, 3.3_

- [ ] 10. Integrate into existing dashboard page
  - [~] 10.1 Replace placeholder content in dashboard page
    - Modify `frontend/hackathon/src/app/dashboard/page.tsx`
    - Remove placeholder ChartAreaInteractive component
    - Replace with DashboardContent component
    - Keep existing AppSidebar and SiteHeader
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  
  - [~] 10.2 Add procedure-specific view support
    - Display selected procedure title when filtered
    - Show "All Procedures" label when viewing aggregated data
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 10.3 Write end-to-end tests for dashboard page
    - Test full user flow: load → filter → view charts → view table
    - Test procedure selection updates all views
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [~] 11. Final checkpoint - Verify complete integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation through browser testing
- All components use existing shadcn/ui and Recharts libraries
- TypeScript strict mode is enabled - ensure all types are properly defined
- API base URL should be configurable via environment variable
