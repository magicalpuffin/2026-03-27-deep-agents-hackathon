"""
graph.py — LangGraph agent

Four nodes wired into a directed graph:
  parse → get_procedures → get_pfmea → write_to_db
"""

from pathlib import Path

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

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
    """Read the file and store its text in state. Supports .docx, .md, .txt, and .pdf."""
    file_path = state["file_path"]
    print(f"[1/4] Parsing {file_path}...")

    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    suffix = path.suffix.lower()
    if suffix == ".docx":
        import docx

        doc = docx.Document(str(path))
        text_content = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
    elif suffix == ".pdf":
        import fitz  # PyMuPDF

        pdf = fitz.open(str(path))
        text_content = "\n\n".join(page.get_text() for page in pdf)
        pdf.close()
    else:
        text_content = path.read_text()

    if not text_content.strip():
        raise ValueError(f"Parsed file is empty: {file_path}")

    print(f"Document length: {len(text_content):,} chars")
    print(f"First 200 chars: {text_content[:200]}")
    return {"raw_text": text_content, "status": "parsed"}


def node_get_procedures(state: AgentState) -> dict:
    """Call the LLM to pull structured fields out of the raw text."""
    print("[2/4] Extracting procedures from text...")
    raw_text = state.get("raw_text", "")
    chunks = chunk_document(raw_text)
    structured_model = llm.with_structured_output(ManufacturingProcedure)

    results: list[ManufacturingProcedure] = []
    for i, chunk in enumerate(chunks):
        print(f"       Processing chunk {i + 1}/{len(chunks)} ({len(chunk)} chars)...")
        messages = [
            SystemMessage(EXTRACTION_PROMPT),
            HumanMessage(f"Parse this manufacturing procedure section:\n\n{chunk}"),
        ]
        result = structured_model.invoke(messages)
        assert isinstance(result, ManufacturingProcedure)
        print(f"       Chunk {i + 1} -> title='{result.title}', {len(result.process_list)} processes")
        results.append(result)

    all_items = []
    for r in results:
        all_items.extend(r.process_list)
    manufacturing_procedure = ManufacturingProcedure(
        title=results[0].title, process_list=all_items
    )
    print(f"       Total: {len(all_items)} processes extracted")

    return {"manufacturing_procedure": manufacturing_procedure}


def node_get_pfmea(state: AgentState) -> dict:
    """For each process step, call the LLM to generate potential failure modes and risk assessments."""
    print("[3/4] Generating pFMEA...")

    tools = [
        lookup_patient_hazard,
        get_severity_for_hazard_category,
        lookup_probability_of_harm,
    ]

    # Optionally add vector search and airbyte tools if available
    try:
        from src.tools.vector_search import search_similar_failure_modes

        tools.append(search_similar_failure_modes)
    except Exception:
        pass

    try:
        from src.tools.airbyte_lookup import airbyte_lookup, google_drive_exec

        tools.append(airbyte_lookup)
        tools.append(google_drive_exec)
    except Exception:
        pass

    agent = create_react_agent(
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


def node_write_to_db(state: AgentState) -> dict:
    """Write the pFMEA output to PostgreSQL."""
    print("[4/4] Writing to PostgreSQL...")
    try:
        from src.database import get_session
        from src.embeddings import embed_pfmea_item
        from src import repository

        manufacturing_procedure = state.get("manufacturing_procedure")
        pfmea = state.get("pfmea")
        assert manufacturing_procedure is not None
        assert pfmea is not None

        with get_session() as session:
            # Create procedure record
            procedure_id = repository.create_procedure(
                session,
                title=manufacturing_procedure.title,
                file_path=state.get("file_path", ""),
            )

            # Create process records
            process_ids: dict[str, str] = {}
            for process in manufacturing_procedure.process_list:
                process_id = repository.create_process(
                    session,
                    procedure_id=procedure_id,
                    name=process.name,
                    description=process.description,
                    process_type=process.process_type.value,
                )
                process_ids[process.name] = process_id

            # Create pFMEA item records
            for item in pfmea.process_failure_items:
                record = item.to_db_record()
                process_key = process_ids.get(item.process_name, item.process_name)

                # Generate embedding
                try:
                    embedding = embed_pfmea_item(
                        summary=item.summary,
                        hazard=item.hazard,
                        mitigation=item.potential_cause_of_failure,
                    )
                except Exception:
                    embedding = None

                repository.create_pfmea_item(
                    session,
                    procedure_id=procedure_id,
                    process_key=process_key,
                    record=record,
                    embedding=embedding,
                )

        print(f"       Written procedure {procedure_id} to PostgreSQL")
        return {"procedure_id": procedure_id, "status": "done"}
    except Exception as e:
        print(f"       Write failed: {e}")
        return {"error": str(e), "status": "failed"}


# ── Build the graph ───────────────────────────────────────────────────────────


def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("node_parse", node_parse)
    graph.add_node("node_get_procedures", node_get_procedures)
    graph.add_node("node_get_pfmea", node_get_pfmea)
    graph.add_node("node_write_to_db", node_write_to_db)

    graph.set_entry_point("node_parse")
    graph.add_edge("node_parse", "node_get_procedures")
    graph.add_edge("node_get_procedures", "node_get_pfmea")
    graph.add_edge("node_get_pfmea", "node_write_to_db")

    return graph.compile()


# ── Public API ────────────────────────────────────────────────────────────────


def run_pipeline(file_path: str) -> AgentState:
    """Run the full pFMEA agent pipeline on a file.

    This is the primary Python entry point for running the agent directly.
    It builds the graph, invokes it synchronously, and returns the final state.

    Args:
        file_path: Path to a manufacturing procedure file (.docx, .md, .txt).

    Returns:
        The final agent state dict containing procedure_id, status, and any error.
    """
    graph = build_graph()
    return graph.invoke({"file_path": file_path})
