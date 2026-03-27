"""
embeddings.py — OpenAI embedding utilities for pFMEA items
"""

from langchain_openai import OpenAIEmbeddings

_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")


def embed_pfmea_item(summary: str, hazard: str, mitigation: str) -> list[float]:
    """Embed a pFMEA item by concatenating key fields.

    Args:
        summary: Failure mode summary.
        hazard: Hazard category.
        mitigation: Mitigation or potential cause description.

    Returns:
        1536-dimensional embedding vector.
    """
    text = f"Summary: {summary}\nHazard: {hazard}\nMitigation: {mitigation}"
    return _embeddings.embed_query(text)


def embed_query(query: str) -> list[float]:
    """Embed a search query.

    Args:
        query: Search query text.

    Returns:
        1536-dimensional embedding vector.
    """
    return _embeddings.embed_query(query)
