import logging
import sys
from typing import Any, Dict
import structlog


def setup_logging() -> None:
    """Configures structured JSON logging for production and standard logging for local development.

    Integrates with Google Cloud Logging / standard standard streams.
    """
    shared_processors = [
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.format_exc_info,
        structlog.processors.StackInfoRenderer(),
    ]

    structlog.configure(
        processors=shared_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_list,
            # Output in JSON format for production log collectors (Stackdriver, etc.)
            structlog.processors.JSONRenderer(),
        ],
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

    # Disable default uvicorn access logging duplication
    logging.getLogger("uvicorn.access").handlers = []


def get_logger(name: str) -> Any:
    """Retrieves a configured structured logger.

    Args:
        name: The name of the logger instance.
    """
    return structlog.get_logger(name)
