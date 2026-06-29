from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from backend.models.schemas import StandardResponse, GoalCreate, GoalResponse, GoalUpdate
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/goals",
    tags=["Goals"],
)


@router.post("", response_model=StandardResponse[GoalResponse], status_code=status.HTTP_201_CREATED)
async def create_goal(payload: GoalCreate, current_user: UserPrincipal = Depends(get_current_user)):
    """Formulates a new high-level objective in the platform."""
    logger.info("Creating new goal record", user_id=current_user.id, title=payload.title)

    now = datetime.now()
    goal_mock = GoalResponse(
        id="goal_9b24acdf01",
        title=payload.title,
        description=payload.description,
        target_date=payload.target_date or now,
        status="in_progress",
        created_at=now,
        updated_at=now
    )

    return StandardResponse(
        success=True,
        message="Strategic goal created successfully.",
        data=goal_mock
    )


@router.get("", response_model=StandardResponse[List[GoalResponse]])
async def list_goals(current_user: UserPrincipal = Depends(get_current_user)):
    """Retrieves all active user objectives and goals."""
    logger.info("Listing goals for user", user_id=current_user.id)

    now = datetime.now()
    goals_mock = [
        GoalResponse(
            id="goal_9b24acdf01",
            title="Succeed in Q3 Financial Audit",
            description="Clear audits with zero remediation points and compile stakeholder briefs.",
            target_date=now,
            status="in_progress",
            created_at=now,
            updated_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="Strategic goals retrieved successfully.",
        data=goals_mock
    )


@router.patch("/{goal_id}", response_model=StandardResponse[GoalResponse])
async def update_goal(goal_id: str, payload: GoalUpdate, current_user: UserPrincipal = Depends(get_current_user)):
    """Updates status or descriptions of an objective."""
    logger.info("Updating goal record", user_id=current_user.id, goal_id=goal_id)

    now = datetime.now()
    goal_mock = GoalResponse(
        id=goal_id,
        title=payload.title or "Succeed in Q3 Financial Audit",
        description=payload.description or "Clear audits with zero remediation points.",
        target_date=payload.target_date or now,
        status=payload.status or "in_progress",
        created_at=now,
        updated_at=now
    )

    return StandardResponse(
        success=True,
        message="Goal updated successfully.",
        data=goal_mock
    )
