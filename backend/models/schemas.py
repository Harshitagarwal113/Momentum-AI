from datetime import datetime, date
from typing import Any, Dict, List, Optional, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar('T')


class StandardResponse(BaseModel, Generic[T]):
    """Standard unified response wrapper for all API endpoints."""
    success: bool = Field(..., description="Indicates whether the request was successful")
    message: str = Field(..., description="Developer and client friendly message")
    data: Optional[T] = Field(None, description="The resource payload being returned")
    meta: Optional[Dict[str, Any]] = Field(None, description="Paging or execution metadata")


# ==========================================
-- USER SCHEMAS
# ==========================================
class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=150)
    avatar_url: Optional[str] = None
    timezone: Optional[str] = Field("UTC", max_length=100)


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: str
    is_premium: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- TASK SCHEMAS
# ==========================================
class TaskCreate(BaseModel):
    """Schema model for creating dynamic Momentum tasks."""
    title: str = Field(..., min_length=3, max_length=150, example="Draft Q3 Financial Overview")
    description: Optional[str] = Field(None, max_length=1000)
    deadline: datetime = Field(..., example="2026-07-15T18:00:00Z")
    priority: str = Field("medium", pattern="^(high|medium|low)$")
    goal_id: Optional[str] = None


class TaskUpdate(BaseModel):
    """Schema model for updating dynamic Momentum tasks."""
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    deadline: Optional[datetime] = Field(None)
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    status: Optional[str] = Field(None, pattern="^(pending|in_progress|completed|failed)$")


class TaskResponse(BaseModel):
    """Output schema model representing task status in Momentum AI."""
    id: str = Field(..., example="tsk_8a43fbc102")
    title: str
    description: Optional[str] = None
    deadline: datetime
    priority: str
    status: str
    goal_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- GOAL SCHEMAS
# ==========================================
class GoalCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    target_date: Optional[datetime] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    target_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(in_progress|achieved|abandoned)$")


class GoalResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- HABIT SCHEMAS
# ==========================================
class HabitCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    frequency: str = Field("daily", pattern="^(daily|weekly|custom)$")


class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    frequency: Optional[str] = Field(None, pattern="^(daily|weekly|custom)$")
    streak: Optional[int] = None
    last_completed_at: Optional[datetime] = None


class HabitResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    frequency: str
    streak: int
    last_completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- REFLECTION SCHEMAS
# ==========================================
class ReflectionCreate(BaseModel):
    mood_score: int = Field(..., ge=1, le=10)
    insights: str = Field(..., min_length=1)
    blockers: Optional[str] = None


class ReflectionResponse(BaseModel):
    id: str
    date: date
    mood_score: int
    insights: str
    blockers: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- AI MEMORY SCHEMAS
# ==========================================
class MemoryCreate(BaseModel):
    content: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None


class MemoryResponse(BaseModel):
    id: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- SCHEDULE SCHEMAS
# ==========================================
class ScheduleCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    is_cognitive_reservation: bool = False


class ScheduleResponse(BaseModel):
    id: str
    title: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    is_cognitive_reservation: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- NOTIFICATION SCHEMAS
# ==========================================
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    is_read: bool
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- ACTIVITY LOG SCHEMAS
# ==========================================
class ActivityLogResponse(BaseModel):
    id: str
    action: str
    ip_address: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
-- AGENT COGNITION SCHEMAS
# ==========================================
class AgentChatRequest(BaseModel):
    """Cognitive request payload for delegating plans to the Chief of Staff agent."""
    prompt: str = Field(..., min_length=1, description="Instruction or objective for the Chief of Staff")
    context: Optional[Dict[str, Any]] = Field(None, description="Metadata or conversational memory context")


class ActionItem(BaseModel):
    """Actionable step resolved by the Chief of Staff agent."""
    step: int
    title: str
    description: str
    estimated_duration_minutes: int
    proactive: bool = False


class AgentBriefingResponse(BaseModel):
    """Detailed cognitive execution plan generated by the Chief of Staff agent."""
    plan_id: str
    summary: str
    priority_level: str
    action_items: List[ActionItem]
    proactive_reminders: List[str]
    suggested_deadlines: Dict[str, datetime]
