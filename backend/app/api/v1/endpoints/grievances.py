"""
Grievance endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Annotated, List, Optional
from app.models.user import UserResponse
from app.models.grievance import (
    GrievanceCreate, GrievanceResponse, GrievanceUpdateRequest, 
    GrievanceStats, GrievanceStatus, GrievancePriority, GrievanceCategory
)
from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_database
from app.services.auto_assignment_service import auto_assignment_service
from app.services.notification_service import NotificationService
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
async def create_grievance(
    grievance_data: GrievanceCreate,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Create a new grievance"""
    try:
        # Create grievance document
        grievance_doc = {
            "title": grievance_data.title,
            "description": grievance_data.description,
            "category": grievance_data.category.value,
            "priority": grievance_data.priority.value,
            "location": grievance_data.location.dict(),
            "images": [img.dict() for img in grievance_data.images],
            "citizen_id": current_user.id,
            "status": "pending",
            "assigned_department": None,
            "assigned_to": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "resolved_at": None,
            "ai_analysis": None,
            "comments": [],
            "resolution_notes": None,
            "estimated_resolution_date": None,
            "citizen_satisfaction": None,
            "citizen_feedback": None
        }
        
        # Insert grievance
        result = await db.grievances.insert_one(grievance_doc)
        grievance_id = str(result.inserted_id)
        grievance_doc["_id"] = grievance_id
        
        # Auto-assign grievance based on AI analysis
        try:
            assignment_result = await auto_assignment_service.analyze_and_assign_grievance(
                grievance_id=grievance_id,
                images=grievance_data.images,
                title=grievance_data.title,
                description=grievance_data.description,
                citizen_name=current_user.full_name,
                db=db
            )
            
            if assignment_result["success"]:
                # Update grievance with assignment results
                await db.grievances.update_one(
                    {"_id": ObjectId(grievance_id)},
                    {"$set": {
                        "assigned_department": assignment_result["assigned_department"],
                        "ai_analysis": assignment_result["ai_analysis"],
                        "updated_at": datetime.utcnow()
                    }}
                )
                logger.info(f"Grievance {grievance_id} auto-assigned to {assignment_result['assigned_department']}")
            else:
                logger.warning(f"Auto-assignment failed for grievance {grievance_id}: {assignment_result['message']}")
                
        except Exception as e:
            logger.error(f"Error in auto-assignment for grievance {grievance_id}: {e}")
        
        # Create notification for citizen
        try:
            notification_service = NotificationService()
            await notification_service.create_citizen_notification(
                citizen_id=str(current_user.id),
                grievance_id=grievance_id,
                notification_type="grievance_created",
                title="Grievance Submitted Successfully",
                message=f"Your grievance '{grievance_data.title}' has been submitted and is being processed.",
                db=db
            )
        except Exception as e:
            logger.error(f"Error creating citizen notification: {e}")
        
        # Get citizen name
        citizen_name = current_user.full_name
        
        # Return grievance response
        return GrievanceResponse(
            id=str(result.inserted_id),
            title=grievance_doc["title"],
            description=grievance_doc["description"],
            category=grievance_doc["category"],
            priority=grievance_doc["priority"],
            location=grievance_doc["location"],
            images=grievance_doc["images"],
            citizen_id=grievance_doc["citizen_id"],
            citizen_name=citizen_name,
            status=grievance_doc["status"],
            assigned_department=grievance_doc["assigned_department"],
            assigned_to=grievance_doc["assigned_to"],
            created_at=grievance_doc["created_at"],
            updated_at=grievance_doc["updated_at"],
            resolved_at=grievance_doc["resolved_at"],
            ai_analysis=grievance_doc["ai_analysis"],
            comments=grievance_doc["comments"],
            resolution_notes=grievance_doc["resolution_notes"],
            estimated_resolution_date=grievance_doc["estimated_resolution_date"],
            citizen_satisfaction=grievance_doc["citizen_satisfaction"],
            citizen_feedback=grievance_doc["citizen_feedback"]
        )
        
    except Exception as e:
        logger.error(f"Error creating grievance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating grievance"
        )


@router.get("/", response_model=List[GrievanceResponse])
async def get_grievances(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    status_filter: Optional[GrievanceStatus] = Query(None),
    category_filter: Optional[GrievanceCategory] = Query(None),
    priority_filter: Optional[GrievancePriority] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    """Get grievances with optional filters"""
    try:
        logger.info(f"Getting grievances for user: {current_user.email} (ID: {current_user.id})")
        
        # Build filter query
        filter_query = {"citizen_id": current_user.id}
        logger.info(f"Filter query: {filter_query}")
        
        if status_filter:
            filter_query["status"] = status_filter.value
        if category_filter:
            filter_query["category"] = category_filter.value
        if priority_filter:
            filter_query["priority"] = priority_filter.value
        
        # Get grievances
        cursor = db.grievances.find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        grievances = await cursor.to_list(length=limit)
        logger.info(f"Found {len(grievances)} grievances for user {current_user.email}")
        
        # Convert to response format
        grievance_responses = []
        for grievance in grievances:
            try:
                grievance_response = GrievanceResponse(
                    id=str(grievance["_id"]),
                    title=grievance["title"],
                    description=grievance["description"],
                    category=grievance["category"],
                    priority=grievance["priority"],
                    location=grievance["location"],
                    images=grievance["images"],
                    citizen_id=grievance["citizen_id"],
                    citizen_name=current_user.full_name,
                    status=grievance["status"],
                    assigned_department=grievance.get("assigned_department"),
                    assigned_to=grievance.get("assigned_to"),
                    created_at=grievance["created_at"],
                    updated_at=grievance["updated_at"],
                    resolved_at=grievance.get("resolved_at"),
                    ai_analysis=grievance.get("ai_analysis"),
                    comments=grievance.get("comments", []),
                    resolution_notes=grievance.get("resolution_notes"),
                    estimated_resolution_date=grievance.get("estimated_resolution_date"),
                    citizen_satisfaction=grievance.get("citizen_satisfaction"),
                    citizen_feedback=grievance.get("citizen_feedback")
                )
                grievance_responses.append(grievance_response)
            except Exception as e:
                logger.error(f"Error converting grievance {grievance.get('_id', 'unknown')}: {e}")
                logger.error(f"Grievance data: {grievance}")
                continue
        
        return grievance_responses
        
    except Exception as e:
        logger.error(f"Error getting grievances: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting grievances"
        )


@router.get("/{grievance_id}", response_model=GrievanceResponse)
async def get_grievance(
    grievance_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Get a specific grievance"""
    try:
        # Validate ObjectId format
        try:
            object_id = ObjectId(grievance_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid grievance ID format"
            )
        
        # Build query based on user role
        query = {"_id": object_id}
        
        # Citizens can only see their own grievances
        if current_user.role == "citizen":
            query["citizen_id"] = current_user.id
        # Department heads can see grievances assigned to their department
        elif current_user.role == "department_head":
            query["assigned_department"] = current_user.department
        # Admins can see all grievances (no additional filter)
        
        grievance = await db.grievances.find_one(query)
        
        if not grievance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grievance not found"
            )
        
        return GrievanceResponse(
            id=str(grievance["_id"]),
            title=grievance["title"],
            description=grievance["description"],
            category=grievance["category"],
            priority=grievance["priority"],
            location=grievance["location"],
            images=grievance["images"],
            citizen_id=grievance["citizen_id"],
            citizen_name=current_user.full_name,
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
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting grievance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting grievance"
        )


@router.put("/{grievance_id}", response_model=GrievanceResponse)
async def update_grievance(
    grievance_id: str,
    grievance_update: GrievanceUpdateRequest,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Update a grievance (only if pending)"""
    try:
        # Validate ObjectId format
        try:
            object_id = ObjectId(grievance_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid grievance ID format"
            )
        
        # Check if grievance exists and belongs to user
        grievance = await db.grievances.find_one({
            "_id": object_id,
            "citizen_id": current_user.id
        })
        
        if not grievance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grievance not found"
            )
        
        # Only allow updates if status is pending
        if grievance["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update grievance that is not pending"
            )
        
        # Build update data
        update_data = {"updated_at": datetime.utcnow()}
        
        if grievance_update.title:
            update_data["title"] = grievance_update.title
        if grievance_update.description:
            update_data["description"] = grievance_update.description
        if grievance_update.category:
            update_data["category"] = grievance_update.category.value
        if grievance_update.priority:
            update_data["priority"] = grievance_update.priority.value
        if grievance_update.location:
            update_data["location"] = grievance_update.location.dict()
        
        # Update grievance
        await db.grievances.update_one(
            {"_id": object_id},
            {"$set": update_data}
        )
        
        # Get updated grievance
        updated_grievance = await db.grievances.find_one({"_id": object_id})
        
        return GrievanceResponse(
            id=str(updated_grievance["_id"]),
            title=updated_grievance["title"],
            description=updated_grievance["description"],
            category=updated_grievance["category"],
            priority=updated_grievance["priority"],
            location=updated_grievance["location"],
            images=updated_grievance["images"],
            citizen_id=updated_grievance["citizen_id"],
            citizen_name=current_user.full_name,
            status=updated_grievance["status"],
            assigned_department=updated_grievance["assigned_department"],
            assigned_to=updated_grievance["assigned_to"],
            created_at=updated_grievance["created_at"],
            updated_at=updated_grievance["updated_at"],
            resolved_at=updated_grievance["resolved_at"],
            ai_analysis=updated_grievance["ai_analysis"],
            comments=updated_grievance["comments"],
            resolution_notes=updated_grievance["resolution_notes"],
            estimated_resolution_date=updated_grievance["estimated_resolution_date"],
            citizen_satisfaction=updated_grievance["citizen_satisfaction"],
            citizen_feedback=updated_grievance["citizen_feedback"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating grievance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating grievance"
        )


@router.get("/stats/overview", response_model=GrievanceStats)
async def get_grievance_stats(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Get grievance statistics for current user"""
    try:
        # Get total count
        total = await db.grievances.count_documents({"citizen_id": current_user.id})
        
        # Get counts by status
        pending = await db.grievances.count_documents({
            "citizen_id": current_user.id,
            "status": "pending"
        })
        in_progress = await db.grievances.count_documents({
            "citizen_id": current_user.id,
            "status": "in_progress"
        })
        resolved = await db.grievances.count_documents({
            "citizen_id": current_user.id,
            "status": "resolved"
        })
        rejected = await db.grievances.count_documents({
            "citizen_id": current_user.id,
            "status": "rejected"
        })
        
        # Get counts by category
        category_pipeline = [
            {"$match": {"citizen_id": current_user.id}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_cursor = db.grievances.aggregate(category_pipeline)
        category_results = await category_cursor.to_list(length=None)
        by_category = {result["_id"]: result["count"] for result in category_results}
        
        # Get counts by priority
        priority_pipeline = [
            {"$match": {"citizen_id": current_user.id}},
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
        ]
        priority_cursor = db.grievances.aggregate(priority_pipeline)
        priority_results = await priority_cursor.to_list(length=None)
        by_priority = {result["_id"]: result["count"] for result in priority_results}
        
        # Get counts by department
        department_pipeline = [
            {"$match": {"citizen_id": current_user.id, "assigned_department": {"$ne": None}}},
            {"$group": {"_id": "$assigned_department", "count": {"$sum": 1}}}
        ]
        department_cursor = db.grievances.aggregate(department_pipeline)
        department_results = await department_cursor.to_list(length=None)
        by_department = {result["_id"]: result["count"] for result in department_results}
        
        return GrievanceStats(
            total=total,
            pending=pending,
            in_progress=in_progress,
            resolved=resolved,
            rejected=rejected,
            by_category=by_category,
            by_priority=by_priority,
            by_department=by_department,
            avg_resolution_time=None  # TODO: Calculate average resolution time
        )
        
    except Exception as e:
        logger.error(f"Error getting grievance stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting grievance statistics"
        )
