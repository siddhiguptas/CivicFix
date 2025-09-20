"""
Grievance/Issue models and schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId


class GrievanceStatus(str, Enum):
    """Grievance status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    CLOSED = "closed"


class GrievancePriority(str, Enum):
    """Grievance priority"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class GrievanceCategory(str, Enum):
    """Grievance categories"""
    INFRASTRUCTURE = "infrastructure"
    UTILITIES = "utilities"
    TRANSPORTATION = "transportation"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    ENVIRONMENT = "environment"
    SAFETY = "safety"
    OTHER = "other"


class Location(BaseModel):
    """Location model"""
    address: str
    coordinates: List[float] = Field(..., min_items=2, max_items=2)  # [longitude, latitude]
    city: str
    state: str
    pincode: Optional[str] = None
    landmark: Optional[str] = None


class ImageMetadata(BaseModel):
    """Image metadata model"""
    url: str
    public_id: str  # Cloudinary public ID
    width: int
    height: int
    format: str
    size: int  # in bytes
    uploaded_at: datetime


class AIAnalysis(BaseModel):
    """AI analysis results"""
    category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    labels: List[str] = []
    auto_priority: Optional[GrievancePriority] = None
    suggested_department: Optional[str] = None


class GrievanceUpdate(BaseModel):
    """Grievance update model"""
    status: Optional[GrievanceStatus] = None
    priority: Optional[GrievancePriority] = None
    assigned_department: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    estimated_resolution_date: Optional[datetime] = None


class GrievanceComment(BaseModel):
    """Grievance comment model"""
    id: str = Field(alias="_id")
    user_id: str
    user_name: str
    comment: str
    created_at: datetime
    is_internal: bool = False  # Internal comments for admin/department use
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class GrievanceBase(BaseModel):
    """Base grievance model"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: GrievanceCategory
    priority: GrievancePriority = GrievancePriority.MEDIUM
    location: Location
    images: List[ImageMetadata] = []


class GrievanceCreate(GrievanceBase):
    """Grievance creation model"""
    pass


class GrievanceUpdateRequest(BaseModel):
    """Grievance update request model"""
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[GrievanceCategory] = None
    priority: Optional[GrievancePriority] = None
    location: Optional[Location] = None


class GrievanceInDB(GrievanceBase):
    """Grievance model in database"""
    id: str = Field(alias="_id")
    citizen_id: str
    status: GrievanceStatus = GrievanceStatus.PENDING
    assigned_department: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    ai_analysis: Optional[AIAnalysis] = None
    comments: List[GrievanceComment] = []
    resolution_notes: Optional[str] = None
    estimated_resolution_date: Optional[datetime] = None
    citizen_satisfaction: Optional[int] = Field(None, ge=1, le=5)
    citizen_feedback: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class GrievanceResponse(GrievanceBase):
    """Grievance response model"""
    id: str
    citizen_id: str
    citizen_name: str
    status: GrievanceStatus
    assigned_department: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    ai_analysis: Optional[AIAnalysis] = None
    comments: List[GrievanceComment] = []
    resolution_notes: Optional[str] = None
    estimated_resolution_date: Optional[datetime] = None
    citizen_satisfaction: Optional[int] = None
    citizen_feedback: Optional[str] = None


class GrievanceStats(BaseModel):
    """Grievance statistics model"""
    total: int
    pending: int
    in_progress: int
    resolved: int
    rejected: int
    by_category: Dict[str, int]
    by_priority: Dict[str, int]
    by_department: Dict[str, int]
    avg_resolution_time: Optional[float] = None  # in days
