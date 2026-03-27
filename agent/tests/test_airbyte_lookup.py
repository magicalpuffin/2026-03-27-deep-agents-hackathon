"""
Tests for the Airbyte Google Drive connector.

Runs a live connection check and a files.list call to verify
the connector can reach Google Drive via Airbyte credentials.
"""

import asyncio
import os

import pytest
from dotenv import load_dotenv

load_dotenv()

# Skip the entire module if credentials aren't configured
pytestmark = pytest.mark.skipif(
    not os.getenv("airbyte_client_id") or not os.getenv("airbyte_client_secret"),
    reason="Airbyte credentials not set (airbyte_client_id / airbyte_client_secret)",
)


@pytest.fixture(scope="module")
def connector():
    from src.tools.airbyte_lookup import connector

    return connector


class TestGoogleDriveConnection:
    def test_connection(self, connector):
        """Verify the connector can authenticate and reach Google Drive."""
        result = asyncio.get_event_loop().run_until_complete(
            connector.execute("files", "list", {"page_size": 1})
        )
        print(f"Connection test result: {result}")
        assert result is not None
        assert hasattr(result, "data")

    def test_list_files(self, connector):
        """Verify we can list files from Google Drive."""
        result = asyncio.get_event_loop().run_until_complete(
            connector.execute("files", "list", {"page_size": 5})
        )
        print(f"Files list result: {result}")
        # Should return a result object (even if no files, it shouldn't error)
        assert result is not None
