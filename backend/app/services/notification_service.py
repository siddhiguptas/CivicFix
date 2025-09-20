"""
Notification service for managing user notifications
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.models.notification import (
    NotificationCreate, NotificationInDB, NotificationResponse, 
    NotificationUpdate, NotificationType, NotificationPriority
)
from app.core.exceptions import NotFoundError
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Notification service class"""
    
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db
    
    async def create_notification(self, notification_data: NotificationCreate, db: AsyncIOMotorDatabase) -> NotificationResponse:
        """Create a new notification"""
        try:
            # Create notification document
            notification_doc = {
                "title": notification_data.title,
                "message": notification_data.message,
                "type": notification_data.type.value,
                "priority": notification_data.priority.value,
                "channels": [channel.value for channel in notification_data.channels],
                "data": notification_data.data or {},
                "user_id": notification_data.user_id,
                "grievance_id": notification_data.grievance_id,
                "is_read": False,
                "created_at": datetime.utcnow(),
                "read_at": None,
                "sent_at": None,
                "failed_channels": []
            }
            
            # Insert notification
            result = await db.notifications.insert_one(notification_doc)
            notification_doc["_id"] = str(result.inserted_id)
            
            # TODO: Send notification through configured channels
            await self._send_notification(notification_doc)
            
            return NotificationResponse(
                id=str(result.inserted_id),
                title=notification_doc["title"],
                message=notification_doc["message"],
                type=notification_doc["type"],
                priority=notification_doc["priority"],
                channels=notification_doc["channels"],
                data=notification_doc["data"],
                user_id=notification_doc["user_id"],
                grievance_id=notification_doc["grievance_id"],
                is_read=notification_doc["is_read"],
                created_at=notification_doc["created_at"],
                read_at=notification_doc["read_at"]
            )
            
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            raise
    
    async def get_user_notifications(
        self, 
        user_id: str, 
        db: AsyncIOMotorDatabase,
        skip: int = 0, 
        limit: int = 20,
        unread_only: bool = False
    ) -> List[NotificationResponse]:
        """Get notifications for a user"""
        try:
            # Build filter query
            filter_query = {"user_id": user_id}
            if unread_only:
                filter_query["is_read"] = False
            
            # Get notifications
            cursor = db.notifications.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
            notifications = await cursor.to_list(length=limit)
            
            # Convert to response format
            notification_responses = []
            for notification in notifications:
                notification_responses.append(NotificationResponse(
                    id=str(notification["_id"]),
                    title=notification["title"],
                    message=notification["message"],
                    type=notification["type"],
                    priority=notification["priority"],
                    channels=notification["channels"],
                    data=notification["data"],
                    user_id=notification["user_id"],
                    grievance_id=notification.get("grievance_id"),
                    is_read=notification["is_read"],
                    created_at=notification["created_at"],
                    read_at=notification.get("read_at")
                ))
            
            return notification_responses
            
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read"""
        try:
            result = await self.db.notifications.update_one(
                {"_id": notification_id, "user_id": user_id},
                {
                    "$set": {
                        "is_read": True,
                        "read_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        try:
            result = await self.db.notifications.update_many(
                {"user_id": user_id, "is_read": False},
                {
                    "$set": {
                        "is_read": True,
                        "read_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count
            
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return 0
    
    async def get_unread_count(self, user_id: str, db: AsyncIOMotorDatabase) -> int:
        """Get count of unread notifications for a user"""
        try:
            count = await db.notifications.count_documents({
                "user_id": user_id,
                "is_read": False
            })
            return count
            
        except Exception as e:
            logger.error(f"Error getting unread count: {e}")
            return 0
    
    async def delete_notification(self, notification_id: str, user_id: str) -> bool:
        """Delete a notification"""
        try:
            result = await self.db.notifications.delete_one({
                "_id": notification_id,
                "user_id": user_id
            })
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            return False
    
    async def create_grievance_notification(
        self,
        user_id: str,
        grievance_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        data: Optional[Dict[str, Any]] = None
    ) -> NotificationResponse:
        """Create a notification related to a grievance"""
        notification_data = NotificationCreate(
            title=title,
            message=message,
            type=notification_type,
            priority=priority,
            channels=[NotificationType.IN_APP],
            data=data or {},
            user_id=user_id,
            grievance_id=grievance_id
        )
        
        return await self.create_notification(notification_data)
    
    async def create_department_assignment_notification(
        self,
        department_name: str,
        grievance_id: str,
        grievance_title: str,
        citizen_name: str,
        db: AsyncIOMotorDatabase
    ) -> bool:
        """Create notification for department assignment"""
        try:
            # Find department head or admin
            department_head = await db.users.find_one({
                "role": "department_head",
                "department": department_name
            })
            
            if not department_head:
                # Fallback to any admin
                department_head = await db.users.find_one({"role": "admin"})
            
            if not department_head:
                logger.warning(f"No department head or admin found for {department_name}")
                return False
            
            # Create notification for department head
            notification_data = {
                "title": "New Grievance Assigned",
                "message": f"Grievance '{grievance_title}' from {citizen_name} has been assigned to {department_name}",
                "type": "assignment",
                "priority": "high",
                "channels": ["in_app"],
                "data": {
                    "grievance_id": grievance_id,
                    "department": department_name,
                    "citizen_name": citizen_name,
                    "grievance_title": grievance_title
                },
                "user_id": str(department_head["_id"]),
                "grievance_id": grievance_id,
                "is_read": False,
                "created_at": datetime.utcnow(),
                "read_at": None,
                "sent_at": None,
                "failed_channels": []
            }
            
            await db.notifications.insert_one(notification_data)
            logger.info(f"Department assignment notification created for {department_name}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating department assignment notification: {e}")
            return False
    
    async def create_citizen_notification(
        self,
        citizen_id: str,
        grievance_id: str,
        notification_type: str,
        title: str,
        message: str,
        db: AsyncIOMotorDatabase
    ) -> bool:
        """Create notification for citizen"""
        try:
            notification_data = {
                "title": title,
                "message": message,
                "type": notification_type,
                "priority": "medium",
                "channels": ["in_app"],
                "data": {
                    "grievance_id": grievance_id
                },
                "user_id": citizen_id,
                "grievance_id": grievance_id,
                "is_read": False,
                "created_at": datetime.utcnow(),
                "read_at": None,
                "sent_at": None,
                "failed_channels": []
            }
            
            await db.notifications.insert_one(notification_data)
            logger.info(f"Citizen notification created for user {citizen_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating citizen notification: {e}")
            return False
    
    async def _send_notification(self, notification_doc: Dict[str, Any]) -> None:
        """Send notification through configured channels"""
        try:
            # TODO: Implement actual notification sending
            # - Email notifications
            # - SMS notifications
            # - Push notifications
            # - WebSocket real-time updates
            
            # For now, just mark as sent
            await self.db.notifications.update_one(
                {"_id": notification_doc["_id"]},
                {"$set": {"sent_at": datetime.utcnow()}}
            )
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            # Mark failed channels
            await self.db.notifications.update_one(
                {"_id": notification_doc["_id"]},
                {"$set": {"failed_channels": notification_doc["channels"]}}
            )
