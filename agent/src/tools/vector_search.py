"""
tools/vector_search.py — Vector similarity search for pFMEA items
"""

from langchain_core.tools import tool

from src.db import PostgresDB
from src.embeddings import embed_query


@tool
def search_similar_failure_modes(query: str, top_k: int = 5) -> list[dict]:
    """Search for similar past failure modes using vector similarity.

    Use this to find previously documented pFMEA items that are similar
    to a given failure mode description, hazard, or process concern.

    Args:
        query: Description of the failure mode, hazard, or concern to search for.
               e.g. "solder joint cold joint failure", "beam misalignment"
        top_k: Number of similar results to return (default 5, max 10).

    Returns:
        List of similar pFMEA items with their details and similarity scores.
    """
    top_k = min(top_k, 10)
    query_embedding = embed_query(query)
    db = PostgresDB()
    try:
        results = db.vector_search(query_embedding, limit=top_k)
        return results
    finally:
        db.close()
