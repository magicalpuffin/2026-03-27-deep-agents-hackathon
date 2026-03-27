"""
db.py — PostgreSQL database layer

Provides CRUD operations for procedures, processes, and pFMEA items,
plus vector search for similar failure modes using pgvector.
"""

import os
import uuid

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DB_URL", "")

VECTOR_DIMS = 1536

_CREATE_TABLES_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS procedures (
    procedure_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    file_path TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS processes (
    process_id TEXT PRIMARY KEY,
    procedure_id TEXT NOT NULL REFERENCES procedures(procedure_id),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    process_type TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS pfmea_items (
    item_id TEXT PRIMARY KEY,
    procedure_id TEXT NOT NULL REFERENCES procedures(procedure_id),
    process_key TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    process_number TEXT DEFAULT '',
    process_name TEXT DEFAULT '',
    process_requirement TEXT DEFAULT '',
    hazard TEXT DEFAULT '',
    hazard_category TEXT DEFAULT '',
    hazardous_situation TEXT DEFAULT '',
    potential_failure TEXT DEFAULT '',
    potential_cause_of_failure TEXT DEFAULT '',
    harm TEXT DEFAULT '',
    severity_rating TEXT DEFAULT '',
    severity INTEGER DEFAULT 0,
    probability_of_harm_scale TEXT DEFAULT '',
    risk_level TEXT DEFAULT '',
    mitigation TEXT DEFAULT '',
    embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_proc_procedure ON processes(procedure_id);
CREATE INDEX IF NOT EXISTS idx_pfmea_procedure ON pfmea_items(procedure_id);
CREATE INDEX IF NOT EXISTS idx_pfmea_process ON pfmea_items(process_key);
"""


class PostgresDB:
    def __init__(self, db_url: str | None = None):
        self.db_url = db_url or DB_URL
        self.conn = psycopg2.connect(self.db_url)
        self.conn.autocommit = True
        self._ensure_tables()

    def _ensure_tables(self):
        with self.conn.cursor() as cur:
            cur.execute(_CREATE_TABLES_SQL)

    # ── Procedures ───────────────────────────────────────────────────────────

    def create_procedure(self, title: str, file_path: str = "") -> str:
        procedure_id = str(uuid.uuid4())
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO procedures (procedure_id, title, file_path) VALUES (%s, %s, %s)",
                (procedure_id, title, file_path),
            )
        return procedure_id

    def get_procedure(self, procedure_id: str) -> dict | None:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM procedures WHERE procedure_id = %s", (procedure_id,))
            row = cur.fetchone()
            return dict(row) if row else None

    def list_procedures(self) -> list[dict]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM procedures ORDER BY title")
            return [dict(row) for row in cur.fetchall()]

    # ── Processes ────────────────────────────────────────────────────────────

    def create_process(
        self, procedure_id: str, name: str, description: str, process_type: str
    ) -> str:
        process_id = str(uuid.uuid4())
        with self.conn.cursor() as cur:
            cur.execute(
                "INSERT INTO processes (process_id, procedure_id, name, description, process_type) "
                "VALUES (%s, %s, %s, %s, %s)",
                (process_id, procedure_id, name, description, process_type),
            )
        return process_id

    def get_processes_for_procedure(self, procedure_id: str) -> list[dict]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM processes WHERE procedure_id = %s", (procedure_id,))
            return [dict(row) for row in cur.fetchall()]

    # ── pFMEA Items ──────────────────────────────────────────────────────────

    def create_pfmea_item(
        self,
        procedure_id: str,
        process_key: str,
        record: dict,
        embedding: list[float] | None = None,
    ) -> str:
        item_id = str(uuid.uuid4())
        with self.conn.cursor() as cur:
            cur.execute(
                """INSERT INTO pfmea_items (
                    item_id, procedure_id, process_key,
                    summary, process_number, process_name, process_requirement,
                    hazard, hazard_category, hazardous_situation,
                    potential_failure, potential_cause_of_failure,
                    harm, severity_rating, severity,
                    probability_of_harm_scale, risk_level, mitigation,
                    embedding
                ) VALUES (
                    %s, %s, %s,
                    %s, %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s, %s,
                    %s
                )""",
                (
                    item_id, procedure_id, process_key,
                    record.get("summary", ""),
                    record.get("process_number", ""),
                    record.get("process_name", ""),
                    record.get("process_requirement", ""),
                    record.get("hazard", ""),
                    record.get("hazard_category", ""),
                    record.get("hazardous_situation", ""),
                    record.get("potential_failure", ""),
                    record.get("potential_cause_of_failure", ""),
                    record.get("harm", ""),
                    record.get("severity_rating", ""),
                    record.get("severity", 0),
                    record.get("probability_of_harm_scale", ""),
                    record.get("risk_level", ""),
                    record.get("mitigation", ""),
                    str(embedding) if embedding else None,
                ),
            )
        return item_id

    def get_pfmea_items_for_procedure(self, procedure_id: str) -> list[dict]:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT item_id, procedure_id, process_key, summary, process_number, "
                "process_name, process_requirement, hazard, hazard_category, "
                "hazardous_situation, potential_failure, potential_cause_of_failure, "
                "harm, severity_rating, severity, probability_of_harm_scale, "
                "risk_level, mitigation FROM pfmea_items WHERE procedure_id = %s",
                (procedure_id,),
            )
            return [dict(row) for row in cur.fetchall()]

    def get_pfmea_item(self, item_id: str) -> dict | None:
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT item_id, procedure_id, process_key, summary, process_number, "
                "process_name, process_requirement, hazard, hazard_category, "
                "hazardous_situation, potential_failure, potential_cause_of_failure, "
                "harm, severity_rating, severity, probability_of_harm_scale, "
                "risk_level, mitigation FROM pfmea_items WHERE item_id = %s",
                (item_id,),
            )
            row = cur.fetchone()
            return dict(row) if row else None

    # ── Vector Search ────────────────────────────────────────────────────────

    def vector_search(
        self, query_embedding: list[float], limit: int = 5
    ) -> list[dict]:
        """Search for similar pFMEA items using cosine distance via pgvector."""
        with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                """SELECT item_id, procedure_id, process_key, summary, hazard,
                          hazard_category, severity, risk_level, mitigation,
                          1 - (embedding <=> %s::vector) AS similarity
                   FROM pfmea_items
                   WHERE embedding IS NOT NULL
                   ORDER BY embedding <=> %s::vector
                   LIMIT %s""",
                (str(query_embedding), str(query_embedding), limit),
            )
            return [dict(row) for row in cur.fetchall()]

    def close(self):
        self.conn.close()
