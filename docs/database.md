# Aerospike Schema Design

## Overview

Aerospike serves as both the primary key-value store for structured pFMEA data and the vector search engine for finding similar historical failure modes. This dual role lets the agent enrich pFMEA generation with relevant past data while providing fast lookups for the API layer.

## KV Store

### Namespace and Set Structure

All application data lives in a single Aerospike namespace (`pfmea`) with three sets:

```
pfmea (namespace)
├── procedures    — top-level manufacturing procedures
├── processes     — individual process steps within a procedure
└── pfmea_items   — failure mode entries linked to processes
```

### `procedures` Set

Represents a parsed manufacturing instruction document.

| Bin | Type | Description |
|-----|------|-------------|
| `title` | string | Procedure title extracted from the document |
| `created_at` | integer (timestamp) | When the procedure was parsed |
| `file_name` | string | Original uploaded file name |

**Key:** UUID string generated at parse time.

### `processes` Set

Individual manufacturing process steps extracted from a procedure.

| Bin | Type | Description |
|-----|------|-------------|
| `procedure_id` | string | Foreign key → `procedures` key |
| `name` | string | Process step name |
| `description` | string | What the process does |
| `process_type` | string | One of: `assembly`, `inspection`, `calibration`, `test` |
| `order_index` | integer | Position within the procedure sequence |

**Key:** UUID string generated at extraction time.

### `pfmea_items` Set

Failure mode and effects analysis entries generated for each process.

| Bin | Type | Description |
|-----|------|-------------|
| `procedure_id` | string | Foreign key → `procedures` key |
| `process_key` | string | Foreign key → `processes` key |
| `summary` | string | Failure mode summary |
| `hazard` | string | Associated hazard description |
| `hazard_category` | string | Hazard classification category |
| `severity` | integer | Severity rating (1–5: Negligible → Catastrophic) |
| `probability_of_occurrence` | integer | P1 score (1–7: Always → Once in lifetime) |
| `probability_of_harm` | integer | P2 score (1–7: Always → Once in lifetime) |
| `risk_level` | string | Computed risk level from P1 × P2 matrix |
| `mitigation` | string | Recommended risk mitigation action |

**Key:** UUID string generated at pFMEA generation time.

### Key Linking

```
procedures ──< processes ──< pfmea_items
   (1:N)          (1:N)

pfmea_items.procedure_id → procedures key
pfmea_items.process_key  → processes key
processes.procedure_id   → procedures key
```

The `process_key` link on `pfmea_items` enables **risk mitigation traceability** — navigating from a failure mode directly to the process step it applies to, and vice versa.

### Secondary Indexes

| Index | Set | Bin | Type | Purpose |
|-------|-----|-----|------|---------|
| `idx_proc_procedure` | `processes` | `procedure_id` | STRING | Query all processes for a procedure |
| `idx_pfmea_procedure` | `pfmea_items` | `procedure_id` | STRING | Query all pFMEA items for a procedure |
| `idx_pfmea_process` | `pfmea_items` | `process_key` | STRING | Query pFMEA items for a specific process |

## Vector Search

### Index Design

Aerospike Vector Search maintains a separate index for hazard and failure mode embeddings, enabling the agent to find similar past failure modes during pFMEA generation.

| Property | Value |
|----------|-------|
| **Index name** | `pfmea_hazard_idx` |
| **Set** | `pfmea_items` |
| **Vector bin** | `embedding` |
| **Dimensions** | Matches embedding model output (e.g., 1536 for OpenAI `text-embedding-3-small`) |
| **Distance metric** | Cosine similarity |

### Embedding Strategy

- **What gets embedded:** The concatenation of `summary` + `hazard` + `mitigation` fields from each `pfmea_items` record. This captures the full failure context in a single vector.
- **Embedding model:** OpenAI `text-embedding-3-small` (same provider as the LLM to simplify credentials)
- **When embeddings are created:** At write time, immediately after pFMEA generation, before storing the record

### Query Patterns

The agent uses vector similarity search during the `get_pfmea` node to provide **immediate context** for pFMEA generation:

1. **Similar failure modes** — Before generating pFMEA for a process, query for the top-K most similar existing failure modes. These are injected into the LLM prompt as reference examples.
2. **Hazard pattern matching** — Search by hazard description to find historically similar hazards and their severity ratings, providing consistency across procedures.

```
Query: "solder joint cold joint failure during PCB assembly"
→ Returns: similar past pFMEA items with their severity, probability, and mitigation
→ Used by: agent prompt context to generate consistent, informed pFMEA entries
```
