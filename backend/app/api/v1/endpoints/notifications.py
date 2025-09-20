"""
Notification endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, List, Optional
from app.models.user import UserResponse
from app.models.notification import (
    NotificationResponse, NotificationUpdate, NotificationCreate,
    NotificationType, NotificationPriority
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.notification_service import NotificationService
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
notification_service = NotificationService()


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False)
):
    """Get user's notifications"""
    try:
        notifications = await notification_service.get_user_notifications(
            user_id=current_user.id,
            db=db,
            skip=skip,
            limit=limit,
            unread_only=unread_only
        )
        return notifications
        
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting notifications"
        )


@router.get("/unread-count")
async def get_unread_count(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Get count of unread notifications"""
    try:
        count = await notification_service.get_unread_count(current_user.id, db)
        return {"unread_count": count}
        
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting unread count"
        )


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """Mark a notification as read"""
    try:
        success = await notification_service.mark_as_read(notification_id, current_user.id)
        
        if success:
            return {"message": "Notification marked as read"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error marking notification as read"
        )


@router.put("/mark-all-read")
async def mark_all_notifications_read(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """Mark all notifications as read"""
    try:
        count = await notification_service.mark_all_as_read(current_user.id)
        return {"message": f"Marked {count} notifications as read"}
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error marking all notifications as read"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """Delete a notification"""
    try:
        success = await notification_service.delete_notification(notification_id, current_user.id)
        
        if success:
            return {"message": "Notification deleted"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting notification"
        )


@router.post("/test")
async def create_test_notification(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """Create a test notification (for development)"""
    try:
        notification_data = NotificationCreate(
            title="Test Notification",
            message="This is a test notification to verify the system is working.",
            type=NotificationType.SYSTEM_ANNOUNCEMENT,
            priority=NotificationPriority.MEDIUM,
            channels=[NotificationType.IN_APP],
            data={"test": True},
            user_id=current_user.id
        )
        
        notification = await notification_service.create_notification(notification_data)
        return notification
        
    except Exception as e:
        logger.error(f"Error creating test notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating test notification"
        )
