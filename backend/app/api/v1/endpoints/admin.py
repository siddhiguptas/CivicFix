"""
Admin endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, List, Optional
from bson import ObjectId
from app.models.user import UserResponse, UserRole
from app.models.grievance import GrievanceResponse, GrievanceStatus, GrievancePriority, GrievanceCategory
from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def require_admin_role(current_user: Annotated[UserResponse, Depends(get_current_user)]):
    """Require admin role for access"""
    if current_user.role not in [UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user


@router.get("/grievances", response_model=List[GrievanceResponse])
async def get_all_grievances(
    current_user: Annotated[UserResponse, Depends(require_admin_role)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    status_filter: Optional[GrievanceStatus] = Query(None),
    category_filter: Optional[GrievanceCategory] = Query(None),
    priority_filter: Optional[GrievancePriority] = Query(None),
    department_filter: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all grievances with filters"""
    try:
        # Build filter query
        filter_query = {}
        
        if status_filter:
            filter_query["status"] = status_filter.value
        if category_filter:
            filter_query["category"] = category_filter.value
        if priority_filter:
            filter_query["priority"] = priority_filter.value
        if department_filter:
            filter_query["assigned_department"] = department_filter
        
        # Get grievances
        cursor = db.grievances.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        grievances = await cursor.to_list(length=limit)
        
        # Get user names for each grievance
        grievance_responses = []
        for grievance in grievances:
            # Get citizen name
            citizen = await db.users.find_one({"_id": ObjectId(grievance["citizen_id"])})
            citizen_name = citizen["full_name"] if citizen else "Unknown"
            
            grievance_responses.append(GrievanceResponse(
                id=str(grievance["_id"]),
                title=grievance["title"],
                description=grievance["description"],
                category=grievance["category"],
                priority=grievance["priority"],
                location=grievance["location"],
                images=grievance["images"],
                citizen_id=grievance["citizen_id"],
                citizen_name=citizen_name,
                status=grievance["status"],
                assigned_department=grievance["assigned_department"],
                assigned_to=grievance["assigned_to"],
                created_at=grievance["created_at"],
                updated_at=grievance["updated_at"],
                resolved_at=grievance["resolved_at"],
                ai_analysis=grievance["ai_analysis"],
                comments=grievance["comments"],
                resolution_notes=grievance["resolution_notes"],
                estimated_resolution_date=grievance["estimated_resolution_date"],
                citizen_satisfaction=grievance["citizen_satisfaction"],
                citizen_feedback=grievance["citizen_feedback"]
            ))
        
        return grievance_responses
        
    except Exception as e:
        logger.error(f"Error getting all grievances: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting grievances"
        )


@router.put("/grievances/{grievance_id}/assign")
async def assign_grievance(
    grievance_id: str,
    department: str,
    assigned_to: Optional[str] = None,
    current_user: Annotated[UserResponse, Depends(require_admin_role)] = None,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)] = None
):
    """Assign a grievance to a department"""
    try:
        # Validate ObjectId format
        try:
            object_id = ObjectId(grievance_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid grievance ID format"
            )
        
        # Check if grievance exists
        grievance = await db.grievances.find_one({"_id": object_id})
        if not grievance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grievance not found"
            )
        
        # Update grievance
        update_data = {
            "assigned_department": department,
            "assigned_to": assigned_to,
            "status": "in_progress",
            "updated_at": datetime.utcnow()
        }
        
        await db.grievances.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        
        # Create notification for department about assignment
        try:
            from app.services.notification_service import NotificationService
            notification_service = NotificationService()
            
            # Get citizen name
            citizen = await db.users.find_one({"_id": ObjectId(grievance["citizen_id"])})
            citizen_name = citizen["full_name"] if citizen else "Unknown"
            
            # Create assignment notification for department
            await notification_service.create_department_assignment_notification(
                department_name=department,
                grievance_id=grievance_id,
                grievance_title=grievance["title"],
                citizen_name=citizen_name,
                db=db
            )
            
            # Create notification for citizen about assignment
            await notification_service.create_citizen_notification(
                citizen_id=str(grievance["citizen_id"]),
                grievance_id=grievance_id,
                notification_type="assignment",
                title="Grievance Assigned",
                message=f"Your grievance '{grievance['title']}' has been assigned to {department}",
                db=db
            )
            
            logger.info(f"Assignment notifications sent for grievance {grievance_id}")
        except Exception as e:
            logger.error(f"Error creating assignment notifications: {e}")
        
        return {"message": "Grievance assigned successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning grievance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error assigning grievance"
        )


@router.put("/grievances/{grievance_id}/status")
async def update_grievance_status(
    grievance_id: str,
    request: dict,
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)] = None
):
    """Update grievance status"""
    try:
        # Check permissions
        if current_user.role not in ["admin", "department_head"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins and department heads can update grievance status"
            )
        
        # Extract data from request
        status_value = request.get("status")
        resolution_notes = request.get("resolution_notes")
        
        if not status_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status is required"
            )
        
        # Validate status
        valid_statuses = ["pending", "in_progress", "resolved", "rejected"]
        if status_value not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Check if grievance exists
        grievance = await db.grievances.find_one({"_id": ObjectId(grievance_id)})
        if not grievance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grievance not found"
            )
        
        # Check if department head can update this grievance
        if current_user.role == "department_head":
            if grievance.get("assigned_department") != current_user.department:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only update grievances assigned to your department"
                )
        
        # Update grievance
        update_data = {
            "status": status_value,
            "updated_at": datetime.utcnow()
        }
        
        if resolution_notes:
            update_data["resolution_notes"] = resolution_notes
        
        if status_value == "resolved":
            update_data["resolved_at"] = datetime.utcnow()
        
        await db.grievances.update_one(
            {"_id": ObjectId(grievance_id)},
            {"$set": update_data}
        )
        
        # Create notification for citizen about status update
        try:
            from app.services.notification_service import NotificationService
            notification_service = NotificationService()
            
            # Get citizen name
            citizen = await db.users.find_one({"_id": ObjectId(grievance["citizen_id"])})
            citizen_name = citizen["full_name"] if citizen else "Unknown"
            
            # Create status update notification
            await notification_service.create_citizen_notification(
                citizen_id=str(grievance["citizen_id"]),
                grievance_id=grievance_id,
                notification_type="grievance_updated",
                title="Grievance Status Updated",
                message=f"Your grievance '{grievance['title']}' status has been updated to {status_value}",
                db=db
            )
            
            logger.info(f"Status update notification sent for grievance {grievance_id}")
        except Exception as e:
            logger.error(f"Error creating status update notification: {e}")
        
        return {"message": "Grievance status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating grievance status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating grievance status"
        )


@router.get("/stats/overview")
async def get_admin_stats(
    current_user: Annotated[UserResponse, Depends(require_admin_role)] = None,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)] = None
):
    """Get admin statistics"""
    try:
        # Get total counts
        total_grievances = await db.grievances.count_documents({})
        pending_grievances = await db.grievances.count_documents({"status": "pending"})
        in_progress_grievances = await db.grievances.count_documents({"status": "in_progress"})
        resolved_grievances = await db.grievances.count_documents({"status": "resolved"})
        rejected_grievances = await db.grievances.count_documents({"status": "rejected"})
        
        # Get counts by category
        category_pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_cursor = db.grievances.aggregate(category_pipeline)
        category_results = await category_cursor.to_list(length=None)
        by_category = {result["_id"]: result["count"] for result in category_results}
        
        # Get counts by priority
        priority_pipeline = [
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
        ]
        priority_cursor = db.grievances.aggregate(priority_pipeline)
        priority_results = await priority_cursor.to_list(length=None)
        by_priority = {result["_id"]: result["count"] for result in priority_results}
        
        # Get counts by department
        department_pipeline = [
            {"$match": {"assigned_department": {"$ne": None}}},
            {"$group": {"_id": "$assigned_department", "count": {"$sum": 1}}}
        ]
        department_cursor = db.grievances.aggregate(department_pipeline)
        department_results = await department_cursor.to_list(length=None)
        by_department = {result["_id"]: result["count"] for result in department_results}
        
        # Get recent grievances (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_grievances = await db.grievances.count_documents({
            "created_at": {"$gte": week_ago}
        })
        
        # Calculate resolution rate
        resolution_rate = (resolved_grievances / total_grievances * 100) if total_grievances > 0 else 0
        
        return {
            "total_grievances": total_grievances,
            "pending_grievances": pending_grievances,
            "in_progress_grievances": in_progress_grievances,
            "resolved_grievances": resolved_grievances,
            "rejected_grievances": rejected_grievances,
            "by_category": by_category,
            "by_priority": by_priority,
            "by_department": by_department,
            "recent_grievances": recent_grievances,
            "resolution_rate": round(resolution_rate, 2)
        }
        
    except Exception as e:
        logger.error(f"Error getting admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting admin statistics"
        )


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: Annotated[UserResponse, Depends(require_admin_role)] = None,
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all users"""
    try:
        cursor = db.users.find({}).sort("created_at", -1).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        
        user_responses = []
        for user in users:
            user_responses.append(UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                full_name=user["full_name"],
                phone=user.get("phone"),
                role=user["role"],
                status=user["status"],
                created_at=user["created_at"],
                updated_at=user["updated_at"],
                last_login=user.get("last_login"),
                is_verified=user.get("is_verified", False),
                profile_image=user.get("profile_image")
            ))
        
        return user_responses
        
    except Exception as e:
        logger.error(f"Error getting all users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting users"
        )
