"""
tools/probability_of_harm.py

Lookup tool for probability of harm based on ISO 14971 risk matrix.
Uses P1 (probability of hazardous situation) and P2 (probability of
harm given the hazardous situation) to determine an overall risk level.

P1/P2 scale: 1 (most likely) to 7 (least likely)

Risk levels:
    Very High - Immediate risk reduction required
    High      - Risk reduction required
    Moderate  - Risk reduction recommended
    Low       - Acceptable with monitoring
    Remote    - Broadly acceptable
"""

import csv
from enum import IntEnum
from pathlib import Path

from langchain_core.tools import tool
from pydantic import BaseModel, Field

# ── Probability scales ───────────────────────────────────────────────────────


class P1Scale(IntEnum):
    """
    Probability of the hazardous situation occurring (P1 Occurrences).

    1 - ALWAYS:             Every procedure
    2 - DAILY:              Once a day
    3 - WEEKLY:             Once a week
    4 - MONTHLY:            Once a month
    5 - YEARLY:             Once a year
    6 - TWICE_IN_LIFETIME:  Twice in life of device
    7 - ONCE_IN_LIFETIME:   Once in life of device
    """

    ALWAYS = 1
    DAILY = 2
    WEEKLY = 3
    MONTHLY = 4
    YEARLY = 5
    TWICE_IN_LIFETIME = 6
    ONCE_IN_LIFETIME = 7


class P2Scale(IntEnum):
    """
    Probability of harm given the hazardous situation (% of occurrences that harm).

    1 - ALWAYS:           100% of occurrences
    2 - VERY_LIKELY:      75% of occurrences
    3 - LIKELY:           50% of occurrences
    4 - POSSIBLE:         25% of occurrences
    5 - UNLIKELY:         10% of occurrences
    6 - VERY_UNLIKELY:    1% of occurrences
    7 - RARELY:           Less than 1% of occurrences
    """

    ALWAYS = 1
    VERY_LIKELY = 2
    LIKELY = 3
    POSSIBLE = 4
    UNLIKELY = 5
    VERY_UNLIKELY = 6
    RARELY = 7


# ── Risk matrix ──────────────────────────────────────────────────────────────
# RISK_MATRIX[p1][p2] → risk level
# Loaded from data/p1_p2_risk_matrix.csv

_CSV_PATH = Path(__file__).resolve().parents[2] / "data" / "p1_p2_risk_matrix.csv"

RISK_MATRIX: dict[P1Scale, dict[P2Scale, str]] = {}
with open(_CSV_PATH) as f:
    reader = csv.reader(f)
    header = next(reader)
    p2_keys = [P2Scale(int(col)) for col in header[1:]]
    for row in reader:
        p1 = P1Scale(int(row[0]))
        RISK_MATRIX[p1] = {p2: risk_level for p2, risk_level in zip(p2_keys, row[1:])}


# ── Output schema ────────────────────────────────────────────────────────────


class ProbabilityOfHarmResult(BaseModel):
    p1: int = Field(description="Probability of hazardous situation (1-7)")
    p1_label: str = Field(description="P1 scale description")
    p2: int = Field(description="Probability of harm given hazardous situation (1-7)")
    p2_label: str = Field(description="P2 scale description")
    risk_level: str = Field(description="Overall risk level from the matrix")


# ── Tool ─────────────────────────────────────────────────────────────────────


@tool
def lookup_probability_of_harm(p1: int, p2: int) -> dict:
    """
    Look up the probability of harm risk level from the P1/P2 risk matrix.

    Args:
        p1: Probability of the hazardous situation occurring.
            1=Every procedure, 2=Daily, 3=Weekly, 4=Monthly, 5=Yearly,
            6=Twice in life of device, 7=Once in life of device
        p2: Probability of harm given the hazardous situation.
            1=100%, 2=75%, 3=50%, 4=25%, 5=10%, 6=1%, 7=Less than 1%

    Returns:
        The risk level (Very High, High, Moderate, Low, Remote) for the given P1/P2 combination.
    """
    try:
        p1_scale = P1Scale(p1)
        p2_scale = P2Scale(p2)
    except ValueError:
        return {
            "error": f"Invalid P1={p1} or P2={p2}. Both must be integers from 1 to 7."
        }

    risk_level = RISK_MATRIX[p1_scale][p2_scale]

    return ProbabilityOfHarmResult(
        p1=p1_scale,
        p1_label=p1_scale.name,
        p2=p2_scale,
        p2_label=p2_scale.name,
        risk_level=risk_level,
    ).model_dump()


# ── Quick test ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== P1=1, P2=1 ===")
    print(lookup_probability_of_harm.invoke({"p1": 1, "p2": 1}))

    print("=== P1=2, P2=3 ===")
    print(lookup_probability_of_harm.invoke({"p1": 2, "p2": 3}))

    print("=== P1=5, P2=5 ===")
    print(lookup_probability_of_harm.invoke({"p1": 5, "p2": 5}))