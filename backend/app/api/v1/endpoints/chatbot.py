"""
Chatbot endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Annotated, Optional
from app.models.user import UserResponse
from app.api.v1.endpoints.auth import get_current_user
from app.services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
ai_service = AIService()


class ChatMessage(BaseModel):
    """Chat message model"""
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    reply: str
    message_id: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    message_data: ChatMessage,
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Chat with the AI bot"""
    try:
        # Add user context to the message
        user_context = {
            "user_id": current_user.id if current_user else None,
            "user_name": current_user.full_name if current_user else "Guest",
            "user_role": current_user.role if current_user else "guest"
        }
        
        # Merge with provided context
        if message_data.context:
            user_context.update(message_data.context)
        
        # Generate response
        reply = await ai_service.generate_response(
            message_data.message, 
            user_context
        )
        
        return ChatResponse(
            reply=reply,
            message_id=None  # TODO: Implement message tracking
        )
        
    except Exception as e:
        logger.error(f"Error in chatbot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing chat message"
        )


@router.post("/chat/guest", response_model=ChatResponse)
async def chat_as_guest(message_data: ChatMessage):
    """Chat with the AI bot as a guest (no authentication required)"""
    try:
        # Generate response without user context
        reply = await ai_service.generate_response(message_data.message)
        
        return ChatResponse(
            reply=reply,
            message_id=None
        )
        
    except Exception as e:
        logger.error(f"Error in guest chatbot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing chat message"
        )


@router.get("/faq")
async def get_faq():
    """Get frequently asked questions"""
    return {
        "faq": [
            {
                "question": "How do I submit a complaint?",
                "answer": "You can submit a complaint by logging in to your account, clicking on 'Submit New Grievance', filling out the form, and uploading relevant images."
            },
            {
                "question": "How long does it take to resolve a complaint?",
                "answer": "The resolution time varies depending on the type of issue. Simple issues may be resolved within 1-3 days, while complex infrastructure problems may take 1-2 weeks."
            },
            {
                "question": "Can I track the status of my complaint?",
                "answer": "Yes, you can track the status of your complaint in real-time through your dashboard. You'll also receive notifications when the status changes."
            },
            {
                "question": "What types of issues can I report?",
                "answer": "You can report various civic issues including potholes, street light problems, water supply issues, garbage collection problems, road damage, and other infrastructure-related concerns."
            },
            {
                "question": "How do I know which department is handling my complaint?",
                "answer": "The system automatically assigns complaints to the appropriate department based on the issue type. You can see the assigned department in your complaint details."
            },
            {
                "question": "Can I upload photos with my complaint?",
                "answer": "Yes, you can upload up to 5 photos with your complaint. Photos help us better understand the issue and resolve it faster."
            },
            {
                "question": "What if my complaint is rejected?",
                "answer": "If your complaint is rejected, you'll receive a notification with the reason. You can submit a new complaint with additional information or contact support for clarification."
            },
            {
                "question": "How do I provide feedback on resolved complaints?",
                "answer": "Once your complaint is resolved, you'll receive a notification asking for your feedback. You can rate the resolution and provide comments through your dashboard."
            }
        ]
    }


@router.get("/help")
async def get_help():
    """Get help information"""
    return {
        "help": {
            "contact": {
                "email": "support@civicconnect.gov",
                "phone": "+1-800-CIVIC-HELP",
                "hours": "Monday to Friday, 9 AM to 6 PM"
            },
            "tutorial": {
                "video_url": "https://example.com/tutorial",
                "steps": [
                    "Create an account or log in",
                    "Click on 'Submit New Grievance'",
                    "Fill out the complaint form",
                    "Upload relevant photos",
                    "Submit and track your complaint"
                ]
            },
            "categories": [
                "Infrastructure - Roads, bridges, sidewalks",
                "Utilities - Street lights, water supply, electricity",
                "Transportation - Traffic signals, bus stops, parking",
                "Environment - Garbage collection, pollution",
                "Safety - Accidents, hazards, emergencies"
            ]
        }
    }
