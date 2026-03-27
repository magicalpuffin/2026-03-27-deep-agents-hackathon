# Agent Pipeline

## Overview

The agent is a LangGraph pipeline that reads a manufacturing instruction document and produces structured pFMEA data. It runs as a four-node directed graph, using an LLM with tool access to extract processes and assess risk.

## Pipeline Graph

```
┌───────────┐    ┌──────────────────┐    ┌──────────────┐    ┌──────────────┐
│ node_parse │──▶│ node_get_procedures │──▶│ node_get_pfmea │──▶│ node_write_to_db │
└───────────┘    └──────────────────┘    └──────────────┘    └──────────────┘
```

All nodes share an `AgentState` (TypedDict) that flows through the graph:

```python
class AgentState(TypedDict):
    file_path: str
    raw_text: str
    procedure: ManufacturingProcedure
    pfmea: PFMEA
```

## Node Descriptions

### `node_parse`
- **Input:** `file_path` (path to uploaded document)
- **Action:** Reads the manufacturing document using `python-docx`, extracts raw text content
- **Output:** Populates `raw_text` in state

### `node_get_procedures`
- **Input:** `raw_text`
- **Action:** Chunks the document text using `chunk_document()`, then sends each chunk to the LLM with the extraction prompt. The LLM returns structured `ManufacturingProcedure` data with categorized process steps.
- **Output:** Populates `procedure` in state — a `ManufacturingProcedure` containing a list of `ManufacturingProcess` items, each with name, description, and type (assembly/inspection/calibration/test)

### `node_get_pfmea`
- **Input:** `procedure` (extracted processes)
- **Action:** For each process, invokes an LLM agent with tool access to generate failure modes. The agent uses hazard lookup, probability of harm, Airbyte data, and vector similarity search to produce informed risk assessments.
- **Output:** Populates `pfmea` in state — a `PFMEA` containing `ProcessFailureItem` entries with severity, probability, and mitigation data

### `node_write_to_db`
- **Input:** `procedure`, `pfmea`
- **Action:** Writes the structured data to Aerospike — creates procedure, process, and pFMEA item records with proper key linking
- **Output:** Data persisted to database

## LLM Configuration

| Setting | Value |
|---------|-------|
| **Model** | `gpt-4.1-mini` via `ChatOpenAI` |
| **Temperature** | `0.2` (low for consistent, deterministic outputs) |
| **Output format** | Structured output via Pydantic models (`with_structured_output`) |

The LLM is called with `with_structured_output()` to ensure responses conform to the Pydantic schemas (`ManufacturingProcedure`, `PFMEA`), eliminating parsing errors.

## Tools

The agent has access to four tools during the `node_get_pfmea` step:

### `hazard_lookup`
- **Source:** `data/hazard_harm_severity.csv`
- **Functions:**
  - `lookup_patient_hazard(query)` — Fuzzy search (via rapidfuzz) for hazards matching a text query. Returns matching hazard entries with categories and severity.
  - `get_severity_for_hazard_category(category)` — Exact lookup by hazard category. Returns severity rating (1–5: Negligible → Catastrophic).

### `probability_of_harm`
- **Source:** `data/p1_p2_risk_matrix.csv`
- **Function:**
  - `lookup_probability_of_harm(p1, p2)` — Maps P1 (probability of hazardous situation occurring, 1–7) and P2 (probability of harm given the hazard, 1–7) to a risk level using the risk matrix.

### Airbyte Lookup
- **Purpose:** Queries external data sources (historical pFMEAs, regulatory hazard tables, material specs) via Airbyte connectors
- **See:** [Data Integration](data-integration.md)

### Vector Similarity Search
- **Purpose:** Finds similar past failure modes stored in Aerospike Vector Search
- **How it works:** Embeds the current process description, queries Aerospike for top-K similar `pfmea_items`, and injects them as context into the LLM prompt
- **Benefit:** Provides immediate, relevant historical context during pFMEA generation, improving consistency and completeness

## Prompts

### Extraction Prompt (`EXTRACTION_PROMPT`)
Used in `node_get_procedures`. Instructs the LLM to:
- Parse manufacturing instruction text into discrete process steps
- Categorize each step as `assembly`, `inspection`, `calibration`, or `test`
- Extract name and description for each process
- Return structured `ManufacturingProcedure` output

### pFMEA Prompt (`PFMEA_PROMPT`)
Used in `node_get_pfmea`. Instructs the LLM to:
- Analyze each manufacturing process for potential failure modes
- Use the provided tools to look up hazard categories and severity ratings
- Reference `data/risk_management.md` for rating scale definitions
- Assess probability of occurrence (P1) and probability of harm (P2)
- Recommend mitigation actions
- Return structured `ProcessFailureItem` output

## Input / Output

- **Input:** A manufacturing instruction document file (`.docx`)
- **Output:** Structured data written to Aerospike:
  - One `procedures` record
  - N `processes` records (linked to procedure)
  - M `pfmea_items` records (linked to both procedure and process)
