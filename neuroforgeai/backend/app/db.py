import os
from collections.abc import Generator
from functools import lru_cache

from dotenv import load_dotenv
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine, make_url
from sqlalchemy.exc import ArgumentError, SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

load_dotenv()


def get_database_url() -> str | None:
    return os.getenv("DATABASE_URL")


def is_supported_database_url(url: str) -> bool:
    try:
        parsed = make_url(url)
    except (ArgumentError, TypeError):
        return False
    if parsed.drivername == "postgresql+psycopg":
        return bool(parsed.database)
    return parsed.drivername in {"sqlite", "sqlite+pysqlite"}


def make_engine(url: str) -> Engine:
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, pool_pre_ping=True, connect_args=connect_args)


@lru_cache(maxsize=4)
def get_engine(url: str) -> Engine:
    return make_engine(url)


def get_db() -> Generator[Session, None, None]:
    url = get_database_url()
    if not url:
        raise HTTPException(status_code=503, detail="Database is not configured. Set DATABASE_URL and apply migrations.")
    if not is_supported_database_url(url):
        raise HTTPException(status_code=503, detail="DATABASE_URL is invalid. Use a PostgreSQL psycopg URL with a database name and verify its settings.")
    try:
        engine = get_engine(url)
    except (SQLAlchemyError, ModuleNotFoundError) as exc:
        raise HTTPException(status_code=503, detail="DATABASE_URL could not be initialized. Check its driver and settings.") from exc
    session_factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
