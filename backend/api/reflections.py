from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, ReflectionCreate, ReflectionResponse
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/reflections",
    tags=["Daily Reflections"],
)


@router.post("", response_model=StandardResponse[ReflectionResponse], status_code=status.HTTP_201_CREATED)
async def create_reflection(payload: ReflectionCreate, current_user: UserPrincipal = Depends(get_current_user)):
    """Logs an end-of-day journal and mental score."""
    logger.info("Recording daily reflection", user_id=current_user.id, mood=payload.mood_score)

    now = datetime.now()
    reflection_mock = ReflectionResponse(
        id="ref_7f1a9b2",
        date=date.today(),
        mood_score=payload.mood_score,
        insights=payload.insights,
        blockers=payload.blockers,
        created_at=now
    )

    return StandardResponse(
        success=True,
        message="Daily reflection recorded. Cognitive insights cached.",
        data=reflection_mock
    )


@router.get("", response_model=StandardResponse[List[ReflectionResponse]])
async def list_reflections(current_user: UserPrincipal = Depends(get_current_user)):
    """Retrieves historic daily journaling logs."""
    logger.info("Listing daily reflections", user_id=current_user.id)

    now = datetime.now()
    reflections_mock = [
        ReflectionResponse(
            id="ref_7f1a9b2",
            date=date.today(),
            mood_score=8,
            insights="Made substantial progress on clean API foundations. Felt focused.",
            blockers="Minor network constraints in Docker setups.",
            created_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="Reflections retrieved successfully.",
        data=reflections_mock
    )
