"""
api.py — FastAPI application for the pFMEA agent
"""

import os
import tempfile
import uuid
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Query, UploadFile
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
from src.database import engine, get_session
from src.embeddings import embed_query
from src import repository


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    engine.dispose()


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
    with get_session() as session:
        procedures = repository.list_procedures(session)
        return [
            ProcedureListItem(
                procedure_id=p.procedure_id,
                title=p.title,
                file_path=p.file_path,
            )
            for p in procedures
        ]


@app.get("/api/procedures/{procedure_id}", response_model=ProcedureDetail)
async def get_procedure(procedure_id: str):
    """Get procedure details with its processes."""
    with get_session() as session:
        proc = repository.get_procedure(session, procedure_id)
        if proc is None:
            raise HTTPException(status_code=404, detail="Procedure not found")

        processes = repository.get_processes_for_procedure(session, procedure_id)
        return ProcedureDetail(
            procedure_id=proc.procedure_id,
            title=proc.title,
            file_path=proc.file_path,
            processes=[
                ProcessItem(
                    process_id=p.process_id,
                    procedure_id=p.procedure_id,
                    name=p.name,
                    description=p.description,
                    process_type=p.process_type,
                )
                for p in processes
            ],
        )


@app.get("/api/procedures/{procedure_id}/pfmea", response_model=list[PFMEAItem])
async def get_pfmea_items(procedure_id: str):
    """Get all pFMEA items for a procedure."""
    with get_session() as session:
        items = repository.get_pfmea_items_for_procedure(session, procedure_id)
        return [
            PFMEAItem(
                item_id=item.item_id,
                procedure_id=item.procedure_id,
                process_key=item.process_key,
                summary=item.summary,
                hazard=item.hazard,
                hazard_category=item.hazard_category,
                severity=item.severity,
                risk_level=item.risk_level,
                mitigation=item.mitigation,
            )
            for item in items
        ]


@app.get("/api/pfmea-items/{item_id}", response_model=PFMEAItemDetail)
async def get_pfmea_item(item_id: str):
    """Get a single pFMEA item with full details."""
    with get_session() as session:
        item = repository.get_pfmea_item(session, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="pFMEA item not found")

        return PFMEAItemDetail(
            item_id=item.item_id,
            procedure_id=item.procedure_id,
            process_key=item.process_key,
            summary=item.summary,
            hazard=item.hazard,
            hazard_category=item.hazard_category,
            hazardous_situation=item.hazardous_situation,
            potential_failure=item.potential_failure,
            potential_cause_of_failure=item.potential_cause_of_failure,
            harm=item.harm,
            severity_rating=item.severity_rating,
            severity=item.severity,
            probability_of_harm_scale=item.probability_of_harm_scale,
            risk_level=item.risk_level,
            mitigation=item.mitigation,
        )


@app.get("/api/search/similar", response_model=list[SimilarResult])
async def search_similar(query: str = Query(...), limit: int = Query(default=5, le=10)):
    """Search for similar pFMEA items using vector similarity."""
    query_embedding = embed_query(query)
    with get_session() as session:
        results = repository.vector_search(session, query_embedding, limit=limit)
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
