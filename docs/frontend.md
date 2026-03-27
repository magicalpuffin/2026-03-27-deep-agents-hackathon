# Frontend Architecture

## Overview

The frontend is a React single-page application for uploading manufacturing documents, viewing parsed procedures, and navigating pFMEA results. It communicates with the FastAPI backend via REST calls.

## Tech Stack

- **React 19** — UI framework
- **Tailwind CSS 3** — Utility-first styling
- **React Router** — Client-side routing
- **Axios** — HTTP client for API calls

## Page Structure and Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | Procedure List | Browse all parsed procedures |
| `/upload` | File Upload | Upload a new manufacturing document |
| `/procedures/:id` | Procedure Detail | View a procedure's processes, pFMEA, and risk summary (tabbed) |

## Pages

### `/` — Procedure List Page

Displays all procedures with title, file name, and creation date. Each row links to the procedure detail page.

```
ProcedureListPage
├── PageHeader ("Manufacturing Procedures")
├── UploadButton (→ /upload)
└── ProcedureTable
    └── ProcedureRow (× N, clickable → /procedures/:id)
        ├── Title
        ├── FileName
        └── CreatedAt
```

### `/upload` — File Upload Page

Drag-and-drop or file picker for `.docx` files. Submits to `POST /api/upload` and redirects to the new procedure page on success.

```
UploadPage
├── PageHeader ("Upload Document")
└── UploadForm
    ├── DropZone / FilePicker
    ├── SelectedFilePreview
    └── SubmitButton
```

### `/procedures/:id` — Procedure Detail Page (Tabbed)

Displays the procedure details with three tab views:

```
ProcedureDetailPage
├── PageHeader (procedure title)
├── ProcedureMetadata (file_name, created_at)
└── TabContainer
    ├── Tab: "Processes"    → ProcessesTab
    ├── Tab: "pFMEA"        → PFMEATab
    └── Tab: "Risk Summary" → RiskSummaryTab
```

#### Processes Tab

Lists all processes in order. Each process shows its type badge and description. Clicking a process highlights linked pFMEA items in the pFMEA tab.

```
ProcessesTab
└── ProcessList
    └── ProcessCard (× N)
        ├── OrderBadge (order_index)
        ├── TypeBadge (assembly | inspection | calibration | test)
        ├── ProcessName
        ├── ProcessDescription
        └── LinkedPFMEACount (clickable → switches to pFMEA tab, filtered)
```

#### pFMEA Tab

Table of all failure mode entries for the procedure. Each row links back to its source process.

```
PFMEATab
├── FilterBar (by process, severity, risk level)
└── PFMEATable
    └── PFMEARow (× M)
        ├── Summary
        ├── Hazard
        ├── HazardCategory
        ├── SeverityBadge (1–5, color-coded)
        ├── P1 (probability of occurrence)
        ├── P2 (probability of harm)
        ├── RiskLevelBadge (color-coded)
        ├── Mitigation
        └── ProcessLink (clickable → switches to Processes tab, scrolls to process)
```

#### Risk Summary Tab

Aggregated risk overview for the procedure.

```
RiskSummaryTab
├── RiskDistributionChart (count by risk level)
├── SeverityDistributionChart (count by severity)
└── HighRiskItemsList (filtered to highest risk pFMEA items)
```

## Linking Feature: pFMEA ↔ Processes

The `process_key` field on each pFMEA item enables bidirectional navigation:

- **Process → pFMEA:** From the Processes tab, click the linked pFMEA count to switch to the pFMEA tab filtered to that process
- **pFMEA → Process:** From the pFMEA tab, click the process link on any row to switch to the Processes tab and scroll to the relevant process

This supports **risk mitigation traceability** — engineers can navigate from a failure mode to the exact process step it applies to and back.

## Data Flow

```
API Call (Axios)
    │
    ▼
React State (useState / useEffect)
    │
    ▼
Component Render
```

1. Page components fetch data on mount via Axios calls to the FastAPI backend
2. Response data is stored in React state
3. Components render from state
4. User interactions (tab switches, filter changes, link clicks) update local state without re-fetching

### API Calls by Page

| Page | Endpoint | When |
|------|----------|------|
| Procedure List | `GET /api/procedures` | On mount |
| File Upload | `POST /api/upload` | On form submit |
| Procedure Detail | `GET /api/procedures/{id}` | On mount |
| Procedure Detail | `GET /api/procedures/{id}/pfmea` | On mount |
