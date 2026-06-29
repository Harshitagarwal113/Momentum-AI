from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, ScheduleCreate, ScheduleResponse
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/schedules",
    tags=["Schedules"],
)


@router.post("", response_model=StandardResponse[ScheduleResponse], status_code=status.HTTP_201_CREATED)
async def create_schedule(payload: ScheduleCreate, current_user: UserPrincipal = Depends(get_current_user)):
    """Reserves cognitive focus blocks or custom meetings in the schedule."""
    logger.info("Scheduling calendar slot", user_id=current_user.id, title=payload.title)

    now = datetime.now()
    schedule_mock = ScheduleResponse(
        id="sch_2k3j4h5",
        title=payload.title,
        start_time=payload.start_time,
        end_time=payload.end_time,
        description=payload.description,
        is_cognitive_reservation=payload.is_cognitive_reservation,
        created_at=now
    )

    return StandardResponse(
        success=True,
        message="Schedule slot successfully booked.",
        data=schedule_mock
    )


@router.get("", response_model=StandardResponse[List[ScheduleResponse]])
async def list_schedules(current_user: UserPrincipal = Depends(get_current_user)):
    """Retrieves upcoming calendar items and cognitive focus locks."""
    logger.info("Listing schedules for active user", user_id=current_user.id)

    now = datetime.now()
    schedules_mock = [
        ScheduleResponse(
            id="sch_2k3j4h5",
            title="Focus Block: Financial Modelling",
            start_time=now + timedelta(hours=2),
            end_time=now + timedelta(hours=4),
            description="Chief of Staff auto-reserved window to draft formulas.",
            is_cognitive_reservation=True,
            created_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="Schedule timeline retrieved successfully.",
        data=schedules_mock
    )
