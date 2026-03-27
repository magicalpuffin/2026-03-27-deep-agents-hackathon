"""
repository.py — Data access functions using SQLAlchemy ORM.
"""

import uuid

from sqlalchemy import text
from sqlalchemy.orm import Session

from src.models import PFMEAItemModel, Procedure, Process


def create_procedure(session: Session, title: str, file_path: str = "") -> str:
    procedure_id = str(uuid.uuid4())
    proc = Procedure(procedure_id=procedure_id, title=title, file_path=file_path)
    session.add(proc)
    session.flush()
    return procedure_id


def get_procedure(session: Session, procedure_id: str) -> Procedure | None:
    return session.get(Procedure, procedure_id)


def list_procedures(session: Session) -> list[Procedure]:
    return list(session.query(Procedure).order_by(Procedure.title).all())


def create_process(
    session: Session,
    procedure_id: str,
    name: str,
    description: str,
    process_type: str,
) -> str:
    process_id = str(uuid.uuid4())
    proc = Process(
        process_id=process_id,
        procedure_id=procedure_id,
        name=name,
        description=description,
        process_type=process_type,
    )
    session.add(proc)
    session.flush()
    return process_id


def get_processes_for_procedure(
    session: Session, procedure_id: str
) -> list[Process]:
    return list(
        session.query(Process).filter(Process.procedure_id == procedure_id).all()
    )


def create_pfmea_item(
    session: Session,
    procedure_id: str,
    process_key: str,
    record: dict,
    embedding: list[float] | None = None,
) -> str:
    item_id = str(uuid.uuid4())
    item = PFMEAItemModel(
        item_id=item_id,
        procedure_id=procedure_id,
        process_key=process_key,
        summary=record.get("summary", ""),
        process_number=record.get("process_number", ""),
        process_name=record.get("process_name", ""),
        process_requirement=record.get("process_requirement", ""),
        hazard=record.get("hazard", ""),
        hazard_category=record.get("hazard_category", ""),
        hazardous_situation=record.get("hazardous_situation", ""),
        potential_failure=record.get("potential_failure", ""),
        potential_cause_of_failure=record.get("potential_cause_of_failure", ""),
        harm=record.get("harm", ""),
        severity_rating=record.get("severity_rating", ""),
        severity=record.get("severity", 0),
        probability_of_harm_scale=record.get("probability_of_harm_scale", ""),
        risk_level=record.get("risk_level", ""),
        mitigation=record.get("mitigation", ""),
        embedding=embedding,
    )
    session.add(item)
    session.flush()
    return item_id


def get_pfmea_items_for_procedure(
    session: Session, procedure_id: str
) -> list[PFMEAItemModel]:
    return list(
        session.query(PFMEAItemModel)
        .filter(PFMEAItemModel.procedure_id == procedure_id)
        .all()
    )


def get_pfmea_item(session: Session, item_id: str) -> PFMEAItemModel | None:
    return session.get(PFMEAItemModel, item_id)


def vector_search(
    session: Session, query_embedding: list[float], limit: int = 5
) -> list[dict]:
    """Search for similar pFMEA items using cosine distance via pgvector."""
    embedding_str = str(query_embedding)
    rows = session.execute(
        text(
            """SELECT item_id, procedure_id, process_key, summary, hazard,
                      hazard_category, severity, risk_level, mitigation,
                      1 - (embedding <=> :emb::vector) AS similarity
               FROM pfmea_items
               WHERE embedding IS NOT NULL
               ORDER BY embedding <=> :emb::vector
               LIMIT :lim"""
        ),
        {"emb": embedding_str, "lim": limit},
    ).mappings().all()
    return [dict(row) for row in rows]
