"""
Database configuration and table creation
Supports Supabase Postgres (via DATABASE_URL env) or local SQLite fallback.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Read DATABASE_URL from environment (set in Vercel for Supabase Postgres)
_env_db_url = os.environ.get("DATABASE_URL")

if _env_db_url:
    # Convert postgres:// to postgresql+asyncpg:// for SQLAlchemy async
    DATABASE_URL = _env_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_size=5,
        max_overflow=10,
    )
else:
    # Local development fallback (SQLite)
    IS_VERCEL = os.environ.get("VERCEL") == "1"
    DATABASE_URL = "sqlite+aiosqlite:////tmp/agentiq.db" if IS_VERCEL else "sqlite+aiosqlite:///./agentiq.db"
    engine = create_async_engine(DATABASE_URL, echo=False)

async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    """Dependency for getting database session"""
    async with async_session() as session:
        yield session


async def create_tables():
    """Create all database tables"""
    from app.models import document, query_log  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
