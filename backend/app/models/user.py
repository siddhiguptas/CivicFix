"""
User models and schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId


class UserRole(str, Enum):
    """User roles"""
    CITIZEN = "citizen"
    ADMIN = "admin"
    DEPARTMENT_HEAD = "department_head"
    MODERATOR = "moderator"


class UserStatus(str, Enum):
    """User status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    role: UserRole = UserRole.CITIZEN
    department: Optional[str] = Field(None, max_length=100)  # For department heads
    status: UserStatus = UserStatus.ACTIVE


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    """User update model"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    department: Optional[str] = Field(None, max_length=100)
    status: Optional[UserStatus] = None


class UserInDB(UserBase):
    """User model in database"""
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    is_verified: bool = False
    profile_image: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        from_attributes = True
        
    @classmethod
    def from_mongo(cls, data: dict):
        """Convert MongoDB document to UserInDB"""
        if data is None:
            return None
        # Create a copy to avoid modifying the original
        data_copy = data.copy()
        data_copy["id"] = str(data_copy["_id"])
        # Remove the _id field to avoid conflicts
        data_copy.pop("_id", None)
        return cls(**data_copy)


class UserResponse(UserBase):
    """User response model"""
    id: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    is_verified: bool = False
    profile_image: Optional[str] = None


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token model"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token data model"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
