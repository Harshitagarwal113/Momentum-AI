from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, NotificationResponse
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["Notifications"],
)


@router.get("", response_model=StandardResponse[List[NotificationResponse]])
async def list_notifications(current_user: UserPrincipal = Depends(get_current_user)):
    """Retrieves notifications and alerts produced by the proactive scheduler."""
    logger.info("Listing notifications", user_id=current_user.id)

    now = datetime.now()
    notifications_mock = [
        NotificationResponse(
            id="not_1n2m3b4",
            title="Proactive Audit Deadline Reminder",
            message="Your Q3 audit deadline is in 5 days. Your Chief of Staff suggests completing Step 1 drafting today.",
            is_read=False,
            type="deadline",
            created_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="Active notifications fetched successfully.",
        data=notifications_mock
    )


@router.post("/{notification_id}/read", response_model=StandardResponse[bool])
async def mark_read(notification_id: str, current_user: UserPrincipal = Depends(get_current_user)):
    """Acknowledge or mark notification as read."""
    logger.info("Acknowledging alert notification", user_id=current_user.id, notification_id=notification_id)

    return StandardResponse(
        success=True,
        message="Alert marked as read.",
        data=True
    )
