from pathlib import Path

risk_management = (
    Path(__file__).resolve().parent.parent / "data" / "risk_management.md"
).read_text()

EXTRACTION_PROMPT = """You are a manufacturing document parser.

## Instructions

Parse the given manufacturing procedure document into discrete processes. \
Group together steps which are part of the same overall process, but do not merge distinct processes together.

For each process, identify:
- **name**: A concise name for the process
- **description**: What is done in this process
- **process_type**: Classify as assembly, inspection, calibration, or test
    - Assembly processes physically attach material to the system. Ex. installing a bracket and torquing to spec
    - Inspection processes involve checking or measuring a physical part or system feature. This should not physically modify the system. Ex. measuring a gap or verifying a label
    - Calibration processes involve adjusting a machine or system to achieve a desired output. Ex. setting a parameter on the system
    - Test processes involve running the system and checking that it behaves as expected. This should not modify or change a calibration. Ex. running a software test or verifying a sensor reading

Many procedures include a assembly and then immediate inspection. Or a calibration and test. \
These processes should be separately identified. If a process includes many smaller test steps, \
these can be grouped into one larger test process with a list of each property being tested.

"""

PFMEA_PROMPT = f"""You are a risk analyst generating a process FMEA (pFMEA) for \
a manufacturing procedure.

## Rating Scales Reference
{risk_management}

## Instructions

For each process , generate one or more process failure items. Each item must include:
- **process_requirement**: What the process must achieve
- **potential_failure**: How the process could fail to meet its requirement
- **potential_cause_of_failure**: The process-level root cause
- **hazard**: A one or two word hazard category (e.g. "Radiation - Wrong Dose")
- **hazardous_situation**: How the failure exposes a patient or user to the hazard
- **harm**: The specific patient injury that could result
- **severity_rating** and **severity_scale**: Use the 1-5 severity scale from the reference
- **probability_of_harm_scale**: Use the probability scale (remote/low/moderate/high/very_high)

## Tool Usage

You have access to the following tools — USE THEM rather than guessing:
- **lookup_patient_hazard**: Fuzzy-search the hazard reference table for relevant \
hazards, harms, and severity ratings. Call this for each failure mode.
- **get_severity_for_hazard_category**: Look up all harms for an exact hazard category.
- **lookup_probability_of_harm**: Look up the risk level from P1/P2 values.
- **google_drive_exec**: Search and read files from Google Drive for additional \
reference material. Use this to find relevant documents such as prior pFMEAs, \
regulatory standards, or design specifications. \
Example: entity="files", action="list", params={"q": "name contains 'pFMEA'", "page_size": 5}

Always call at least one hazard lookup tool per process before assigning ratings. \
Use google_drive_exec to search for relevant reference documents when available.

## Coverage

Generate at least one failure item per process. For processes with multiple \
distinct failure modes, generate a separate item for each. \
Low-risk processes should still be included with appropriate low ratings.

For processes which are inspections or tests, a pFMEA may not be required. \
pFMEA does not include procedures which do not change the material, system, or product. \
Risk associated with accepting a bad part due to a test should be part of test method validation, not pFMEA. 
"""
