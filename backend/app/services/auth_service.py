"""
Authentication service
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import UserCreate, UserInDB, UserResponse, UserLogin, Token
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service class"""
    
    def __init__(self):
        self.db: AsyncIOMotorDatabase = get_database()
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        try:
            # Check if user already exists
            existing_user = await self.db.users.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Check if phone already exists (if provided)
            if user_data.phone:
                existing_phone = await self.db.users.find_one({"phone": user_data.phone})
                if existing_phone:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Phone number already registered"
                    )
            
            # Create user document
            user_doc = {
                "email": user_data.email,
                "full_name": user_data.full_name,
                "phone": user_data.phone,
                "role": user_data.role.value,
                "status": user_data.status.value,
                "hashed_password": get_password_hash(user_data.password),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_login": None,
                "is_verified": False,
                "profile_image": None
            }
            
            # Insert user
            result = await self.db.users.insert_one(user_doc)
            user_doc["_id"] = str(result.inserted_id)
            
            # Return user response
            return UserResponse(
                id=str(result.inserted_id),
                email=user_doc["email"],
                full_name=user_doc["full_name"],
                phone=user_doc["phone"],
                role=user_doc["role"],
                status=user_doc["status"],
                created_at=user_doc["created_at"],
                updated_at=user_doc["updated_at"],
                last_login=user_doc["last_login"],
                is_verified=user_doc["is_verified"],
                profile_image=user_doc["profile_image"]
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating user"
            )
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate a user"""
        try:
            logger.info(f"Attempting to authenticate user: {email}")
            user = await self.db.users.find_one({"email": email})
            if not user:
                logger.warning(f"User not found: {email}")
                return None
            
            logger.info(f"User found: {user['email']}")
            logger.info(f"Checking password for user: {user['email']}")
            
            if not verify_password(password, user["hashed_password"]):
                logger.warning(f"Password verification failed for user: {email}")
                return None
            
            logger.info(f"Password verified for user: {email}")
            
            # Update last login
            await self.db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            
            return UserInDB.from_mongo(user)
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    async def login(self, login_data: UserLogin) -> Token:
        """Login user and return token"""
        user = await self.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user.id,
                "email": user.email,
                "role": user.role
            },
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        """Get user by ID"""
        try:
            from bson import ObjectId
            user = await self.db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return None
            
            return UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                full_name=user["full_name"],
                phone=user.get("phone"),
                role=user["role"],
                department=user.get("department"),
                status=user["status"],
                created_at=user["created_at"],
                updated_at=user["updated_at"],
                last_login=user.get("last_login"),
                is_verified=user.get("is_verified", False),
                profile_image=user.get("profile_image")
            )
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Get user by email"""
        try:
            user = await self.db.users.find_one({"email": email})
            if not user:
                return None
            
            return UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                full_name=user["full_name"],
                phone=user.get("phone"),
                role=user["role"],
                department=user.get("department"),
                status=user["status"],
                created_at=user["created_at"],
                updated_at=user["updated_at"],
                last_login=user.get("last_login"),
                is_verified=user.get("is_verified", False),
                profile_image=user.get("profile_image")
            )
            
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def create_demo_users(self) -> Dict[str, str]:
        """Create demo users for testing"""
        demo_users = [
            {
                "email": "citizen@demo.com",
                "full_name": "John Citizen",
                "phone": "+1234567890",
                "password": "password123",
                "role": "citizen",
                "status": "active"
            },
            {
                "email": "admin@demo.com",
                "full_name": "Admin User", 
                "phone": "+1234567891",
                "password": "password123",
                "role": "admin",
                "status": "active"
            },
            # Department Heads
            {
                "email": "head1@demo.com",
                "full_name": "Head of Public Works Department",
                "phone": "+1234567892",
                "password": "password123",
                "role": "department_head",
                "department": "Public Works Department (PWD)",
                "status": "active"
            },
            {
                "email": "head2@demo.com",
                "full_name": "Head of Municipal Corporation",
                "phone": "+1234567893",
                "password": "password123",
                "role": "department_head",
                "department": "Municipal Corporation",
                "status": "active"
            },
            {
                "email": "head3@demo.com",
                "full_name": "Head of Electricity Department",
                "phone": "+1234567894",
                "password": "password123",
                "role": "department_head",
                "department": "Electricity Department",
                "status": "active"
            },
            {
                "email": "head4@demo.com",
                "full_name": "Head of Transport Department",
                "phone": "+1234567895",
                "password": "password123",
                "role": "department_head",
                "department": "Transport Department",
                "status": "active"
            },
            {
                "email": "head5@demo.com",
                "full_name": "Head of Water Supply Department",
                "phone": "+1234567896",
                "password": "password123",
                "role": "department_head",
                "department": "Water Supply Department",
                "status": "active"
            },
            {
                "email": "head6@demo.com",
                "full_name": "Head of Police Department",
                "phone": "+1234567897",
                "password": "password123",
                "role": "department_head",
                "department": "Police Department",
                "status": "active"
            },
            {
                "email": "head7@demo.com",
                "full_name": "Head of Environment Department",
                "phone": "+1234567898",
                "password": "password123",
                "role": "department_head",
                "department": "Environment Department",
                "status": "active"
            }
        ]
        
        created_users = {}
        
        for user_data in demo_users:
            try:
                # Check if user already exists
                existing_user = await self.db.users.find_one({"email": user_data["email"]})
                if existing_user:
                    created_users[user_data["email"]] = "already_exists"
                    continue
                
                # Create user
                user_doc = {
                    "email": user_data["email"],
                    "full_name": user_data["full_name"],
                    "phone": user_data["phone"],
                    "role": user_data["role"],
                    "status": user_data["status"],
                    "hashed_password": get_password_hash(user_data["password"]),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "last_login": None,
                    "is_verified": True,  # Demo users are pre-verified
                    "profile_image": None
                }
                
                result = await self.db.users.insert_one(user_doc)
                created_users[user_data["email"]] = str(result.inserted_id)
                
            except Exception as e:
                logger.error(f"Error creating demo user {user_data['email']}: {e}")
                created_users[user_data["email"]] = f"error: {str(e)}"
        
        return created_users
