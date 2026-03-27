"""
db.py — Aerospike database layer

Provides CRUD operations for procedures, processes, and pFMEA items,
plus vector search for similar failure modes.
"""

import os
import uuid

import aerospike
from aerospike_vector_search import Client as VectorClient
from aerospike_vector_search import types as avs_types
from dotenv import load_dotenv

load_dotenv()

AEROSPIKE_HOST = os.getenv("AEROSPIKE_HOST", "localhost")
AEROSPIKE_PORT = int(os.getenv("AEROSPIKE_PORT", "3000"))
AEROSPIKE_NAMESPACE = os.getenv("AEROSPIKE_NAMESPACE", "test")
AVS_HOST = os.getenv("AVS_HOST", "localhost")
AVS_PORT = int(os.getenv("AVS_PORT", "5000"))

# Set names
SET_PROCEDURES = "procedures"
SET_PROCESSES = "processes"
SET_PFMEA_ITEMS = "pfmea_items"

# Vector index config
VECTOR_DIMS = 1536
VECTOR_INDEX_NAME = "pfmea_hazard_idx"


class AerospikeDB:
    def __init__(self):
        config = {"hosts": [(AEROSPIKE_HOST, AEROSPIKE_PORT)]}
        self.client = aerospike.client(config).connect()
        self.namespace = AEROSPIKE_NAMESPACE
        self.vector_client = VectorClient(
            seeds=avs_types.HostPort(host=AVS_HOST, port=AVS_PORT)
        )
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create secondary indexes if they don't exist."""
        index_defs = [
            (SET_PROCESSES, "procedure_id", "idx_proc_procedure", aerospike.INDEX_STRING),
            (SET_PFMEA_ITEMS, "procedure_id", "idx_pfmea_procedure", aerospike.INDEX_STRING),
            (SET_PFMEA_ITEMS, "process_key", "idx_pfmea_process", aerospike.INDEX_STRING),
        ]
        for set_name, bin_name, index_name, index_type in index_defs:
            try:
                self.client.index_string_create(
                    self.namespace, set_name, bin_name, index_name
                )
            except aerospike.exception.IndexFoundError:
                pass

    def _key(self, set_name: str, record_id: str):
        return (self.namespace, set_name, record_id)

    # ── Procedures ───────────────────────────────────────────────────────────

    def create_procedure(self, title: str, file_path: str = "") -> str:
        """Create a procedure record. Returns the procedure_id."""
        procedure_id = str(uuid.uuid4())
        bins = {
            "procedure_id": procedure_id,
            "title": title,
            "file_path": file_path,
        }
        self.client.put(self._key(SET_PROCEDURES, procedure_id), bins)
        return procedure_id

    def get_procedure(self, procedure_id: str) -> dict | None:
        try:
            _, _, bins = self.client.get(self._key(SET_PROCEDURES, procedure_id))
            return bins
        except aerospike.exception.RecordNotFound:
            return None

    def list_procedures(self) -> list[dict]:
        results: list[dict] = []
        scan = self.client.scan(self.namespace, SET_PROCEDURES)
        scan.foreach(lambda record: results.append(record[2]))
        return results

    # ── Processes ────────────────────────────────────────────────────────────

    def create_process(
        self, procedure_id: str, name: str, description: str, process_type: str
    ) -> str:
        process_id = str(uuid.uuid4())
        bins = {
            "process_id": process_id,
            "procedure_id": procedure_id,
            "name": name,
            "description": description,
            "process_type": process_type,
        }
        self.client.put(self._key(SET_PROCESSES, process_id), bins)
        return process_id

    def get_processes_for_procedure(self, procedure_id: str) -> list[dict]:
        query = self.client.query(self.namespace, SET_PROCESSES)
        query.where(aerospike.predicates.equals("procedure_id", procedure_id))
        results: list[dict] = []
        query.foreach(lambda record: results.append(record[2]))
        return results

    # ── pFMEA Items ──────────────────────────────────────────────────────────

    def create_pfmea_item(
        self,
        procedure_id: str,
        process_key: str,
        record: dict,
        embedding: list[float] | None = None,
    ) -> str:
        item_id = str(uuid.uuid4())
        bins = {
            "item_id": item_id,
            "procedure_id": procedure_id,
            "process_key": process_key,
            **record,
        }
        if embedding is not None:
            bins["embedding"] = embedding
        self.client.put(self._key(SET_PFMEA_ITEMS, item_id), bins)
        return item_id

    def get_pfmea_items_for_procedure(self, procedure_id: str) -> list[dict]:
        query = self.client.query(self.namespace, SET_PFMEA_ITEMS)
        query.where(aerospike.predicates.equals("procedure_id", procedure_id))
        results: list[dict] = []
        query.foreach(lambda record: results.append(record[2]))
        return results

    def get_pfmea_item(self, item_id: str) -> dict | None:
        try:
            _, _, bins = self.client.get(self._key(SET_PFMEA_ITEMS, item_id))
            return bins
        except aerospike.exception.RecordNotFound:
            return None

    # ── Vector Search ────────────────────────────────────────────────────────

    def vector_search(
        self, query_embedding: list[float], limit: int = 5
    ) -> list[dict]:
        """Search for similar pFMEA items using vector similarity."""
        results = self.vector_client.vector_search(
            namespace=self.namespace,
            index_name=VECTOR_INDEX_NAME,
            query=query_embedding,
            limit=limit,
            field_names=[
                "item_id",
                "procedure_id",
                "process_key",
                "summary",
                "hazard",
                "hazard_category",
                "severity",
                "risk_level",
                "mitigation",
            ],
        )
        return [r.fields for r in results]

    def close(self):
        self.client.close()
        self.vector_client.close()
