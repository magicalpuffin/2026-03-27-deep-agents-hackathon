"""
schemas.py — Data models
Defines Pydantic models for manufacturing procedures, process steps, and PFMEA items
"""

from enum import Enum
from typing import Optional, Required

from pydantic import BaseModel, Field
from typing_extensions import TypedDict


class ProbabilityOfHarmScale(str, Enum):
    REMOTE = "remote"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


class SeverityScale(str, Enum):
    NEGLIGIBLE = "negligible"
    MINOR = "minor"
    MODERATE = "moderate"
    CRITICAL = "critical"
    CATASTROPHIC = "catastrophic"


class ManufacturingProcessType(str, Enum):
    ASSEMBLY = "assembly"
    INSPECTION = "inspection"
    CALIBRATION = "calibration"
    TEST = "test"


class ManufacturingProcess(BaseModel):
    name: str = Field(description="Name of the process process")
    description: str = Field(description="Description of the manufacturing process")
    process_type: ManufacturingProcessType = Field(
        description="Type of process process"
    )


class ManufacturingProcedure(BaseModel):
    title: str = Field(description="Title of the manufacturing procedure")
    process_list: list[ManufacturingProcess] = Field(
        description="List of discrete process which make up the procedure"
    )


class ProcessFailureItem(BaseModel):
    summary: str = Field(description="Summary of the potential process failure")
    process_number: str = Field(description="Number of the process")
    process_name: str = Field(description="Name of the process")
    process_requirement: str = Field(description="Required outcome of the process")
    hazard: str = Field(
        description="One or two word categorization of the potential hazard"
    )
    hazardous_situation: str = Field(
        description="Description of the hazardous situation"
    )
    potential_failure: str = Field(description="Description of the potential failure")
    potential_cause_of_failure: str = Field(
        description="Possible process causes of the failure"
    )
    harm: str = Field(description="What harm the failure could cause to a patient")
    severity_rating: str = Field(
        description="Severity rating of the potential harm (e.g. low, medium, high)"
    )
    probability_of_harm_scale: str = Field(
        description="Probability of harm rating (e.g. remote, low, moderate, high)"
    )
    severity_scale: SeverityScale = Field(description="Severity scale description")


class PFMEA(BaseModel):
    title: str = Field(description="Title of the pFMEA")
    process_failure_items: list[ProcessFailureItem] = Field(
        description="All processes with failure and risk assessments"
    )


class AgentState(TypedDict, total=False):
    file_path: Required[str]
    raw_text: str
    manufacturing_procedure: Optional[ManufacturingProcedure]
    pfmea: Optional[PFMEA]
    retry_count: int
    platform_response: Optional[dict]
    error: Optional[str]
    status: str
