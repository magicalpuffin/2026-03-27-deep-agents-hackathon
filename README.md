# Manufacturing pFMEA Generator

**Third Place Winner for "Best Use of Kiro" at Deep Agents Hackathon**


![pfmea dashboard](/docs/assets/pfmea%20dashboard.png)


A full-stack application that parses manufacturing instruction documents into discrete processes and generates Process Failure Mode and Effects Analysis (pFMEA) assessments using an LLM-powered agent.

Manufacturing engineers upload a procedure document, and the system automatically extracts process steps, identifies potential failure modes, assesses risk severity and probability, and recommends mitigations — all stored and viewable through a web interface.

![pfmea agent](/docs/assets/pfmea%20agent%20graph.png)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Agent** | Python 3.13+, LangGraph, LangChain, OpenAI GPT-4.1-mini |
| **Database** | Aerospike (KV + Vector Search) |
| **API** | FastAPI |
| **Frontend** | React 19, Tailwind CSS, React Router |
| **Data Integration** | Airbyte |

## Project Structure

```
agent/       — LangGraph pipeline (parse → extract → pFMEA → store)
frontend/    — React SPA
docs/        — Architecture documentation
```

## Documentation

- [System Architecture](docs/architecture.md) — High-level overview and data flow
- [Agent Pipeline](docs/agent.md) — LangGraph nodes, tools, and prompts
- [Database Schema](docs/database.md) — Aerospike KV and vector search design
- [API Endpoints](docs/api.md) — FastAPI routes and request/response schemas
- [Data Integration](docs/data-integration.md) — Airbyte external data access
- [Frontend Architecture](docs/frontend.md) — Pages, components, and routing
