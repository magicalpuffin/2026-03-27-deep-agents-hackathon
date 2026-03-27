"""
tools/airbyte_lookup.py — External data lookup via Airbyte-synced Postgres
"""

import os

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

DB_URL = os.getenv("DB_URL", "")

# Table mapping for different source types
SOURCE_TABLES = {
    "historical_pfmea": "historical_pfmea",
    "regulatory": "regulatory_data",
    "material_specs": "material_specifications",
}


@tool
def airbyte_lookup(query: str, source_type: str) -> list[dict]:
    """Look up external data from Airbyte-synced sources.

    Queries external data that has been synced into Postgres via Airbyte.
    Use this to find historical pFMEA data, regulatory requirements, or
    material specifications relevant to a failure mode analysis.

    Args:
        query: Search term or keyword to look up.
               e.g. "solder joint", "IEC 60601", "titanium alloy"
        source_type: Type of external data source to query.
                     One of: "historical_pfmea", "regulatory", "material_specs"

    Returns:
        List of matching records from the external data source.
    """
    table = SOURCE_TABLES.get(source_type)
    if table is None:
        return [{"error": f"Unknown source_type: {source_type}. Use one of: {list(SOURCE_TABLES.keys())}"}]

    if not DB_URL:
        return [{"error": "DB_URL not configured"}]

    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        # Check if table exists first
        cur.execute(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = %s)",
            (table,),
        )
        if not cur.fetchone()["exists"]:
            cur.close()
            conn.close()
            return [{"info": f"Table '{table}' not yet synced. No data available."}]

        # Full-text search across all text columns
        cur.execute(
            f"SELECT * FROM {table} WHERE to_tsvector('english', content) @@ plainto_tsquery('english', %s) LIMIT 10",  # noqa: S608
            (query,),
        )
        results = [dict(row) for row in cur.fetchall()]
        cur.close()
        conn.close()
        return results if results else [{"info": f"No results found for '{query}' in {source_type}"}]
    except Exception as e:
        return [{"error": f"Database query failed: {e}"}]
