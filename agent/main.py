"""
main.py — Entry point for the pFMEA agent

Usage:
    python main.py <file>       Run agent pipeline on a file
    python main.py serve        Start FastAPI server
"""

import sys

from dotenv import load_dotenv

load_dotenv()


def run_pipeline(file_path: str):
    """Run the LangGraph agent pipeline on a manufacturing procedure file."""
    from src.graph import build_graph

    graph = build_graph()
    result = graph.invoke({"file_path": file_path})

    if result.get("status") == "done":
        print(f"\nSuccess! Procedure ID: {result.get('procedure_id')}")
    else:
        print(f"\nFailed: {result.get('error')}")

    return result


def run_server():
    """Start the FastAPI server."""
    import uvicorn

    uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "serve":
        run_server()
    else:
        run_pipeline(command)


if __name__ == "__main__":
    main()
