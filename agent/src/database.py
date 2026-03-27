"""
database.py — SQLAlchemy engine and session factory.
"""

import os
from contextlib import contextmanager

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

load_dotenv()

_raw_url = os.getenv("DB_URL", "")

# Ensure the URL uses the sqlalchemy-compatible scheme
if _raw_url.startswith("postgresql://"):
    DB_URL = _raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
elif _raw_url.startswith("postgres://"):
    DB_URL = _raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
else:
    DB_URL = _raw_url

engine = create_engine(DB_URL, pool_size=5, max_overflow=10)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


@contextmanager
def get_session():
    """Yield a SQLAlchemy session; commit on success, rollback on error."""
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
