"""
Department management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.models.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse, DepartmentInDB
from app.models.user import UserResponse
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.admin import require_admin_role
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Predefined departments for Indian civic issues
DEFAULT_DEPARTMENTS = [
    {
        "name": "Public Works Department (PWD)",
        "description": "Handles road infrastructure, bridges, and public construction projects",
        "contact_email": "pwd@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6789",
        "head_name": "Chief Engineer",
        "categories": ["infrastructure", "roads", "bridges", "potholes", "sidewalks"],
        "status": "active"
    },
    {
        "name": "Municipal Corporation",
        "description": "Manages sanitation, waste management, and local civic services",
        "contact_email": "municipal@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6790",
        "head_name": "Municipal Commissioner",
        "categories": ["sanitation", "waste", "garbage", "drainage", "cleaning"],
        "status": "active"
    },
    {
        "name": "Electricity Department",
        "description": "Handles street lighting, power infrastructure, and electrical issues",
        "contact_email": "electricity@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6791",
        "head_name": "Chief Electrical Engineer",
        "categories": ["utilities", "street_lights", "power", "electrical", "lighting"],
        "status": "active"
    },
    {
        "name": "Transport Department",
        "description": "Manages traffic signals, road signs, and transportation infrastructure",
        "contact_email": "transport@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6792",
        "head_name": "Transport Commissioner",
        "categories": ["transportation", "traffic", "signals", "signs", "parking"],
        "status": "active"
    },
    {
        "name": "Water Supply Department",
        "description": "Handles water supply, pipes, and water-related infrastructure",
        "contact_email": "water@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6793",
        "head_name": "Chief Water Engineer",
        "categories": ["water", "pipes", "supply", "leakage", "hydrants"],
        "status": "active"
    },
    {
        "name": "Police Department",
        "description": "Handles safety issues, accidents, and security-related civic problems",
        "contact_email": "police@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6794",
        "head_name": "Police Commissioner",
        "categories": ["safety", "accidents", "security", "emergency", "crime"],
        "status": "active"
    },
    {
        "name": "Environment Department",
        "description": "Manages environmental issues, pollution, and green spaces",
        "contact_email": "environment@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6795",
        "head_name": "Environment Officer",
        "categories": ["environment", "pollution", "trees", "parks", "air_quality"],
        "status": "active"
    }
]


@router.post("/initialize", response_model=List[DepartmentResponse])
async def initialize_departments(
    current_user: Annotated[UserResponse, Depends(require_admin_role)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Initialize default departments (Admin only)"""
    try:
        # Check if departments already exist
        existing_count = await db.departments.count_documents({})
        if existing_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Departments already initialized"
            )
        
        # Create departments
        departments = []
        for dept_data in DEFAULT_DEPARTMENTS:
            dept_doc = {
                **dept_data,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "total_grievances": 0,
                "resolved_grievances": 0,
                "avg_resolution_time": None
            }
            
            result = await db.departments.insert_one(dept_doc)
            dept_doc["_id"] = str(result.inserted_id)
            departments.append(DepartmentInDB(**dept_doc))
        
        logger.info(f"Initialized {len(departments)} departments")
        return [DepartmentResponse(**dept.dict()) for dept in departments]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error initializing departments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error initializing departments"
        )


@router.get("/", response_model=List[DepartmentResponse])
async def get_departments(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all departments"""
    try:
        query = {}
        
        if status_filter:
            query["status"] = status_filter
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"head_name": {"$regex": search, "$options": "i"}}
            ]
        
        departments = []
        async for dept in db.departments.find(query).sort("name", 1):
            dept["id"] = str(dept["_id"])
            departments.append(DepartmentResponse(**dept))
        
        return departments
        
    except Exception as e:
        logger.error(f"Error getting departments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting departments"
        )


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Get department by ID"""
    try:
        dept = await db.departments.find_one({"_id": ObjectId(department_id)})
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        dept["id"] = str(dept["_id"])
        return DepartmentResponse(**dept)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting department: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting department"
        )


@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    department_data: DepartmentCreate,
    current_user: Annotated[UserResponse, Depends(require_admin_role)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Create a new department (Admin only)"""
    try:
        # Check if department with same name exists
        existing = await db.departments.find_one({"name": department_data.name})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department with this name already exists"
            )
        
        dept_doc = {
            **department_data.dict(),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "total_grievances": 0,
            "resolved_grievances": 0,
            "avg_resolution_time": None
        }
        
        result = await db.departments.insert_one(dept_doc)
        dept_doc["_id"] = str(result.inserted_id)
        
        return DepartmentResponse(**dept_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating department: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating department"
        )


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: str,
    department_data: DepartmentUpdate,
    current_user: Annotated[UserResponse, Depends(require_admin_role)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Update department (Admin only)"""
    try:
        # Check if department exists
        existing = await db.departments.find_one({"_id": ObjectId(department_id)})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Prepare update data
        update_data = {k: v for k, v in department_data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Update department
        await db.departments.update_one(
            {"_id": ObjectId(department_id)},
            {"$set": update_data}
        )
        
        # Get updated department
        updated_dept = await db.departments.find_one({"_id": ObjectId(department_id)})
        updated_dept["_id"] = str(updated_dept["_id"])
        
        return DepartmentResponse(**updated_dept)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating department: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating department"
        )


@router.delete("/{department_id}")
async def delete_department(
    department_id: str,
    current_user: Annotated[UserResponse, Depends(require_admin_role)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Delete department (Admin only)"""
    try:
        # Check if department exists
        existing = await db.departments.find_one({"_id": ObjectId(department_id)})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Check if department has active grievances
        active_grievances = await db.grievances.count_documents({
            "assigned_department": existing["name"],
            "status": {"$in": ["pending", "in_progress"]}
        })
        
        if active_grievances > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete department with {active_grievances} active grievances"
            )
        
        # Delete department
        await db.departments.delete_one({"_id": ObjectId(department_id)})
        
        return {"message": "Department deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting department: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting department"
        )


@router.get("/{department_id}/grievances", response_model=List[dict])
async def get_department_grievances(
    department_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    status_filter: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    """Get grievances assigned to a department"""
    try:
        # Get department name
        dept = await db.departments.find_one({"_id": ObjectId(department_id)})
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Build query
        query = {"assigned_department": dept["name"]}
        if status_filter:
            query["status"] = status_filter
        
        # Get grievances
        grievances = []
        async for grievance in db.grievances.find(query).skip(skip).limit(limit).sort("created_at", -1):
            grievance["_id"] = str(grievance["_id"])
            grievances.append(grievance)
        
        return grievances
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting department grievances: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting department grievances"
        )


@router.get("/grievances/my", response_model=List[dict])
async def get_my_department_grievances(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)],
    status_filter: Optional[str] = Query(None),
    category_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    """Get grievances assigned to the current user's department (for department heads)"""
    try:
        # Check if user is a department head
        if current_user.role != "department_head" or not current_user.department:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only department heads can access this endpoint"
            )
        
        # Build query for the user's department
        query = {"assigned_department": current_user.department}
        if status_filter:
            query["status"] = status_filter
        if category_filter:
            query["category"] = category_filter
        if priority_filter:
            query["priority"] = priority_filter
        
        # Get grievances
        grievances = []
        async for grievance in db.grievances.find(query).skip(skip).limit(limit).sort("created_at", -1):
            # Get citizen name
            try:
                citizen = await db.users.find_one({"_id": ObjectId(grievance["citizen_id"])})
                citizen_name = citizen["full_name"] if citizen else "Unknown"
            except Exception:
                citizen_name = "Unknown"
            
            grievance_data = {
                "id": str(grievance["_id"]),
                "title": grievance["title"],
                "description": grievance["description"],
                "category": grievance["category"],
                "priority": grievance["priority"],
                "location": grievance["location"],
                "images": grievance["images"],
                "citizen_id": grievance["citizen_id"],
                "citizen_name": citizen_name,
                "status": grievance["status"],
                "assigned_department": grievance["assigned_department"],
                "assigned_to": grievance.get("assigned_to"),
                "created_at": grievance["created_at"],
                "updated_at": grievance["updated_at"],
                "resolved_at": grievance.get("resolved_at"),
                "ai_analysis": grievance.get("ai_analysis"),
                "comments": grievance.get("comments", []),
                "resolution_notes": grievance.get("resolution_notes"),
                "estimated_resolution_date": grievance.get("estimated_resolution_date"),
                "citizen_satisfaction": grievance.get("citizen_satisfaction"),
                "citizen_feedback": grievance.get("citizen_feedback")
            }
            grievances.append(grievance_data)
        
        return grievances
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting department grievances: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting department grievances"
        )


@router.get("/{department_id}/stats", response_model=dict)
async def get_department_stats(
    department_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
):
    """Get department statistics"""
    try:
        # Get department name
        dept = await db.departments.find_one({"_id": ObjectId(department_id)})
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found"
            )
        
        # Get statistics
        total_grievances = await db.grievances.count_documents({"assigned_department": dept["name"]})
        pending_grievances = await db.grievances.count_documents({
            "assigned_department": dept["name"],
            "status": "pending"
        })
        in_progress_grievances = await db.grievances.count_documents({
            "assigned_department": dept["name"],
            "status": "in_progress"
        })
        resolved_grievances = await db.grievances.count_documents({
            "assigned_department": dept["name"],
            "status": "resolved"
        })
        
        # Calculate average resolution time
        resolved_grievances_with_dates = await db.grievances.find({
            "assigned_department": dept["name"],
            "status": "resolved",
            "resolved_at": {"$exists": True}
        }).to_list(length=None)
        
        avg_resolution_time = None
        if resolved_grievances_with_dates:
            total_days = 0
            for grievance in resolved_grievances_with_dates:
                if grievance.get("resolved_at") and grievance.get("created_at"):
                    days = (grievance["resolved_at"] - grievance["created_at"]).days
                    total_days += days
            avg_resolution_time = total_days / len(resolved_grievances_with_dates)
        
        return {
            "department_name": dept["name"],
            "total_grievances": total_grievances,
            "pending_grievances": pending_grievances,
            "in_progress_grievances": in_progress_grievances,
            "resolved_grievances": resolved_grievances,
            "avg_resolution_time_days": avg_resolution_time,
            "resolution_rate": (resolved_grievances / total_grievances * 100) if total_grievances > 0 else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting department stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting department stats"
        )
