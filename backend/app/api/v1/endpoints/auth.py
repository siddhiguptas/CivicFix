"""
Authentication endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
from app.models.user import UserCreate, UserResponse, UserLogin, Token
from app.services.auth_service import AuthService
from app.core.security import verify_token, TokenData
from app.core.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncIOMotorDatabase, Depends(get_database)]
) -> UserResponse:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token_data = verify_token(token)
        auth_service = AuthService()
        user = await auth_service.get_user_by_id(token_data.user_id)
        
        if user is None:
            raise credentials_exception
        
        return user
        
    except Exception:
        raise credentials_exception


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    auth_service = AuthService()
    return await auth_service.create_user(user_data)


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user"""
    auth_service = AuthService()
    return await auth_service.login(login_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Annotated[UserResponse, Depends(get_current_user)]):
    """Get current user information"""
    return current_user


@router.post("/create-demo-users")
async def create_demo_users():
    """Create demo users for testing"""
    auth_service = AuthService()
    result = await auth_service.create_demo_users()
    return {"message": "Demo users created", "users": result}


@router.get("/demo-credentials")
async def get_demo_credentials():
    """Get demo user credentials"""
    return {
        "citizen": {
            "email": "citizen@demo.com",
            "password": "demo123",
            "role": "citizen"
        },
        "admin": {
            "email": "admin@demo.com", 
            "password": "admin123",
            "role": "admin"
        },
        "department_head": {
            "email": "dept@demo.com",
            "password": "dept123",
            "role": "department_head"
        }
    }
