"""
Department models and schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
from bson import ObjectId


class DepartmentStatus(str, Enum):
    """Department status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class DepartmentBase(BaseModel):
    """Base department model"""
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    contact_email: str
    contact_phone: str
    head_name: str = Field(..., min_length=2, max_length=100)
    categories: List[str] = []  # Grievance categories this department handles
    status: DepartmentStatus = DepartmentStatus.ACTIVE


class DepartmentCreate(DepartmentBase):
    """Department creation model"""
    pass


class DepartmentUpdate(BaseModel):
    """Department update model"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    head_name: Optional[str] = Field(None, min_length=2, max_length=100)
    categories: Optional[List[str]] = None
    status: Optional[DepartmentStatus] = None


class DepartmentInDB(DepartmentBase):
    """Department model in database"""
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime
    total_grievances: int = 0
    resolved_grievances: int = 0
    avg_resolution_time: Optional[float] = None  # in days
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class DepartmentResponse(DepartmentBase):
    """Department response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    total_grievances: int
    resolved_grievances: int
    avg_resolution_time: Optional[float] = None


class DepartmentStats(BaseModel):
    """Department statistics model"""
    department_id: str
    department_name: str
    total_grievances: int
    resolved_grievances: int
    pending_grievances: int
    in_progress_grievances: int
    resolution_rate: float
    avg_resolution_time: Optional[float] = None
    satisfaction_score: Optional[float] = None
