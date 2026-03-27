"""
api_models.py — Pydantic response models for the FastAPI server
"""

from pydantic import BaseModel


class ProcedureListItem(BaseModel):
    procedure_id: str
    title: str
    file_path: str = ""


class ProcessItem(BaseModel):
    process_id: str
    procedure_id: str
    name: str
    description: str
    process_type: str


class ProcedureDetail(BaseModel):
    procedure_id: str
    title: str
    file_path: str = ""
    processes: list[ProcessItem] = []


class PFMEAItem(BaseModel):
    item_id: str
    procedure_id: str
    process_key: str
    summary: str
    hazard: str
    hazard_category: str = ""
    severity: int = 0
    risk_level: str = ""
    mitigation: str = ""


class PFMEAItemDetail(BaseModel):
    item_id: str
    procedure_id: str
    process_key: str
    summary: str
    hazard: str
    hazard_category: str = ""
    hazardous_situation: str = ""
    potential_failure: str = ""
    potential_cause_of_failure: str = ""
    harm: str = ""
    severity_rating: str = ""
    severity: int = 0
    probability_of_harm_scale: str = ""
    risk_level: str = ""
    mitigation: str = ""


class SimilarResult(BaseModel):
    item_id: str = ""
    procedure_id: str = ""
    process_key: str = ""
    summary: str = ""
    hazard: str = ""
    risk_level: str = ""
    mitigation: str = ""


class UploadResponse(BaseModel):
    job_id: str
    status: str = "processing"
    message: str = "File uploaded and processing started"


class RunRequest(BaseModel):
    file_path: str


class RunResponse(BaseModel):
    job_id: str
    status: str = "processing"
    message: str = "Pipeline started"


class JobStatus(BaseModel):
    job_id: str
    status: str
    procedure_id: str | None = None
    error: str | None = None
