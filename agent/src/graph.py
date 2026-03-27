"""
graph.py — LangGraph agent

Four nodes wired into a directed graph:
  parse → get_procedures → get_pfmea → write
"""

import json

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph
from src.prompts import EXTRACTION_PROMPT, PFMEA_PROMPT
from src.schemas import PFMEA, AgentState, ManufacturingProcedure
from src.tools.hazard_lookup import (
    get_severity_for_hazard_category,
    lookup_patient_hazard,
)
from src.tools.probability_of_harm import lookup_probability_of_harm
from src.utils import chunk_document

load_dotenv()

# ── LLM setup ─────────────────────────────────────────────────────────────────

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0.2,
    timeout=120,
    max_retries=3,
)

# ── Nodes ─────────────────────────────────────────────────────────────────────


def node_parse(state: AgentState) -> dict:
    """Read the file and store its text in state."""
    file_path = state["file_path"]
    print(f"[1/4] Parsing {file_path}...")

    with open(file_path) as f:
        text_content = f.read()
        print(f"Document length: {len(text_content):,} chars")

    return {"raw_text": text_content, "status": "parsed"}


def node_get_procedures(state: AgentState) -> dict:
    """Call the LLM to pull structured fields out of the raw text."""
    print("[2/4] Extracting procedures from text...")
    raw_text = state.get("raw_text", "")
    chunks = chunk_document(raw_text)
    structured_model = llm.with_structured_output(ManufacturingProcedure)

    results: list[ManufacturingProcedure] = []
    for i, chunk in enumerate(chunks):
        print(f"       Processing chunk {i + 1}/{len(chunks)}...")
        messages = [
            SystemMessage(EXTRACTION_PROMPT),
            HumanMessage(f"Parse this manufacturing procedure section:\n\n{chunk}"),
        ]
        result = structured_model.invoke(messages)
        assert isinstance(result, ManufacturingProcedure)
        results.append(result)

    all_items = []
    for r in results:
        all_items.extend(r.process_list)
    manufacturing_procedure = ManufacturingProcedure(
        title=results[0].title, process_list=all_items
    )

    return {"manufacturing_procedure": manufacturing_procedure}


def node_get_pfmea(state: AgentState) -> dict:
    """For each process step, call the LLM to generate potential failure modes and risk assessments."""
    print("[3/4] Generating pFMEA...")

    tools = [
        lookup_patient_hazard,
        get_severity_for_hazard_category,
        lookup_probability_of_harm,
    ]

    agent = create_agent(
        model=llm,
        tools=tools,
        response_format=PFMEA,
    )

    procedure = state.get("manufacturing_procedure")
    assert procedure is not None
    procedure_text = procedure.model_dump_json(indent=2)

    result = agent.invoke(
        {
            "messages": [
                SystemMessage(PFMEA_PROMPT),
                HumanMessage(
                    f"Generate a pFMEA for this manufacturing procedure:\n\n"
                    f"{procedure_text}"
                ),
            ]
        }
    )

    return {"pfmea": result["structured_response"]}


def node_write(state: AgentState) -> dict:
    """Write the pFMEA output to a JSON file."""
    print("[4/4] Writing to platform...")
    try:
        manufacturing_procedure = state.get("manufacturing_procedure")
        pfmea = state.get("pfmea")
        assert manufacturing_procedure is not None
        assert pfmea is not None
        output = {
            "manufacturing_procedure": manufacturing_procedure.model_dump(),
            "pfmea": pfmea.model_dump(),
        }
        with open("pfmea_output.json", "w") as f:
            json.dump(output, f, indent=2)
        return {"status": "done"}
    except Exception as e:
        print(f"       Write failed: {e}")
        return {"error": str(e), "status": "failed"}


# ── Build the graph ───────────────────────────────────────────────────────────


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("node_parse", node_parse)
    graph.add_node("node_get_procedures", node_get_procedures)
    graph.add_node("node_get_pfmea", node_get_pfmea)
    graph.add_node("node_write", node_write)

    graph.set_entry_point("node_parse")
    graph.add_edge("node_parse", "node_get_procedures")
    graph.add_edge("node_get_procedures", "node_get_pfmea")
    graph.add_edge("node_get_pfmea", "node_write")

    return graph.compile()
