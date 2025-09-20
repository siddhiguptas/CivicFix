"""
Security utilities for authentication and authorization
"""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings
from app.models.user import TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """Verify and decode a JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if user_id is None or email is None:
            raise credentials_exception
            
        token_data = TokenData(user_id=user_id, email=email, role=role)
        return token_data
        
    except JWTError:
        raise credentials_exception


def create_demo_users():
    """Create demo users for testing"""
    demo_users = [
        {
            "email": "citizen@demo.com",
            "full_name": "John Citizen",
            "phone": "+1234567890",
            "password": "demo123",
            "role": "citizen",
            "status": "active"
        },
        {
            "email": "admin@demo.com", 
            "full_name": "Admin User",
            "phone": "+1234567891",
            "password": "admin123",
            "role": "admin",
            "status": "active"
        },
        {
            "email": "dept@demo.com",
            "full_name": "Department Head",
            "phone": "+1234567892", 
            "password": "dept123",
            "role": "department_head",
            "status": "active"
        }
    ]
    return demo_users
