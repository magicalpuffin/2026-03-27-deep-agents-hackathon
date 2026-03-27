# Requirements Document

## Introduction

This feature customizes the existing React/TypeScript dashboard to display and interact with manufacturing process and PFMEA (Process Failure Mode and Effects Analysis) data. The dashboard will provide manufacturing engineers with visual insights into risk assessments, process failures, and severity distributions across manufacturing procedures.

## Glossary

- **Dashboard**: The React-based user interface located at frontend/hackathon/src/app/dashboard/page.tsx
- **PFMEA_System**: The backend system that stores and serves Process Failure Mode and Effects Analysis data
- **Manufacturing_Process**: A discrete step in a manufacturing procedure (assembly, inspection, calibration, or test)
- **Risk_Level**: A categorization of risk based on probability of harm (remote, low, moderate, high, very_high)
- **Severity_Scale**: A 1-5 rating of potential harm (negligible=1, minor=2, moderate=3, critical=4, catastrophic=5)
- **Process_Type**: The category of manufacturing process (assembly, inspection, calibration, test)
- **Procedure**: A collection of manufacturing processes that form a complete manufacturing instruction
- **PFMEA_Item**: A single failure mode entry containing hazard, severity, risk level, and mitigation information

## Requirements

### Requirement 1: Display Risk Distribution Overview

**User Story:** As a manufacturing engineer, I want to see an overview of risk distribution across all procedures, so that I can quickly identify high-risk areas requiring attention.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL fetch aggregated risk data from the PFMEA_System
2. THE Dashboard SHALL display a chart showing the count of PFMEA items grouped by Risk_Level
3. THE Dashboard SHALL use color coding for Risk_Level visualization (remote=green, low=yellow, moderate=orange, high=red, very_high=dark_red)
4. WHEN a user clicks on a Risk_Level segment in the chart, THE Dashboard SHALL filter the data table to show only items of that Risk_Level

### Requirement 2: Display Severity Distribution

**User Story:** As a quality assurance manager, I want to see the distribution of severity ratings across all failure modes, so that I can prioritize mitigation efforts.

#### Acceptance Criteria

1. THE Dashboard SHALL display a chart showing the count of PFMEA items grouped by Severity_Scale
2. THE Dashboard SHALL use a gradient color scheme for severity visualization (1=light, 5=dark)
3. WHEN a user hovers over a severity segment, THE Dashboard SHALL display the severity name and count
4. THE Dashboard SHALL calculate and display the percentage of items at each Severity_Scale level

### Requirement 3: Display Manufacturing Process Type Breakdown

**User Story:** As a process engineer, I want to see which types of manufacturing processes have the most failure modes, so that I can focus improvement efforts on problematic process types.

#### Acceptance Criteria

1. THE Dashboard SHALL display a chart showing the count of PFMEA items grouped by Process_Type
2. THE Dashboard SHALL include all four Process_Type categories (assembly, inspection, calibration, test)
3. WHEN a user clicks on a Process_Type segment, THE Dashboard SHALL filter the data table to show only items from that Process_Type
4. THE Dashboard SHALL display the total count of processes for each Process_Type

### Requirement 4: Display PFMEA Data Table

**User Story:** As a manufacturing engineer, I want to view detailed PFMEA data in a sortable and filterable table, so that I can analyze specific failure modes and their characteristics.

#### Acceptance Criteria

1. THE Dashboard SHALL display a data table containing all PFMEA_Item records
2. THE Dashboard SHALL include columns for summary, hazard, hazard_category, severity, risk_level, and mitigation
3. WHEN a user clicks on a column header, THE Dashboard SHALL sort the table by that column
4. THE Dashboard SHALL support ascending and descending sort order
5. WHEN a user types in a search field, THE Dashboard SHALL filter table rows to match the search query across all visible columns
6. THE Dashboard SHALL display severity values as both numeric (1-5) and text labels

### Requirement 5: Display Summary Cards

**User Story:** As a quality manager, I want to see key metrics at a glance, so that I can quickly assess the overall risk posture of manufacturing procedures.

#### Acceptance Criteria

1. THE Dashboard SHALL display a card showing the total count of PFMEA_Item records
2. THE Dashboard SHALL display a card showing the count of high and very_high Risk_Level items
3. THE Dashboard SHALL display a card showing the count of critical and catastrophic Severity_Scale items
4. THE Dashboard SHALL display a card showing the total count of unique Procedure records
5. WHEN any card value changes due to filtering, THE Dashboard SHALL update the card values to reflect the filtered dataset

### Requirement 6: Integrate with Backend API

**User Story:** As a system, I want to fetch manufacturing and PFMEA data from the backend API, so that the dashboard displays current and accurate information.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Dashboard SHALL call GET /api/procedures to retrieve all Procedure records
2. WHEN the Dashboard loads, THE Dashboard SHALL call GET /api/procedures/{procedure_id}/pfmea for each Procedure to retrieve PFMEA_Item records
3. IF an API call fails, THEN THE Dashboard SHALL display an error message to the user
4. WHILE data is loading, THE Dashboard SHALL display loading indicators
5. THE Dashboard SHALL cache API responses for 5 minutes to reduce server load

### Requirement 7: Support Interactive Filtering

**User Story:** As a manufacturing engineer, I want to apply multiple filters simultaneously, so that I can drill down into specific subsets of failure modes.

#### Acceptance Criteria

1. THE Dashboard SHALL provide filter controls for Risk_Level, Severity_Scale, and Process_Type
2. WHEN a user selects multiple filter values, THE Dashboard SHALL apply all filters using AND logic
3. WHEN filters are active, THE Dashboard SHALL update all charts and the data table to show only matching records
4. THE Dashboard SHALL display a "Clear Filters" button that resets all filters to their default state
5. WHEN filters are cleared, THE Dashboard SHALL restore the display to show all PFMEA_Item records

### Requirement 8: Display Hazard Category Distribution

**User Story:** As a safety officer, I want to see which hazard categories are most common, so that I can identify systemic safety concerns.

#### Acceptance Criteria

1. THE Dashboard SHALL display a chart showing the count of PFMEA items grouped by hazard_category
2. THE Dashboard SHALL display the top 10 most frequent hazard_category values
3. WHEN a user clicks on a hazard_category segment, THE Dashboard SHALL filter the data table to show only items with that hazard_category
4. THE Dashboard SHALL handle cases where hazard_category is empty or undefined

### Requirement 9: Support Responsive Layout

**User Story:** As a user, I want the dashboard to work on different screen sizes, so that I can view it on desktop monitors and tablets.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Dashboard SHALL stack charts vertically
2. WHEN the viewport width is 768px or greater, THE Dashboard SHALL display charts in a grid layout
3. THE Dashboard SHALL ensure all text remains readable at minimum supported viewport width of 375px
4. THE Dashboard SHALL maintain interactive functionality across all supported viewport sizes

### Requirement 10: Display Procedure-Specific Views

**User Story:** As a manufacturing engineer, I want to view PFMEA data for a specific procedure, so that I can focus on one manufacturing instruction at a time.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a dropdown selector to choose a specific Procedure
2. WHEN a user selects a Procedure from the dropdown, THE Dashboard SHALL filter all charts and tables to show only PFMEA_Item records for that Procedure
3. THE Dashboard SHALL display the Procedure title and file_path when a specific Procedure is selected
4. THE Dashboard SHALL include an "All Procedures" option that displays aggregated data across all Procedure records
