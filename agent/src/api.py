"""
api.py — FastAPI application for the pFMEA agent
"""

import os
import tempfile
import uuid
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI, File, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from src.api_models import (
    PFMEAItem,
    PFMEAItemDetail,
    ProcedureDetail,
    ProcedureListItem,
    ProcessItem,
    SimilarResult,
    UploadResponse,
)
from src.db import PostgresDB
from src.embeddings import embed_query

_db: PostgresDB | None = None


def get_db() -> PostgresDB:
    global _db
    if _db is None:
        _db = PostgresDB()
    return _db


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _db
    _db = PostgresDB()
    yield
    if _db is not None:
        _db.close()
        _db = None


app = FastAPI(title="pFMEA Agent API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run_pipeline(file_path: str):
    """Run the agent pipeline on a file (background task)."""
    from src.graph import build_graph

    graph = build_graph()
    graph.invoke({"file_path": file_path})


@app.post("/api/upload", response_model=UploadResponse, status_code=202)
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload a manufacturing procedure file and start pFMEA analysis."""
    upload_dir = os.path.join(tempfile.gettempdir(), "pfmea_uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "upload.txt")[1]
    file_path = os.path.join(upload_dir, f"{file_id}{ext}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    background_tasks.add_task(_run_pipeline, file_path)

    return UploadResponse(
        procedure_id=file_id,
        status="processing",
        message=f"File '{file.filename}' uploaded. Processing started.",
    )


@app.get("/api/procedures", response_model=list[ProcedureListItem])
async def list_procedures():
    """List all analyzed procedures."""
    db = get_db()
    procedures = db.list_procedures()
    return [
        ProcedureListItem(
            procedure_id=p.get("procedure_id", ""),
            title=p.get("title", ""),
            file_path=p.get("file_path", ""),
        )
        for p in procedures
    ]


@app.get("/api/procedures/{procedure_id}", response_model=ProcedureDetail)
async def get_procedure(procedure_id: str):
    """Get procedure details with its processes."""
    db = get_db()
    proc = db.get_procedure(procedure_id)
    if proc is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Procedure not found")

    processes = db.get_processes_for_procedure(procedure_id)
    return ProcedureDetail(
        procedure_id=proc.get("procedure_id", ""),
        title=proc.get("title", ""),
        file_path=proc.get("file_path", ""),
        processes=[
            ProcessItem(
                process_id=p.get("process_id", ""),
                procedure_id=p.get("procedure_id", ""),
                name=p.get("name", ""),
                description=p.get("description", ""),
                process_type=p.get("process_type", ""),
            )
            for p in processes
        ],
    )


@app.get("/api/procedures/{procedure_id}/pfmea", response_model=list[PFMEAItem])
async def get_pfmea_items(procedure_id: str):
    """Get all pFMEA items for a procedure."""
    db = get_db()
    items = db.get_pfmea_items_for_procedure(procedure_id)
    return [
        PFMEAItem(
            item_id=item.get("item_id", ""),
            procedure_id=item.get("procedure_id", ""),
            process_key=item.get("process_key", ""),
            summary=item.get("summary", ""),
            hazard=item.get("hazard", ""),
            hazard_category=item.get("hazard_category", ""),
            severity=item.get("severity", 0),
            risk_level=item.get("risk_level", ""),
            mitigation=item.get("mitigation", ""),
        )
        for item in items
    ]


@app.get("/api/pfmea-items/{item_id}", response_model=PFMEAItemDetail)
async def get_pfmea_item(item_id: str):
    """Get a single pFMEA item with full details."""
    db = get_db()
    item = db.get_pfmea_item(item_id)
    if item is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="pFMEA item not found")

    return PFMEAItemDetail(
        item_id=item.get("item_id", ""),
        procedure_id=item.get("procedure_id", ""),
        process_key=item.get("process_key", ""),
        summary=item.get("summary", ""),
        hazard=item.get("hazard", ""),
        hazard_category=item.get("hazard_category", ""),
        hazardous_situation=item.get("hazardous_situation", ""),
        potential_failure=item.get("potential_failure", ""),
        potential_cause_of_failure=item.get("potential_cause_of_failure", ""),
        harm=item.get("harm", ""),
        severity_rating=item.get("severity_rating", ""),
        severity=item.get("severity", 0),
        probability_of_harm_scale=item.get("probability_of_harm_scale", ""),
        risk_level=item.get("risk_level", ""),
        mitigation=item.get("mitigation", ""),
    )


@app.get("/api/search/similar", response_model=list[SimilarResult])
async def search_similar(query: str = Query(...), limit: int = Query(default=5, le=10)):
    """Search for similar pFMEA items using vector similarity."""
    db = get_db()
    query_embedding = embed_query(query)
    results = db.vector_search(query_embedding, limit=limit)
    return [
        SimilarResult(
            item_id=r.get("item_id", ""),
            procedure_id=r.get("procedure_id", ""),
            process_key=r.get("process_key", ""),
            summary=r.get("summary", ""),
            hazard=r.get("hazard", ""),
            risk_level=r.get("risk_level", ""),
            mitigation=r.get("mitigation", ""),
        )
        for r in results
    ]
