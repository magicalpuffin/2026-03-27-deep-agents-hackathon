# Airbyte Data Integration

## Purpose

Airbyte serves as an agent tool for accessing external stored data during pFMEA generation. Rather than relying solely on the LLM's training data, the agent queries real external sources for historical failure modes, regulatory hazard tables, and material specifications to produce more accurate and compliant risk assessments.

## Use Cases

| Data Source | What It Provides | How the Agent Uses It |
|-------------|-----------------|----------------------|
| **Historical pFMEAs** | Past failure mode assessments from completed procedures | Reference for severity ratings and mitigation strategies on similar processes |
| **Regulatory hazard tables** | Industry-standard hazard classifications and required severity levels | Ensures compliance with regulatory frameworks (e.g., ISO 14971 for medical devices) |
| **Material specifications** | Material properties, tolerances, and known failure characteristics | Informs failure mode identification for material-specific processes |

## Airbyte Connector Setup

Airbyte connectors are configured to sync external data sources into a format queryable by the agent:

1. **Source connectors** — Point to external databases, spreadsheets, or APIs containing reference data
2. **Destination** — Data is made available to the agent either through direct query or by loading into Aerospike for vector search
3. **Sync schedule** — Configured per-connector based on how frequently the source data changes (e.g., regulatory tables sync weekly, historical pFMEAs sync after each new procedure is processed)

### Configuration

```
Airbyte Instance
├── Source: Historical pFMEA Database
│   └── Connector: Postgres / CSV / Google Sheets
├── Source: Regulatory Hazard Tables
│   └── Connector: CSV / API
├── Source: Material Specs Database
│   └── Connector: Postgres / API
└── Destination: Aerospike / Agent-accessible store
```

## Agent Integration

During the `node_get_pfmea` step, the agent can invoke the Airbyte tool to:

1. **Query historical data** — "Find past pFMEA entries for soldering processes" → returns historical failure modes, severity ratings, and mitigations
2. **Look up regulatory requirements** — "What are the required hazard categories for electrical assembly?" → returns applicable regulatory hazard classifications
3. **Check material specs** — "What are the failure characteristics of lead-free solder at high temperatures?" → returns material-specific failure data

The results are injected into the LLM's context alongside vector search results, giving the agent a comprehensive picture when generating each pFMEA entry.

## Data Source Examples

### Historical pFMEA Records
```
| process_type | failure_mode              | hazard_category | severity | mitigation                    |
|-------------|---------------------------|-----------------|----------|-------------------------------|
| assembly    | cold solder joint         | electrical      | 4        | visual inspection + reflow    |
| inspection  | missed dimensional defect | mechanical      | 3        | automated measurement system  |
| calibration | instrument drift          | measurement     | 2        | scheduled recalibration       |
```

### Regulatory Hazard Table
```
| hazard_category | regulatory_standard | required_severity_minimum | notes                        |
|-----------------|--------------------|--------------------------|-----------------------------|
| electrical      | IEC 60601          | 3                        | patient contact devices      |
| mechanical      | ISO 14971          | 2                        | general medical devices      |
| biological      | ISO 10993          | 4                        | biocompatibility required    |
```

## Connection Patterns

- **On-demand queries** — The agent calls the Airbyte tool during pFMEA generation; Airbyte fetches from the configured source in real time or from its last sync cache
- **Pre-loaded vector data** — Airbyte syncs external data into Aerospike, where it is embedded and indexed for vector similarity search. This allows the agent to find relevant external data through the same vector search tool used for internal historical data
