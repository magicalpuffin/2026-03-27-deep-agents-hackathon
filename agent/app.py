"""
app.py — FastAPI entry point

Run with:
    uvicorn app:app --port 8000 --reload
    # or
    python app.py
"""

from dotenv import load_dotenv

load_dotenv()

from src.api import app  # noqa: E402, F401

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
