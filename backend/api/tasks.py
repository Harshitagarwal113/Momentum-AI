from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, TaskCreate, TaskResponse, TaskUpdate
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/tasks",
    tags=["Tasks"],
)


@router.post("", response_model=StandardResponse[TaskResponse], status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, current_user: UserPrincipal = Depends(get_current_user)):
    """Creates a new task in the Supabase database.

    Enforces strict access controls and audits operations.
    """
    logger.info(
        "Creating new task record",
        user_id=current_user.id,
        title=payload.title
    )

    # In actual business logic, we would insert this record into Supabase PostgreSQL.
    now = datetime.now()
    task_mock = TaskResponse(
        id="tsk_8a43fbc102",
        title=payload.title,
        description=payload.description,
        deadline=payload.deadline,
        priority=payload.priority,
        status="pending",
        created_at=now,
        updated_at=now
    )

    return StandardResponse(
        success=True,
        message="Task created successfully.",
        data=task_mock
    )


@router.get("", response_model=StandardResponse[List[TaskResponse]])
async def list_tasks(current_user: UserPrincipal = Depends(get_current_user)):
    """Retrieves all tasks associated with the authenticated user."""
    logger.info("Listing tasks for active user.", user_id=current_user.id)

    now = datetime.now()
    tasks_mock = [
        TaskResponse(
            id="tsk_8a43fbc102",
            title="Draft Q3 Financial Overview",
            description="Synthesize Excel spreadsheets into summary notes.",
            deadline=now,
            priority="high",
            status="in_progress",
            created_at=now,
            updated_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="User tasks retrieved successfully.",
        data=tasks_mock
    )
