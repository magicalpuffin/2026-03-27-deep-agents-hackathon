"""
models.py — SQLAlchemy ORM models for procedures, processes, and pFMEA items.
"""

import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Procedure(Base):
    __tablename__ = "procedures"

    procedure_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    file_path: Mapped[str] = mapped_column(Text, default="")

    processes: Mapped[list["Process"]] = relationship(back_populates="procedure")
    pfmea_items: Mapped[list["PFMEAItemModel"]] = relationship(
        back_populates="procedure"
    )


class Process(Base):
    __tablename__ = "processes"

    process_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    procedure_id: Mapped[str] = mapped_column(
        String, ForeignKey("procedures.procedure_id"), nullable=False
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    process_type: Mapped[str] = mapped_column(Text, default="")

    procedure: Mapped["Procedure"] = relationship(back_populates="processes")

    __table_args__ = (
        Index("idx_proc_procedure", "procedure_id"),
    )


class PFMEAItemModel(Base):
    __tablename__ = "pfmea_items"

    item_id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    procedure_id: Mapped[str] = mapped_column(
        String, ForeignKey("procedures.procedure_id"), nullable=False
    )
    process_key: Mapped[str] = mapped_column(Text, default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    process_number: Mapped[str] = mapped_column(Text, default="")
    process_name: Mapped[str] = mapped_column(Text, default="")
    process_requirement: Mapped[str] = mapped_column(Text, default="")
    hazard: Mapped[str] = mapped_column(Text, default="")
    hazard_category: Mapped[str] = mapped_column(Text, default="")
    hazardous_situation: Mapped[str] = mapped_column(Text, default="")
    potential_failure: Mapped[str] = mapped_column(Text, default="")
    potential_cause_of_failure: Mapped[str] = mapped_column(Text, default="")
    harm: Mapped[str] = mapped_column(Text, default="")
    severity_rating: Mapped[str] = mapped_column(Text, default="")
    severity: Mapped[int] = mapped_column(Integer, default=0)
    probability_of_harm_scale: Mapped[str] = mapped_column(Text, default="")
    risk_level: Mapped[str] = mapped_column(Text, default="")
    mitigation: Mapped[str] = mapped_column(Text, default="")
    embedding = mapped_column(Vector(1536), nullable=True)

    procedure: Mapped["Procedure"] = relationship(back_populates="pfmea_items")

    __table_args__ = (
        Index("idx_pfmea_procedure", "procedure_id"),
        Index("idx_pfmea_process", "process_key"),
    )
