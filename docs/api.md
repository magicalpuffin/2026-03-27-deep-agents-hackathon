# FastAPI Endpoints

## Overview

FastAPI serves as the REST bridge between the Aerospike database and the React frontend. It also handles file uploads that trigger the agent pipeline.

## Base URL

```
http://localhost:8000
```

## CORS Configuration

```python
origins = [
    "http://localhost:3000",  # React dev server
]
```

All standard CORS headers enabled for the configured origins.

## Endpoints

### `POST /api/upload`

Upload a manufacturing instruction document and trigger the agent pipeline.

**Request:**
```
Content-Type: multipart/form-data

file: <binary file data> (.docx)
```

**Response:** `202 Accepted`
```json
{
  "procedure_id": "uuid-string",
  "status": "processing",
  "message": "File uploaded. Agent pipeline started."
}
```

**Notes:** Returns immediately with the procedure ID. The agent pipeline runs asynchronously. The frontend can poll the procedure endpoint to check when processing is complete.

---

### `GET /api/procedures`

List all procedures.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-string",
    "title": "PCB Assembly Procedure Rev 3",
    "created_at": 1711555200,
    "file_name": "pcb_assembly_rev3.docx"
  }
]
```

---

### `GET /api/procedures/{id}`

Get a single procedure with its linked processes.

**Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "title": "PCB Assembly Procedure Rev 3",
  "created_at": 1711555200,
  "file_name": "pcb_assembly_rev3.docx",
  "processes": [
    {
      "id": "uuid-string",
      "name": "Solder paste application",
      "description": "Apply solder paste to PCB pads using stencil",
      "process_type": "assembly",
      "order_index": 0
    }
  ]
}
```

**Error:** `404 Not Found` if procedure ID does not exist.

---

### `GET /api/procedures/{id}/pfmea`

Get all pFMEA items for a procedure.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-string",
    "procedure_id": "uuid-string",
    "process_key": "uuid-string",
    "summary": "Cold solder joint due to insufficient reflow temperature",
    "hazard": "Electrical connection failure",
    "hazard_category": "electrical",
    "severity": 4,
    "probability_of_occurrence": 3,
    "probability_of_harm": 2,
    "risk_level": "moderate",
    "mitigation": "Implement thermal profiling and visual inspection post-reflow"
  }
]
```

---

### `GET /api/pfmea-items/{id}`

Get a single pFMEA item with its linked process.

**Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "procedure_id": "uuid-string",
  "process_key": "uuid-string",
  "summary": "Cold solder joint due to insufficient reflow temperature",
  "hazard": "Electrical connection failure",
  "hazard_category": "electrical",
  "severity": 4,
  "probability_of_occurrence": 3,
  "probability_of_harm": 2,
  "risk_level": "moderate",
  "mitigation": "Implement thermal profiling and visual inspection post-reflow",
  "process": {
    "id": "uuid-string",
    "name": "Solder paste application",
    "description": "Apply solder paste to PCB pads using stencil",
    "process_type": "assembly",
    "order_index": 0
  }
}
```

**Error:** `404 Not Found` if pFMEA item ID does not exist.

---

### `GET /api/search/similar`

Vector similarity search for failure modes.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | yes | Text to search for similar failure modes |
| `limit` | integer | no | Max results (default: 10) |

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-string",
    "summary": "Cold solder joint due to insufficient reflow temperature",
    "hazard": "Electrical connection failure",
    "severity": 4,
    "risk_level": "moderate",
    "score": 0.92
  }
]
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Procedure not found"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad request (invalid input, missing required fields) |
| `404` | Resource not found |
| `422` | Validation error (FastAPI automatic for schema violations) |
| `500` | Internal server error |

## Request/Response Schema Summary

| Model | Used In | Fields |
|-------|---------|--------|
| `ProcedureListItem` | `GET /procedures` | id, title, created_at, file_name |
| `ProcedureDetail` | `GET /procedures/{id}` | id, title, created_at, file_name, processes[] |
| `ProcessItem` | Nested in ProcedureDetail | id, name, description, process_type, order_index |
| `PFMEAItem` | `GET /procedures/{id}/pfmea` | id, procedure_id, process_key, summary, hazard, hazard_category, severity, probability_of_occurrence, probability_of_harm, risk_level, mitigation |
| `PFMEAItemDetail` | `GET /pfmea-items/{id}` | PFMEAItem fields + process (ProcessItem) |
| `SimilarResult` | `GET /search/similar` | id, summary, hazard, severity, risk_level, score |
| `UploadResponse` | `POST /upload` | procedure_id, status, message |
