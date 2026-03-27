"""
main.py — Entry point for the pFMEA agent

Two ways to run the agent:

  1. Direct Python — runs the pipeline synchronously and prints results:
       python main.py <file>

  2. FastAPI server — starts an HTTP API for uploads, job tracking, and queries:
       python main.py serve
"""

import sys

from dotenv import load_dotenv

load_dotenv()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "serve":
        import uvicorn

        uvicorn.run("src.api:app", host="0.0.0.0", port=8000, reload=True)
    else:
        from src.graph import run_pipeline

        result = run_pipeline(command)

        if result.get("status") == "done":
            print(f"\nSuccess! Procedure ID: {result.get('procedure_id')}")
        else:
            print(f"\nFailed: {result.get('error')}")


if __name__ == "__main__":
    main()
