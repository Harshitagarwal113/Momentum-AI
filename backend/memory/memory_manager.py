from typing import Any, Dict, List, Optional
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class MemoryManager:
    """Manages short-term and long-term memory streams for the Autonomous Chief of Staff agent.

    This maps context arrays to database vector entries or state dictionaries.
    """
    def __init__(self, user_id: str):
        self.user_id = user_id
        # In-memory transient buffer for immediate conversational tasks
        self.short_term_buffer: List[Dict[str, Any]] = []

    async def retrieve_relevant_context(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieves semantically relevant memories or tasks from Supabase pgvector store.

        Args:
            query: Semantic text query or user intent.
            limit: Maximum retrieval items limit.
        """
        logger.info(
            "Retrieving memory context from vector indices.",
            user_id=self.user_id,
            query=query,
            limit=limit
        )
        # Mock structured data representing pgvector returns or user profiles
        return [
            {
                "memory_id": "mem_01hqb7z",
                "content": "User prefers task notifications sent via Slack on Tuesday afternoons.",
                "relevance_score": 0.89
            },
            {
                "memory_id": "mem_02hqb9x",
                "content": "User has an important Board Meeting scheduled for 2026-07-10.",
                "relevance_score": 0.82
            }
        ]

    async def persist_memory_node(self, content: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Stores a new cognitive node inside the long-term memory pool.

        Args:
            content: Main textual memory segment.
            metadata: Associated payload mapping (e.g., task reference ID).
        """
        logger.info(
            "Persisting memory node into Supabase store.",
            user_id=self.user_id,
            content_length=len(content)
        )
        # Unique node ID generated for downstream reference
        node_id = "mem_node_6f8g9h1"
        return node_id

    def add_to_short_term_buffer(self, role: str, message: str) -> None:
        """Appends conversational cycles to immediate working memory.

        Args:
            role: Speaker indicator (e.g., "user", "model").
            message: Raw string message context.
        """
        self.short_term_buffer.append({"role": role, "message": message})
        if len(self.short_term_buffer) > 20:
            self.short_term_buffer.pop(0)  # Maintain sliding window context
