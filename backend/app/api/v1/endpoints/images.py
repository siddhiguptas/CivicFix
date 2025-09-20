"""
Image upload and processing endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Annotated, List
from app.models.user import UserResponse
from app.models.grievance import ImageMetadata
from app.api.v1.endpoints.auth import get_current_user
from app.services.image_service import ImageService
from app.services.ai_service import AIService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
image_service = ImageService()
ai_service = AIService()


@router.post("/upload", response_model=ImageMetadata)
async def upload_image(
    file: UploadFile = File(...),
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Upload a single image"""
    try:
        # Upload image to Cloudinary
        image_metadata = await image_service.upload_image(file, folder="grievances")
        return image_metadata
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading image"
        )


@router.post("/upload-multiple", response_model=List[ImageMetadata])
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Upload multiple images"""
    try:
        if len(files) > 5:  # Limit to 5 images
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 images allowed"
            )
        
        # Upload images to Cloudinary
        image_metadata_list = await image_service.upload_multiple_images(files, folder="grievances")
        return image_metadata_list
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading multiple images: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading images"
        )


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Analyze image using AI"""
    try:
        # Process image for AI analysis
        image_bytes = await image_service.process_image_for_ai(file)
        
        # Analyze image with AI
        ai_analysis = await ai_service.analyze_image(image_bytes)
        
        # Extract location if available
        location_data = await ai_service.extract_location_from_image(image_bytes)
        
        return {
            "analysis": ai_analysis.dict(),
            "location": location_data,
            "message": "Image analyzed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error analyzing image"
        )


@router.post("/analyze-text")
async def analyze_text(
    request: dict,
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Analyze text content for department assignment"""
    try:
        title = request.get("title", "")
        description = request.get("description", "")
        
        if not title and not description:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title or description is required"
            )
        
        # Use the auto assignment service for text analysis
        from app.services.auto_assignment_service import auto_assignment_service
        ai_analysis = await auto_assignment_service._analyze_text_content(title, description)
        
        return {
            "category": ai_analysis.category,
            "confidence": ai_analysis.confidence,
            "suggested_department": ai_analysis.suggested_department,
            "auto_priority": ai_analysis.auto_priority,
            "labels": ai_analysis.labels
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error analyzing text content"
        )


@router.post("/upload-and-analyze")
async def upload_and_analyze_image(
    file: UploadFile = File(...),
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Upload and analyze image in one request"""
    try:
        # Upload image to Cloudinary
        image_metadata = await image_service.upload_image(file, folder="grievances")
        
        # Process image for AI analysis
        image_bytes = await image_service.process_image_for_ai(file)
        
        # Analyze image with AI
        ai_analysis = await ai_service.analyze_image(image_bytes)
        
        # Extract location if available
        location_data = await ai_service.extract_location_from_image(image_bytes)
        
        return {
            "image_metadata": image_metadata.dict(),
            "ai_analysis": ai_analysis.dict(),
            "location": location_data,
            "message": "Image uploaded and analyzed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading and analyzing image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading and analyzing image"
        )


@router.delete("/{public_id}")
async def delete_image(
    public_id: str,
    current_user: Annotated[UserResponse, Depends(get_current_user)] = None
):
    """Delete an image"""
    try:
        success = await image_service.delete_image(public_id)
        
        if success:
            return {"message": "Image deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete image"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting image"
        )


@router.get("/thumbnail/{public_id}")
async def get_thumbnail(
    public_id: str,
    width: int = 300,
    height: int = 300
):
    """Get thumbnail URL for an image"""
    try:
        thumbnail_url = image_service.get_thumbnail_url(public_id, width, height)
        
        if thumbnail_url:
            return {"thumbnail_url": thumbnail_url}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting thumbnail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting thumbnail"
        )
