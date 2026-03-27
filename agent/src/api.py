"""
api.py — FastAPI application for the pFMEA agent

Provides HTTP endpoints for running the agent pipeline and querying results.
For direct Python usage, use `src.graph.run_pipeline()` instead.
"""

import os
import tempfile
import threading
import uuid
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from src.api_models import (
    DriveFile,
    DriveRunRequest,
    DriveSearchResponse,
    JobStatus,
    PFMEAItem,
    PFMEAItemDetail,
    ProcedureDetail,
    ProcedureListItem,
    ProcessItem,
    RunRequest,
    RunResponse,
    SimilarResult,
    UploadResponse,
)
from src.database import engine, get_session
from src.embeddings import embed_query
from src import repository

# ── Job tracking ──────────────────────────────────────────────────────────────

_jobs: dict[str, JobStatus] = {}
_jobs_lock = threading.Lock()


def _run_pipeline_job(job_id: str, file_path: str):
    """Run the agent pipeline and update job status on completion."""
    from src.graph import run_pipeline

    try:
        result = run_pipeline(file_path)
        with _jobs_lock:
            _jobs[job_id] = JobStatus(
                job_id=job_id,
                status=result.get("status", "done"),
                procedure_id=result.get("procedure_id"),
                error=result.get("error"),
            )
    except Exception as e:
        with _jobs_lock:
            _jobs[job_id] = JobStatus(
                job_id=job_id,
                status="failed",
                error=str(e),
            )
    finally:
        # Clean up the temp file after pipeline completes
        try:
            os.remove(file_path)
        except OSError:
            pass


# ── App setup ─────────────────────────────────────────────────────────────────


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

# ── Pipeline endpoints ────────────────────────────────────────────────────────


@app.post("/api/upload", response_model=UploadResponse, status_code=202)
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload a manufacturing procedure file and start pFMEA analysis.

    Returns a job_id that can be polled via GET /api/jobs/{job_id}.
    """
    job_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename or "upload.txt")[1]

    tmp = tempfile.NamedTemporaryFile(suffix=ext, prefix=f"{job_id}_", delete=False)
    content = await file.read()
    tmp.write(content)
    tmp.close()

    with _jobs_lock:
        _jobs[job_id] = JobStatus(job_id=job_id, status="processing")

    background_tasks.add_task(_run_pipeline_job, job_id, tmp.name)

    return UploadResponse(
        job_id=job_id,
        status="processing",
        message=f"File '{file.filename}' uploaded. Processing started.",
    )


@app.post("/api/run", response_model=RunResponse, status_code=202)
async def run_from_path(request: RunRequest, background_tasks: BackgroundTasks):
    """Start pFMEA analysis on a file already on disk.

    Returns a job_id that can be polled via GET /api/jobs/{job_id}.
    """
    if not os.path.isfile(request.file_path):
        raise HTTPException(status_code=400, detail="File not found at given path")

    job_id = str(uuid.uuid4())

    with _jobs_lock:
        _jobs[job_id] = JobStatus(job_id=job_id, status="processing")

    background_tasks.add_task(_run_pipeline_job, job_id, request.file_path)

    return RunResponse(
        job_id=job_id,
        status="processing",
        message=f"Pipeline started for '{request.file_path}'.",
    )


@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Poll the status of a pipeline job."""
    with _jobs_lock:
        job = _jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ── Data query endpoints ──────────────────────────────────────────────────────


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


# ── Google Drive endpoints ───────────────────────────────────────────────────


def _get_drive_connector():
    from src.tools.airbyte_lookup import connector

    return connector


@app.get("/api/drive/search", response_model=DriveSearchResponse)
async def drive_search(query: str = Query(...), limit: int = Query(default=10, le=50)):
    """Search Google Drive for files via Airbyte connector.

    Uses the Google Drive API query syntax for the q parameter.
    e.g. "name contains 'procedure'" or "mimeType = 'application/pdf'"
    """
    connector = _get_drive_connector()
    result = await connector.execute(
        "files", "list", {"q": query, "page_size": limit}
    )
    files = [
        DriveFile(
            id=f["id"],
            name=f["name"],
            mime_type=f.get("mimeType", ""),
        )
        for f in (result.data or [])
    ]
    return DriveSearchResponse(files=files)


@app.get("/api/drive/files", response_model=DriveSearchResponse)
async def drive_list_files(limit: int = Query(default=20, le=100)):
    """List files from Google Drive."""
    connector = _get_drive_connector()
    result = await connector.execute("files", "list", {"page_size": limit})
    files = [
        DriveFile(
            id=f["id"],
            name=f["name"],
            mime_type=f.get("mimeType", ""),
        )
        for f in (result.data or [])
    ]
    return DriveSearchResponse(files=files)


GOOGLE_EXPORT_MIME = {
    "application/vnd.google-apps.document": ("text/plain", ".txt"),
    "application/vnd.google-apps.spreadsheet": ("text/csv", ".csv"),
    "application/vnd.google-apps.presentation": ("text/plain", ".txt"),
}


async def _drive_download_raw(connector, entity: str, action: str, params: dict) -> bytes:
    """Execute a download via the Airbyte hosted API, returning raw bytes.

    The standard connector.execute() fails on binary/text downloads because
    the hosted executor tries to JSON-parse the response. This bypasses that
    by making the HTTP request directly against the cloud client.
    """
    executor = connector._executor
    cloud_client = executor._cloud_client
    connector_id = executor._connector_id

    token = await cloud_client.get_bearer_token()
    url = f"{cloud_client.API_BASE_URL}/api/v1/integrations/connectors/{connector_id}/execute"
    headers = cloud_client._build_headers(token=token)
    request_body = {"entity": entity, "action": action, "params": params}

    response = await cloud_client._http_client.post(
        url, json=request_body, headers=headers
    )
    response.raise_for_status()
    return response.content


@app.post("/api/drive/run", response_model=RunResponse, status_code=202)
async def drive_run(request: DriveRunRequest, background_tasks: BackgroundTasks):
    """Download a file from Google Drive and start pFMEA analysis.

    Provide the file_id from a drive search result.
    """
    connector = _get_drive_connector()

    # Get file metadata to determine type
    file_meta = await connector.execute("files", "get", {"file_id": request.file_id})
    mime_type = file_meta.get("mimeType", "") if isinstance(file_meta, dict) else getattr(file_meta, "mimeType", "")
    file_name = request.file_name or (
        file_meta.get("name", "download") if isinstance(file_meta, dict) else getattr(file_meta, "name", "download")
    )

    # Download or export the file content as raw bytes
    if mime_type in GOOGLE_EXPORT_MIME:
        export_mime, ext = GOOGLE_EXPORT_MIME[mime_type]
        content = await _drive_download_raw(
            connector, "files_export", "download",
            {"file_id": request.file_id, "mime_type": export_mime},
        )
    else:
        ext = os.path.splitext(file_name)[1] or ".bin"
        content = await _drive_download_raw(
            connector, "files", "download",
            {"file_id": request.file_id, "alt": "media"},
        )

    # Write to temp file
    job_id = str(uuid.uuid4())
    tmp = tempfile.NamedTemporaryFile(
        suffix=ext, prefix=f"{job_id}_", delete=False
    )
    tmp.write(content)
    tmp.close()

    with _jobs_lock:
        _jobs[job_id] = JobStatus(job_id=job_id, status="processing")

    background_tasks.add_task(_run_pipeline_job, job_id, tmp.name)

    return RunResponse(
        job_id=job_id,
        status="processing",
        message=f"Google Drive file '{file_name}' downloaded. Processing started.",
    )
