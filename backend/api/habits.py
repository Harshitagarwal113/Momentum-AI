from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, HabitCreate, HabitResponse, HabitUpdate
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/habits",
    tags=["Habits"],
)


@router.post("", response_model=StandardResponse[HabitResponse], status_code=status.HTTP_201_CREATED)
async def create_habit(payload: HabitCreate, current_user: UserPrincipal = Depends(get_current_user)):
    """Creates a regular habit to reinforce routine schedules."""
    logger.info("Creating new habit", user_id=current_user.id, title=payload.title)

    now = datetime.now()
    habit_mock = HabitResponse(
        id="hab_3c45de102a",
        title=payload.title,
        description=payload.description,
        frequency=payload.frequency,
        streak=0,
        last_completed_at=None,
        created_at=now
    )

    return StandardResponse(
        success=True,
        message="Routine habit registered successfully.",
        data=habit_mock
    )


@router.get("", response_model=StandardResponse[List[HabitResponse]])
async def list_habits(current_user: UserPrincipal = Depends(get_current_user)):
    """Lists habits and associated completion streaks."""
    logger.info("Listing habits for user", user_id=current_user.id)

    now = datetime.now()
    habits_mock = [
        HabitResponse(
            id="hab_3c45de102a",
            title="Daily Cognitive Journaling",
            description="Reflect on executive blockers and milestones before 10 PM.",
            frequency="daily",
            streak=12,
            last_completed_at=now,
            created_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="Habits retrieved successfully.",
        data=habits_mock
    )


@router.post("/{habit_id}/complete", response_model=StandardResponse[HabitResponse])
async def complete_habit(habit_id: str, current_user: UserPrincipal = Depends(get_current_user)):
    """Logs completion of a habit, incrementing streak counters."""
    logger.info("Marking habit completed", user_id=current_user.id, habit_id=habit_id)

    now = datetime.now()
    habit_mock = HabitResponse(
        id=habit_id,
        title="Daily Cognitive Journaling",
        description="Reflect on executive blockers.",
        frequency="daily",
        streak=13,
        last_completed_at=now,
        created_at=now
    )

    return StandardResponse(
        success=True,
        message="Habit completion recorded. Streak incremented.",
        data=habit_mock
    )
