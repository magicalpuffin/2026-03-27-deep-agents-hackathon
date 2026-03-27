"""
tools/hazard_lookup.py

Static reference table of patient hazards, harms, and severity ratings
for use in pFMEA extraction. Based on ISO 14971 severity classifications.

Severity scale:
    5 - Catastrophic  : Death or permanent severe injury
    4 - Critical      : Serious injury requiring medical intervention
    3 - Moderate      : Injury requiring medical attention, reversible
    2 - Minor         : Temporary injury, no medical intervention required
    1 - Negligible    : Inconvenience or temporary discomfort
"""

from pathlib import Path

import pandas as pd
from langchain_core.tools import tool
from pydantic import BaseModel, TypeAdapter
from rapidfuzz import fuzz, process

# ── Schemas ──────────────────────────────────────────────────────────────────


class HazardEntry(BaseModel):
    hazard: str
    harm: str
    severity_rating: str


# ── Reference table ───────────────────────────────────────────────────────────

_CSV_PATH = Path(__file__).resolve().parents[2] / "data" / "hazard_harm_severity.csv"

_raw_records: list[dict] = (
    pd.read_csv(_CSV_PATH)
    .rename(columns={"Hazard": "hazard", "Harm": "harm", "Severity": "severity_rating"})
    .to_dict(orient="records")
)

HAZARD_TABLE: list[HazardEntry] = TypeAdapter(list[HazardEntry]).validate_python(
    _raw_records
)


# ── Output schema ─────────────────────────────────────────────────────────────


class HazardMatch(BaseModel):
    hazard: str
    harm: str
    severity_rating: str
    match_score: float


# ── Tool ──────────────────────────────────────────────────────────────────────


@tool
def lookup_patient_hazard(query: str, top_k: int = 5) -> list[dict]:
    """
    Look up patient hazards, harms, and severity ratings relevant to a
    process step or failure mode description.

    Uses fuzzy matching against a reference table of known radiation therapy
    hazards. Returns the top matching entries.

    Args:
        query: A description of the hazard, failure mode, or process step.
               e.g. "beam misalignment during treatment", "wrong dose delivered"
        top_k: Number of top matches to return (default 5, max 10)

    Returns:
        List of matching hazard entries with harm description and severity rating.
    """
    top_k = min(top_k, 10)

    # Build searchable strings combining hazard + harm for better matching
    candidates = [f"{row.hazard} | {row.harm}" for row in HAZARD_TABLE]

    # Fuzzy match against the combined hazard+harm strings
    matches = process.extract(
        query,
        candidates,
        scorer=fuzz.WRatio,
        limit=top_k,
    )

    results = []
    for matched_string, score, index in matches:
        entry = HAZARD_TABLE[index]
        results.append(
            HazardMatch(
                hazard=entry.hazard,
                harm=entry.harm,
                severity_rating=entry.severity_rating,
                match_score=score,
            ).model_dump()
        )

    return results


# ── Optional: exact hazard category lookup ────────────────────────────────────


@tool
def get_severity_for_hazard_category(hazard_category: str) -> list[dict]:
    """
    Return all known harms and severity ratings for a specific hazard category.
    Use this when you know the exact hazard type (e.g. 'Radiation - Wrong Dose').

    Args:
        hazard_category: Exact or partial hazard category name.

    Returns:
        All table entries matching that hazard category.
    """
    query_lower = hazard_category.lower()
    matches = [
        HazardMatch(
            hazard=entry.hazard,
            harm=entry.harm,
            severity_rating=entry.severity_rating,
            match_score=100,
        ).model_dump()
        for entry in HAZARD_TABLE
        if query_lower in entry.hazard.lower()
    ]
    return (
        matches if matches else [{"error": f"No entries found for: {hazard_category}"}]
    )


# ── Quick test ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Fuzzy lookup: 'beam misalignment' ===")
    for r in lookup_patient_hazard.invoke({"query": "beam misalignment", "top_k": 10}):
        print(f"  [{r['severity_rating']}] {r['hazard']}")
        print(f"    Harm: {r['harm']}")
        print(f"    Match score: {r['match_score']}\n")

    print("=== Category lookup: 'Wrong Dose' ===")
    for r in get_severity_for_hazard_category.invoke({"hazard_category": "Wrong Dose"}):
        print(f"  [{r['severity_rating']}] {r['harm']}")
