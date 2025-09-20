"""
Image processing and storage service
"""

try:
    import cloudinary
    import cloudinary.uploader
    from cloudinary.utils import cloudinary_url
    CLOUDINARY_AVAILABLE = True
except ImportError:
    CLOUDINARY_AVAILABLE = False
    cloudinary = None
    cloudinary_uploader = None
    cloudinary_url = None
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings
from app.models.grievance import ImageMetadata
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)


class ImageService:
    """Image processing and storage service"""
    
    def __init__(self):
        # Configure Cloudinary
        if CLOUDINARY_AVAILABLE and settings.CLOUDINARY_CLOUD_NAME:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
        else:
            logger.warning("Cloudinary not available or not configured")
    
    async def upload_image(self, file: UploadFile, folder: str = "grievances") -> ImageMetadata:
        """Upload image to Cloudinary"""
        if not CLOUDINARY_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image upload service not available"
            )
        
        try:
            # Validate file type
            if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File type {file.content_type} not allowed"
                )
            
            # Validate file size
            file_content = await file.read()
            if len(file_content) > settings.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size too large"
                )
            
            # Reset file pointer
            await file.seek(0)
            
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="image",
                transformation=[
                    {"width": 1200, "height": 1200, "crop": "limit"},
                    {"quality": "auto"},
                    {"format": "auto"}
                ]
            )
            
            # Create image metadata
            image_metadata = ImageMetadata(
                url=upload_result["secure_url"],
                public_id=upload_result["public_id"],
                width=upload_result["width"],
                height=upload_result["height"],
                format=upload_result["format"],
                size=upload_result["bytes"],
                uploaded_at=upload_result["created_at"]
            )
            
            return image_metadata
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error uploading image"
            )
    
    async def upload_multiple_images(self, files: List[UploadFile], folder: str = "grievances") -> List[ImageMetadata]:
        """Upload multiple images to Cloudinary"""
        image_metadata_list = []
        
        for file in files:
            try:
                metadata = await self.upload_image(file, folder)
                image_metadata_list.append(metadata)
            except Exception as e:
                logger.error(f"Error uploading image {file.filename}: {e}")
                # Continue with other images even if one fails
                continue
        
        return image_metadata_list
    
    async def delete_image(self, public_id: str) -> bool:
        """Delete image from Cloudinary"""
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            logger.error(f"Error deleting image {public_id}: {e}")
            return False
    
    async def get_image_url(self, public_id: str, transformation: Optional[Dict[str, Any]] = None) -> str:
        """Get image URL with optional transformations"""
        try:
            if transformation:
                url, _ = cloudinary_url(public_id, **transformation)
            else:
                url, _ = cloudinary_url(public_id)
            return url
        except Exception as e:
            logger.error(f"Error getting image URL for {public_id}: {e}")
            return ""
    
    async def process_image_for_ai(self, file: UploadFile) -> bytes:
        """Process image for AI analysis"""
        try:
            # Read image
            image_content = await file.read()
            image = Image.open(io.BytesIO(image_content))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large (AI models work better with smaller images)
            max_size = 1024
            if image.width > max_size or image.height > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr = img_byte_arr.getvalue()
            
            return img_byte_arr
            
        except Exception as e:
            logger.error(f"Error processing image for AI: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing image"
            )
    
    async def extract_image_metadata(self, file: UploadFile) -> Dict[str, Any]:
        """Extract metadata from image"""
        try:
            # Read image
            image_content = await file.read()
            image = Image.open(io.BytesIO(image_content))
            
            # Extract basic metadata
            metadata = {
                "width": image.width,
                "height": image.height,
                "format": image.format,
                "mode": image.mode,
                "size": len(image_content),
                "filename": file.filename
            }
            
            # Extract EXIF data if available
            if hasattr(image, '_getexif') and image._getexif() is not None:
                exif_data = image._getexif()
                metadata["exif"] = exif_data
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting image metadata: {e}")
            return {}
    
    def get_thumbnail_url(self, public_id: str, width: int = 300, height: int = 300) -> str:
        """Get thumbnail URL for an image"""
        try:
            url, _ = cloudinary_url(
                public_id,
                width=width,
                height=height,
                crop="fill",
                quality="auto",
                format="auto"
            )
            return url
        except Exception as e:
            logger.error(f"Error getting thumbnail URL for {public_id}: {e}")
            return ""
