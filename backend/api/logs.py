from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from backend.models.schemas import StandardResponse, ActivityLogResponse
from backend.api.auth import get_current_user, UserPrincipal
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/api/v1/logs",
    tags=["Activity Logs"],
)


@router.get("", response_model=StandardResponse[List[ActivityLogResponse]])
async def list_logs(current_user: UserPrincipal = Depends(get_current_user)):
    """Retrieves standard audit trails and user access milestones."""
    logger.info("Listing system activity logs", user_id=current_user.id)

    now = datetime.now()
    logs_mock = [
        ActivityLogResponse(
            id="log_5f6g7h8",
            action="API_AUTHENTICATION_JWT",
            ip_address="127.0.0.1",
            payload={"auth_method": "supabase_oauth_google"},
            created_at=now
        ),
        ActivityLogResponse(
            id="log_9k8j7h6",
            action="PROACTIVE_TASK_RESOLVE",
            ip_address="127.0.0.1",
            payload={"plan_id": "plan_cos_01h9a8", "milestone": "Retrieve financial sheets"},
            created_at=now
        )
    ]

    return StandardResponse(
        success=True,
        message="System audit logs retrieved.",
        data=logs_mock
    )
