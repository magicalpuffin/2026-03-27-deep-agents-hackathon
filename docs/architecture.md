# System Architecture

## Overview

The Manufacturing pFMEA Generator is a full-stack application that parses manufacturing instruction documents into discrete processes and generates Process Failure Mode and Effects Analysis (pFMEA) assessments. It combines an LLM-powered agent pipeline with structured data storage and a React frontend for viewing results.

## High-Level System Diagram

```
                                  ┌─────────────────────┐
                                  │   Airbyte            │
                                  │   (External Data)    │
                                  └─────────┬───────────┘
                                            │
                                            ▼
┌──────────────┐    ┌──────────────────────────────────────┐    ┌───────────────────┐
│              │    │           LangGraph Agent             │    │                   │
│  File Upload │───▶│  parse → get_procedures → get_pfmea  │───▶│    Aerospike DB   │
│              │    │              → write_to_db            │    │  (KV + Vector)    │
└──────────────┘    └──────────────────────────────────────┘    └─────────┬─────────┘
                                                                         │
                                                                         ▼
                                ┌──────────────────────┐    ┌───────────────────────┐
                                │   React Frontend     │◀───│      FastAPI           │
                                │   (Tailwind CSS)     │    │   (REST Endpoints)     │
                                └──────────────────────┘    └───────────────────────┘
```

## Components

| Component | Technology | Role |
|-----------|-----------|------|
| **Agent** | Python, LangGraph, LangChain, OpenAI GPT-4.1-mini | Parses documents, generates pFMEA, writes to DB |
| **Database** | Aerospike (KV + Vector Search) | Stores procedures, processes, pFMEA items; provides vector similarity search |
| **API** | FastAPI | REST endpoints bridging the database and frontend |
| **Frontend** | React 19, Tailwind CSS, React Router | UI for uploading files, viewing procedures and pFMEA results |
| **Data Integration** | Airbyte | Agent tool for accessing external data (historical pFMEAs, regulatory tables) |

## End-to-End Data Flow

1. **Upload** — User uploads a manufacturing instruction document via the React frontend
2. **Parse** — The agent reads the document and splits it into text chunks
3. **Extract Procedures** — LLM extracts structured manufacturing processes (assembly, inspection, calibration, test) from each chunk
4. **Generate pFMEA** — For each process, the agent uses tools (hazard lookup, probability of harm, Airbyte lookup, vector similarity search) to generate failure modes with severity and probability ratings
5. **Store** — Structured data is written to Aerospike: procedures, processes, and pFMEA items with linking keys
6. **Serve** — FastAPI exposes the stored data through REST endpoints
7. **Display** — React frontend fetches and renders procedures, pFMEA tables, and risk summaries

## Tech Stack Summary

- **Language:** Python 3.13+ (backend), JavaScript/React 19 (frontend)
- **LLM Orchestration:** LangGraph + LangChain
- **LLM Model:** OpenAI GPT-4.1-mini (temperature=0.2, structured output)
- **Database:** Aerospike (key-value store + vector search)
- **API Framework:** FastAPI
- **Frontend:** React 19 + Tailwind CSS 3 + React Router + Axios
- **Data Integration:** Airbyte connectors
- **Document Parsing:** python-docx
- **Fuzzy Matching:** rapidfuzz (for hazard lookups)

## Related Documentation

- [Agent Pipeline](agent.md)
- [Database Schema](database.md)
- [API Endpoints](api.md)
- [Data Integration](data-integration.md)
- [Frontend Architecture](frontend.md)
