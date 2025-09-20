"""
AI service for image analysis and classification
"""

import os
try:
    from clarifai.client.model import Model
    CLARIFAI_AVAILABLE = True
except ImportError:
    CLARIFAI_AVAILABLE = False
    Model = None

try:
    import google.generativeai as genai
except ImportError:
    # Fallback for older versions
    genai = None
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.models.grievance import AIAnalysis, GrievanceCategory, GrievancePriority
import logging

logger = logging.getLogger(__name__)


class AIService:
    """AI service for image analysis and classification"""
    
    def __init__(self):
        # Configure Clarifai
        self.clarifai_api_key = settings.CLARIFAI_PAT
        if not self.clarifai_api_key:
            logger.warning("Clarifai API key not found")
        
        # Configure Gemini
        self.google_api_key = settings.GOOGLE_API_KEY
        if not self.google_api_key:
            logger.warning("Google API key not found")
        elif genai:
            genai.configure(api_key=self.google_api_key)
            self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            logger.warning("Google Generative AI not available")
            self.gemini_model = None
        
        # Initialize Clarifai model
        if self.clarifai_api_key and CLARIFAI_AVAILABLE:
            self.clarifai_model = Model(
                url="https://clarifai.com/clarifai/main/models/general-image-recognition",
                pat=self.clarifai_api_key
            )
        else:
            self.clarifai_model = None
            if not CLARIFAI_AVAILABLE:
                logger.warning("Clarifai package not available")
        
        # Category mapping for civic issues
        self.category_keywords = {
            "infrastructure": [
                "pothole", "crack", "hole", "asphalt", "road damage", "broken road",
                "pavement", "concrete", "street", "road", "surface", "damaged",
                "cracked", "broken", "deteriorated", "worn", "bridge", "sidewalk",
                "curb", "drain", "manhole", "street sign", "traffic sign"
            ],
            "utilities": [
                "street light", "lamp post", "streetlamp", "lamp", "light pole",
                "lighting", "pole", "post", "illumination", "street lamp",
                "outdoor light", "public light", "power line", "electricity",
                "water pipe", "hydrant", "utility pole", "transformer"
            ],
            "transportation": [
                "traffic light", "stoplight", "signal light", "signal", "red light",
                "yellow light", "green light", "pedestrian signal", "signal post",
                "traffic signal", "stop light", "traffic control", "intersection",
                "bus stop", "taxi stand", "parking", "vehicle", "car", "bus"
            ],
            "environment": [
                "trash", "garbage", "waste", "dumpster", "litter", "rubbish",
                "debris", "refuse", "bin", "container", "dump", "junk",
                "pollution", "smoke", "air quality", "water pollution", "dirty"
            ],
            "safety": [
                "accident", "injury", "danger", "hazard", "unsafe", "risk",
                "emergency", "fire", "smoke", "flood", "water", "puddle",
                "flooding", "wet", "pool", "standing water", "drainage"
            ]
        }
    
    async def analyze_image(self, image_bytes: bytes) -> AIAnalysis:
        """Analyze image and return AI analysis"""
        try:
            # Get image classification from Clarifai
            clarifai_analysis = await self._analyze_with_clarifai(image_bytes)
            
            # Determine category based on keywords
            category = self._determine_category(clarifai_analysis.get("labels", []))
            
            # Determine priority based on category and confidence
            priority = self._determine_priority(category, clarifai_analysis.get("confidence", 0.0))
            
            # Suggest department based on category
            suggested_department = self._suggest_department(category)
            
            return AIAnalysis(
                category=category,
                confidence=clarifai_analysis.get("confidence", 0.0),
                labels=clarifai_analysis.get("labels", []),
                auto_priority=priority,
                suggested_department=suggested_department
            )
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return AIAnalysis(
                category="other",
                confidence=0.0,
                labels=[],
                auto_priority=GrievancePriority.MEDIUM,
                suggested_department=None
            )
    
    async def _analyze_with_clarifai(self, image_bytes: bytes) -> Dict[str, Any]:
        """Analyze image using Clarifai"""
        if not self.clarifai_model:
            return {"labels": [], "confidence": 0.0}
        
        try:
            # Save image to temporary file
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
                tmp_file.write(image_bytes)
                tmp_file_path = tmp_file.name
            
            # Analyze with Clarifai
            prediction = self.clarifai_model.predict_by_filepath(tmp_file_path, input_type="image")
            concepts = prediction.outputs[0].data.concepts[:10]  # Top 10 concepts
            
            # Clean up temporary file
            os.unlink(tmp_file_path)
            
            # Extract labels and confidences
            labels = [c.name.lower() for c in concepts]
            confidences = {c.name.lower(): c.value for c in concepts}
            
            # Calculate average confidence
            avg_confidence = sum(confidences.values()) / len(confidences) if confidences else 0.0
            
            return {
                "labels": labels,
                "confidence": avg_confidence,
                "concepts": [(c.name, c.value) for c in concepts]
            }
            
        except Exception as e:
            logger.error(f"Error with Clarifai analysis: {e}")
            return {"labels": [], "confidence": 0.0}
    
    def _determine_category(self, labels: List[str]) -> str:
        """Determine category based on detected labels"""
        category_scores = {cat: 0 for cat in self.category_keywords.keys()}
        
        for label in labels:
            for category, keywords in self.category_keywords.items():
                for keyword in keywords:
                    if keyword in label or label in keyword:
                        category_scores[category] += 1
        
        # Return category with highest score, or "other" if no match
        if max(category_scores.values()) == 0:
            return "other"
        
        return max(category_scores, key=category_scores.get)
    
    def _determine_priority(self, category: str, confidence: float) -> GrievancePriority:
        """Determine priority based on category and confidence"""
        # High priority categories
        high_priority_categories = ["safety", "utilities"]
        
        # Medium priority categories
        medium_priority_categories = ["infrastructure", "transportation"]
        
        # Low priority categories
        low_priority_categories = ["environment", "other"]
        
        if category in high_priority_categories:
            return GrievancePriority.HIGH
        elif category in medium_priority_categories:
            return GrievancePriority.MEDIUM
        elif category in low_priority_categories:
            return GrievancePriority.LOW
        else:
            return GrievancePriority.MEDIUM
    
    def _suggest_department(self, category: str) -> Optional[str]:
        """Suggest department based on category"""
        department_mapping = {
            "infrastructure": "Public Works Department (PWD)",
            "utilities": "Electricity Department",
            "transportation": "Transport Department",
            "environment": "Municipal Corporation",
            "safety": "Police Department",
            "other": "Municipal Corporation"
        }
        
        return department_mapping.get(category)
    
    async def generate_response(self, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate response using Gemini"""
        if not self.google_api_key or not self.gemini_model:
            return "I'm sorry, I'm not available right now. Please try again later."
        
        try:
            # Create context-aware prompt
            system_prompt = """
            You are CivicConnect AI Assistant, a helpful and professional chatbot for citizens reporting civic issues in India.
            
            Your role is to assist citizens with:
            - Reporting new civic issues (potholes, street lights, water supply, garbage, etc.)
            - Tracking existing grievance status and progress
            - Understanding the platform features and navigation
            - Providing information about different issue categories
            - Explaining the resolution process and timelines
            - Helping with account management and settings
            
            Guidelines:
            - Be friendly, professional, and empathetic
            - Provide clear, actionable advice
            - Use simple language that everyone can understand
            - Ask clarifying questions when needed
            - Always encourage citizens to report issues with photos and precise locations
            - Explain the auto-assignment system to departments
            - Mention that they can track progress in real-time
            - If you don't know something, suggest contacting support or checking the help section
            
            Current user context: {user_role} - {user_name}
            
            Respond in a helpful, encouraging tone and provide specific guidance based on their role.
            """
            
            if context:
                user_role = context.get('user_role', 'citizen')
                user_name = context.get('user_name', 'User')
                context_str = f"\nContext: {context}"
            else:
                user_role = 'citizen'
                user_name = 'User'
                context_str = ""
            
            # Format the system prompt with user context
            formatted_prompt = system_prompt.format(user_role=user_role, user_name=user_name)
            prompt = f"{formatted_prompt}{context_str}\nUser: {message}\nAssistant:"
            
            response = self.gemini_model.generate_content(prompt)
            return response.text or "I'm sorry, I couldn't generate a response. Please try again."
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I'm sorry, I'm having trouble responding right now. Please try again later."
    
    async def extract_location_from_image(self, image_bytes: bytes) -> Optional[Dict[str, float]]:
        """Extract location information from image EXIF data"""
        try:
            from PIL import Image
            from PIL.ExifTags import TAGS, GPSTAGS
            import io
            
            # Open image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Get EXIF data
            exif_data = image._getexif()
            if not exif_data:
                return None
            
            # Extract GPS data
            gps_info = exif_data.get(34853)  # GPSInfo tag
            if not gps_info:
                return None
            
            # Convert GPS coordinates
            lat = self._convert_gps_coordinate(gps_info.get(2), gps_info.get(1))
            lon = self._convert_gps_coordinate(gps_info.get(4), gps_info.get(3))
            
            if lat and lon:
                return {"latitude": lat, "longitude": lon}
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting location from image: {e}")
            return None
    
    def _convert_gps_coordinate(self, coord, ref):
        """Convert GPS coordinate from DMS to decimal degrees"""
        if not coord or not ref:
            return None
        
        degrees, minutes, seconds = coord
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        
        if ref in ['S', 'W']:
            decimal = -decimal
        
        return decimal
