from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, MemoryCreate, MemoryResponse
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/memories",
    tags=["AI Memories"],
)


@router.post("", response_model=StandardResponse[MemoryResponse], status_code=status.HTTP_201_CREATED)
async def create_memory(payload: MemoryCreate, current_user: UserPrincipal = Depends(get_current_user)):
    """Stores a cognitive memory node for context caching."""
    logger.info("Persisting AI memory entry", user_id=current_user.id)

    now = datetime.now()
    memory_mock = MemoryResponse(
        id="mem_8h7g2f3",
        content=payload.content,
        metadata=payload.metadata,
        created_at=now
    )

    return StandardResponse(
        success=True,
        message="AI memory node successfully indexed.",
        data=memory_mock
    )


@router.get("", response_model=StandardResponse[List[MemoryResponse]])
async def list_memories(current_user: UserPrincipal = Depends(get_current_user)):
    """Lists current long-term memory indexes."""
    logger.info("Retrieving memory maps", user_id=current_user.id)

    now = datetime.now()
    memories_mock = [
        MemoryResponse(
            id="mem_8h7g2f3",
            content="User prefers high-priority reports finalized at least 2 days before final submission.",
            metadata={"source": "formulation_loop"},
            created_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="Cognitive memory indexes retrieved.",
        data=memories_mock
    )
