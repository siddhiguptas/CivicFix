"""
API v1 router
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, grievances, images, chatbot, admin, notifications, departments

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(grievances.router, prefix="/grievances", tags=["Grievances"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
