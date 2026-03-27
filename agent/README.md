# pFMEA Agent

AI agent that analyzes manufacturing procedure documents and generates process Failure Mode and Effects Analysis (pFMEA) reports. Uses LangGraph to orchestrate a multi-step pipeline: parse document, extract processes, generate pFMEA with hazard/risk assessment, and store results in PostgreSQL with vector search.

## Architecture

```
main.py                  # CLI entry point (run pipeline or start server)
src/
  api.py                 # FastAPI REST API
  api_models.py          # Pydantic response models
  graph.py               # LangGraph agent (parse → extract → pFMEA → write)
  schemas.py             # Pydantic state/data models
  models.py              # SQLAlchemy ORM models (Procedure, Process, PFMEAItem)
  database.py            # SQLAlchemy engine & session factory
  repository.py          # Data access functions
  embeddings.py          # OpenAI embedding utilities
  prompts.py             # LLM system prompts
  utils.py               # Document chunking utilities
  tools/
    hazard_lookup.py     # Hazard category lookup tool
    probability_of_harm.py # Probability of harm scale tool
    vector_search.py     # pgvector similarity search tool
    airbyte_lookup.py    # Airbyte data lookup tool
alembic/                 # Alembic migration framework
  env.py                 # Migration environment (reads DB_URL from env)
  versions/              # Migration scripts
```

## Prerequisites

- Python 3.13+
- PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) extension
- OpenAI API key

## Setup

```bash
# Install dependencies
uv sync

# Set environment variables (create .env file)
DB_URL=postgresql://user:password@localhost:5432/pfmea
OPENAI_API_KEY=sk-...
```

## Commands

### Database Migrations

```bash
# Apply all migrations (creates tables on first run)
uv run alembic upgrade head

# Generate a new migration after model changes
uv run alembic revision --autogenerate -m "description"

# Check if models are in sync with the database
uv run alembic check

# View migration history
uv run alembic history

# Downgrade one revision
uv run alembic downgrade -1
```

### Run the Agent Pipeline

```bash
# Analyze a manufacturing procedure document
uv run python main.py <path-to-file>

# Supports .docx, .md, and .txt files
uv run python main.py data/example_procedure.docx
```

### Start the API Server

```bash
# Start FastAPI server on port 8000 with hot reload
uv run python main.py serve
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a procedure file and start analysis |
| `GET` | `/api/procedures` | List all analyzed procedures |
| `GET` | `/api/procedures/{id}` | Get procedure details with processes |
| `GET` | `/api/procedures/{id}/pfmea` | Get pFMEA items for a procedure |
| `GET` | `/api/pfmea-items/{id}` | Get a single pFMEA item detail |
| `GET` | `/api/search/similar?query=...` | Vector similarity search for pFMEA items |

### Testing

```bash
# Upload a file for analysis
curl -X POST http://localhost:8000/api/upload \
  -F "file=@data/example_procedure.docx"

# List procedures
curl http://localhost:8000/api/procedures

# Search for similar failure modes
curl "http://localhost:8000/api/search/similar?query=solder+joint+failure&limit=5"

# Check API docs (Swagger UI)
# Open http://localhost:8000/docs in a browser
```
