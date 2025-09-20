"""
Notification models and schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId


class NotificationType(str, Enum):
    """Notification types"""
    GRIEVANCE_CREATED = "grievance_created"
    GRIEVANCE_ASSIGNED = "grievance_assigned"
    GRIEVANCE_STATUS_UPDATED = "grievance_status_updated"
    GRIEVANCE_RESOLVED = "grievance_resolved"
    GRIEVANCE_COMMENT = "grievance_comment"
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    REMINDER = "reminder"


class NotificationPriority(str, Enum):
    """Notification priority"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationChannel(str, Enum):
    """Notification channels"""
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class NotificationBase(BaseModel):
    """Base notification model"""
    title: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10, max_length=1000)
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    channels: list[NotificationChannel] = [NotificationChannel.IN_APP]
    data: Optional[Dict[str, Any]] = None  # Additional data for the notification


class NotificationCreate(NotificationBase):
    """Notification creation model"""
    user_id: str
    grievance_id: Optional[str] = None


class NotificationInDB(NotificationBase):
    """Notification model in database"""
    id: str = Field(alias="_id")
    user_id: str
    grievance_id: Optional[str] = None
    is_read: bool = False
    created_at: datetime
    read_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    failed_channels: list[NotificationChannel] = []
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class NotificationResponse(NotificationBase):
    """Notification response model"""
    id: str
    user_id: str
    grievance_id: Optional[str] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationUpdate(BaseModel):
    """Notification update model"""
    is_read: Optional[bool] = None


class NotificationStats(BaseModel):
    """Notification statistics model"""
    total: int
    unread: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]
    delivery_rate: float
