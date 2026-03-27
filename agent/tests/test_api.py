"""
Tests for the FastAPI API routes.

Uses FastAPI's TestClient with mocked database and embedding dependencies
so tests run without a real PostgreSQL or OpenAI connection.
"""

import tempfile
from contextlib import contextmanager
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from src.api_models import JobStatus


# ── Fixtures ──────────────────────────────────────────────────────────────────


def _make_procedure(
    procedure_id: str = "proc-1",
    title: str = "Test Procedure",
    file_path: str = "/tmp/test.txt",
) -> MagicMock:
    p = MagicMock()
    p.procedure_id = procedure_id
    p.title = title
    p.file_path = file_path
    return p


def _make_process(
    process_id: str = "process-1",
    procedure_id: str = "proc-1",
    name: str = "Soldering",
    description: str = "Solder components",
    process_type: str = "assembly",
) -> MagicMock:
    p = MagicMock()
    p.process_id = process_id
    p.procedure_id = procedure_id
    p.name = name
    p.description = description
    p.process_type = process_type
    return p


def _make_pfmea_item(
    item_id: str = "item-1",
    procedure_id: str = "proc-1",
    process_key: str = "process-1",
    summary: str = "Cold solder joint",
    hazard: str = "Electrical",
    hazard_category: str = "Electrical",
    severity: int = 3,
    risk_level: str = "moderate",
    mitigation: str = "Visual inspection",
    hazardous_situation: str = "Short circuit",
    potential_failure: str = "Joint crack",
    potential_cause_of_failure: str = "Low temperature",
    harm: str = "Device malfunction",
    severity_rating: str = "moderate",
    probability_of_harm_scale: str = "low",
) -> MagicMock:
    item = MagicMock()
    item.item_id = item_id
    item.procedure_id = procedure_id
    item.process_key = process_key
    item.summary = summary
    item.hazard = hazard
    item.hazard_category = hazard_category
    item.severity = severity
    item.risk_level = risk_level
    item.mitigation = mitigation
    item.hazardous_situation = hazardous_situation
    item.potential_failure = potential_failure
    item.potential_cause_of_failure = potential_cause_of_failure
    item.harm = harm
    item.severity_rating = severity_rating
    item.probability_of_harm_scale = probability_of_harm_scale
    return item


@contextmanager
def _mock_session():
    yield MagicMock()


@pytest.fixture()
def client():
    """Create a TestClient with mocked database session."""
    with patch("src.api.get_session", _mock_session):
        from src.api import app

        with TestClient(app) as c:
            yield c


# ── Procedure endpoints ──────────────────────────────────────────────────────


class TestListProcedures:
    def test_returns_empty_list(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.list_procedures.return_value = []
            resp = client.get("/api/procedures")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_procedures(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.list_procedures.return_value = [
                _make_procedure("p1", "Proc A", "/a.txt"),
                _make_procedure("p2", "Proc B", "/b.txt"),
            ]
            resp = client.get("/api/procedures")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        assert data[0]["procedure_id"] == "p1"
        assert data[1]["title"] == "Proc B"


class TestGetProcedure:
    def test_found(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.get_procedure.return_value = _make_procedure()
            mock_repo.get_processes_for_procedure.return_value = [_make_process()]
            resp = client.get("/api/procedures/proc-1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["procedure_id"] == "proc-1"
        assert len(data["processes"]) == 1
        assert data["processes"][0]["name"] == "Soldering"

    def test_not_found(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.get_procedure.return_value = None
            resp = client.get("/api/procedures/nonexistent")
        assert resp.status_code == 404


# ── pFMEA endpoints ──────────────────────────────────────────────────────────


class TestGetPFMEAItems:
    def test_returns_items(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.get_pfmea_items_for_procedure.return_value = [
                _make_pfmea_item(),
            ]
            resp = client.get("/api/procedures/proc-1/pfmea")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["item_id"] == "item-1"
        assert data[0]["summary"] == "Cold solder joint"

    def test_returns_empty(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.get_pfmea_items_for_procedure.return_value = []
            resp = client.get("/api/procedures/proc-1/pfmea")
        assert resp.status_code == 200
        assert resp.json() == []


class TestGetPFMEAItemDetail:
    def test_found(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.get_pfmea_item.return_value = _make_pfmea_item()
            resp = client.get("/api/pfmea-items/item-1")
        assert resp.status_code == 200
        data = resp.json()
        assert data["item_id"] == "item-1"
        assert data["hazardous_situation"] == "Short circuit"
        assert data["potential_failure"] == "Joint crack"
        assert data["severity_rating"] == "moderate"

    def test_not_found(self, client):
        with patch("src.api.repository") as mock_repo:
            mock_repo.get_pfmea_item.return_value = None
            resp = client.get("/api/pfmea-items/nonexistent")
        assert resp.status_code == 404


# ── Search endpoint ──────────────────────────────────────────────────────────


class TestSearchSimilar:
    def test_returns_results(self, client):
        with (
            patch("src.api.embed_query", return_value=[0.1] * 1536),
            patch("src.api.repository") as mock_repo,
        ):
            mock_repo.vector_search.return_value = [
                {
                    "item_id": "item-1",
                    "procedure_id": "proc-1",
                    "process_key": "pk-1",
                    "summary": "Cold joint",
                    "hazard": "Electrical",
                    "risk_level": "moderate",
                    "mitigation": "Inspection",
                }
            ]
            resp = client.get("/api/search/similar?query=solder+failure")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["summary"] == "Cold joint"

    def test_returns_empty(self, client):
        with (
            patch("src.api.embed_query", return_value=[0.0] * 1536),
            patch("src.api.repository") as mock_repo,
        ):
            mock_repo.vector_search.return_value = []
            resp = client.get("/api/search/similar?query=nothing")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_missing_query_param(self, client):
        resp = client.get("/api/search/similar")
        assert resp.status_code == 422


# ── Upload endpoint ──────────────────────────────────────────────────────────


class TestUpload:
    def test_upload_returns_job_id(self, client):
        with patch("src.api._run_pipeline_job"):
            resp = client.post(
                "/api/upload",
                files={"file": ("test.txt", b"procedure content", "text/plain")},
            )
        assert resp.status_code == 202
        data = resp.json()
        assert "job_id" in data
        assert data["status"] == "processing"
        assert "test.txt" in data["message"]


# ── Run endpoint ─────────────────────────────────────────────────────────────


class TestRun:
    def test_run_with_valid_path(self, client):
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
            f.write(b"some content")
            tmp_path = f.name

        with patch("src.api._run_pipeline_job"):
            resp = client.post("/api/run", json={"file_path": tmp_path})
        assert resp.status_code == 202
        data = resp.json()
        assert "job_id" in data
        assert data["status"] == "processing"

    def test_run_with_missing_file(self, client):
        resp = client.post("/api/run", json={"file_path": "/nonexistent/file.txt"})
        assert resp.status_code == 400
        assert "File not found" in resp.json()["detail"]


# ── Job status endpoint ──────────────────────────────────────────────────────


class TestJobStatus:
    def test_job_not_found(self, client):
        resp = client.get("/api/jobs/nonexistent-id")
        assert resp.status_code == 404

    def test_job_processing(self, client):
        from src.api import _jobs, _jobs_lock

        job_id = "test-job-123"
        with _jobs_lock:
            _jobs[job_id] = JobStatus(job_id=job_id, status="processing")

        resp = client.get(f"/api/jobs/{job_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "processing"
        assert data["procedure_id"] is None

        # Cleanup
        with _jobs_lock:
            _jobs.pop(job_id, None)

    def test_job_done(self, client):
        from src.api import _jobs, _jobs_lock

        job_id = "test-job-456"
        with _jobs_lock:
            _jobs[job_id] = JobStatus(
                job_id=job_id, status="done", procedure_id="proc-99"
            )

        resp = client.get(f"/api/jobs/{job_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "done"
        assert data["procedure_id"] == "proc-99"

        # Cleanup
        with _jobs_lock:
            _jobs.pop(job_id, None)

    def test_job_failed(self, client):
        from src.api import _jobs, _jobs_lock

        job_id = "test-job-789"
        with _jobs_lock:
            _jobs[job_id] = JobStatus(
                job_id=job_id, status="failed", error="LLM timeout"
            )

        resp = client.get(f"/api/jobs/{job_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "failed"
        assert data["error"] == "LLM timeout"

        # Cleanup
        with _jobs_lock:
            _jobs.pop(job_id, None)
