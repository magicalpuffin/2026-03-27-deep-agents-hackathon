# pFMEA Agent

AI agent that analyzes manufacturing procedure documents and generates process Failure Mode and Effects Analysis (pFMEA) reports. Uses LangGraph to orchestrate a multi-step pipeline: parse document, extract processes, generate pFMEA with hazard/risk assessment, and store results in PostgreSQL with vector search.

## Architecture

```
main.py                  # CLI entry point (direct run or start server)
src/
  graph.py               # LangGraph agent pipeline + run_pipeline() entry point
  api.py                 # FastAPI REST API with job tracking
  api_models.py          # Pydantic request/response models
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

# Apply database migrations
uv run alembic upgrade head
```

## Usage

There are two ways to run the agent:

### Method 1: Direct Python

Run the pipeline synchronously on a file. Blocks until complete, prints the procedure ID on success.

```bash
# From the command line
uv run python main.py path/to/procedure.docx

# Supports .docx, .md, and .txt files
uv run python main.py data/example_procedure.md
```

Or call it from Python code:

```python
from src.graph import run_pipeline

result = run_pipeline("path/to/procedure.docx")
print(result["procedure_id"])  # UUID of the created procedure
print(result["status"])        # "done" or "failed"
```

### Method 2: FastAPI Server

Start the HTTP server for file uploads, async job tracking, and data queries.

```bash
uv run python main.py serve
# Server starts at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

#### Pipeline Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload a file and start analysis (returns `job_id`) |
| `POST` | `/api/run` | Start analysis on a file path already on disk (returns `job_id`) |
| `GET` | `/api/jobs/{job_id}` | Poll job status — returns `status`, `procedure_id`, `error` |

#### Data Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/procedures` | List all analyzed procedures |
| `GET` | `/api/procedures/{id}` | Get procedure details with processes |
| `GET` | `/api/procedures/{id}/pfmea` | Get pFMEA items for a procedure |
| `GET` | `/api/pfmea-items/{id}` | Get a single pFMEA item detail |
| `GET` | `/api/search/similar?query=...` | Vector similarity search for pFMEA items |

## Commands

### Database Migrations

```bash
# Apply all migrations
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

### Testing

```bash
# Direct run — analyze a file and check the output
uv run python main.py data/example_procedure.docx

# Start the server
uv run python main.py serve

# Upload a file via the API
curl -X POST http://localhost:8000/api/upload \
  -F "file=@data/example_procedure.docx"
# Returns: {"job_id": "...", "status": "processing", ...}

# Run pipeline on a file path via the API
curl -X POST http://localhost:8000/api/run \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/absolute/path/to/procedure.docx"}'

# Poll job status until complete
curl http://localhost:8000/api/jobs/{job_id}
# Returns: {"job_id": "...", "status": "done", "procedure_id": "...", "error": null}

# List procedures
curl http://localhost:8000/api/procedures

# Get pFMEA items for a procedure
curl http://localhost:8000/api/procedures/{procedure_id}/pfmea

# Search for similar failure modes
curl "http://localhost:8000/api/search/similar?query=solder+joint+failure&limit=5"
```
