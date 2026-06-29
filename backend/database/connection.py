import os
from typing import Generator
from supabase import create_client, Client
from pydantic_settings import BaseSettings, SettingsConfigDict
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class DatabaseSettings(BaseSettings):
    """Database configuration variables loaded from environmental variables."""
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""  # PostgreSQL connection string

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = DatabaseSettings()


def get_supabase_client() -> Client:
    """Initializes and returns a Supabase Python client using service role key credentials."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning(
            "Supabase credentials not fully configured. Running in degraded state."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def get_db_connection() -> Generator[None, None, None]:
    """Dependency generator that manages connection pool lifecycles for relational queries."""
    # Since we are using Supabase directly through the API client,
    # we yield active sessions or direct connection pools.
    try:
        logger.info("Initializing database request connection.")
        # Under SQL Alchemy, you would yield db_session here
        yield None
    except Exception as exc:
        logger.error("Database connection exception occurred.", error=str(exc))
        raise
    finally:
        logger.info("Releasing database request connection.")
