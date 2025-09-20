"""
Auto-assignment service for grievances based on AI analysis
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.ai_service import AIService
from app.models.grievance import AIAnalysis, GrievanceCategory, GrievancePriority
from app.models.notification import NotificationCreate
from app.services.notification_service import NotificationService
from bson import ObjectId

logger = logging.getLogger(__name__)


class AutoAssignmentService:
    """Service for automatically assigning grievances to departments"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.notification_service = NotificationService()
    
    async def analyze_and_assign_grievance(
        self, 
        grievance_id: str, 
        images: list, 
        title: str, 
        description: str,
        citizen_name: str,
        db: AsyncIOMotorDatabase
    ) -> Dict[str, Any]:
        """Analyze grievance and auto-assign to appropriate department"""
        try:
            # Analyze images if available
            ai_analysis = None
            if images:
                # Get the first image for analysis
                first_image = images[0]
                if first_image.get("url"):
                    # For now, we'll use the description and title for analysis
                    # In production, you'd download and analyze the actual image
                    ai_analysis = await self._analyze_text_content(title, description)
                else:
                    ai_analysis = await self._analyze_text_content(title, description)
            else:
                ai_analysis = await self._analyze_text_content(title, description)
            
            # Get suggested department
            suggested_department = ai_analysis.suggested_department
            
            # Verify department exists
            department = await db.departments.find_one({"name": suggested_department})
            if not department:
                logger.warning(f"Suggested department {suggested_department} not found")
                suggested_department = "Municipal Corporation"  # Fallback
                department = await db.departments.find_one({"name": suggested_department})
            
            if not department:
                logger.error("No departments found in database")
                return {
                    "success": False,
                    "message": "No departments available for assignment",
                    "ai_analysis": ai_analysis.dict() if ai_analysis else None
                }
            
            # Update grievance with AI analysis and assignment
            update_data = {
                "ai_analysis": ai_analysis.dict() if ai_analysis else None,
                "assigned_department": suggested_department,
                "assigned_to": None,  # Will be assigned by department head
                "status": "pending",
                "updated_at": datetime.utcnow()
            }
            
            # Update category and priority if AI suggests different values
            if ai_analysis and ai_analysis.category != "other":
                update_data["category"] = ai_analysis.category
            if ai_analysis and ai_analysis.auto_priority:
                update_data["priority"] = ai_analysis.auto_priority.value
            
            await db.grievances.update_one(
                {"_id": ObjectId(grievance_id)},
                {"$set": update_data}
            )
            
            # Create notification for department
            await self._create_department_notification(
                grievance_id, 
                suggested_department, 
                title, 
                citizen_name,
                db
            )
            
            logger.info(f"Grievance {grievance_id} auto-assigned to {suggested_department}")
            
            return {
                "success": True,
                "assigned_department": suggested_department,
                "ai_analysis": ai_analysis.dict() if ai_analysis else None,
                "message": f"Grievance auto-assigned to {suggested_department}"
            }
            
        except Exception as e:
            logger.error(f"Error in auto-assignment: {e}")
            return {
                "success": False,
                "message": f"Auto-assignment failed: {str(e)}",
                "ai_analysis": None
            }
    
    async def _analyze_text_content(self, title: str, description: str) -> AIAnalysis:
        """Analyze text content to determine category and department"""
        try:
            # Combine title and description for analysis
            content = f"{title} {description}".lower()
            
            # Simple keyword-based analysis (in production, use more sophisticated NLP)
            category_scores = {
                "infrastructure": 0,
                "utilities": 0,
                "transportation": 0,
                "environment": 0,
                "safety": 0,
                "other": 0
            }
            
            # Infrastructure keywords
            infrastructure_keywords = [
                "pothole", "road", "street", "bridge", "sidewalk", "pavement", 
                "crack", "hole", "asphalt", "concrete", "damaged", "broken"
            ]
            
            # Utilities keywords (electrical infrastructure)
            utilities_keywords = [
                "street light", "lamp", "lighting", "power", "electricity", 
                "electrical", "pole", "utility pole", "electricity pole", "power pole",
                "electric pole", "wire", "cable", "transformer", "outage", "blackout", "voltage",
                "fuse", "electrical hazard", "fallen pole", "broken wire", 
                "exposed wire", "electrical emergency", "tangled", "hanging",
                "dangerous", "hazard", "infrastructure", "utility", "power line",
                "electrical line", "overhead", "downed", "electrical pole",
                "water supply", "water", "pipe", "pipeline", "drainage", "sewer",
                "water leak", "water shortage", "no water", "water problem"
            ]
            
            # Transportation keywords
            transportation_keywords = [
                "traffic", "signal", "sign", "parking", "bus stop", "intersection",
                "stoplight", "pedestrian", "crossing"
            ]
            
            # Environment keywords
            environment_keywords = [
                "garbage", "trash", "waste", "drainage", "sewer", "dirty",
                "litter", "dumpster", "cleaning", "sanitation", "dumping",
                "pollution", "environment", "green", "park", "public space"
            ]
            
            # Safety keywords
            safety_keywords = [
                "accident", "danger", "hazard", "unsafe", "emergency", "fire",
                "flood", "water", "puddle", "risk"
            ]
            
            # Score each category with weighted keywords
            for keyword in infrastructure_keywords:
                if keyword in content:
                    # Give higher weight to more specific terms, but lower than electrical
                    weight = 2 if keyword in ["broken", "damaged", "crack", "hole"] else 1
                    category_scores["infrastructure"] += weight
            
            for keyword in utilities_keywords:
                if keyword in content:
                    # Give much higher weight to electrical-specific terms
                    if keyword in ["electricity pole", "utility pole", "power pole", "electrical pole", "fallen pole", "electric pole"]:
                        category_scores["utilities"] += 10  # Highest priority
                    elif keyword in ["electricity", "electrical", "power", "wire", "cable", "transformer", "street light", "lighting"]:
                        category_scores["utilities"] += 5
                    elif keyword in ["pole"] and any(electrical_word in content for electrical_word in ["electric", "electrical", "power", "utility"]):
                        category_scores["utilities"] += 8  # High weight for pole with electrical context
                    elif keyword in ["water supply", "water", "pipe", "pipeline", "water leak", "water shortage", "no water", "water problem"]:
                        category_scores["utilities"] += 3  # Water-related terms
                    else:
                        category_scores["utilities"] += 1
            
            for keyword in transportation_keywords:
                if keyword in content:
                    category_scores["transportation"] += 1
            
            for keyword in environment_keywords:
                if keyword in content:
                    # Give higher weight to environment keywords
                    weight = 3 if keyword in ["garbage", "trash", "waste", "dumping", "pollution"] else 2
                    category_scores["environment"] += weight
            
            for keyword in safety_keywords:
                if keyword in content:
                    category_scores["safety"] += 1
            
            # Determine category
            if max(category_scores.values()) == 0:
                category = "other"
            else:
                category = max(category_scores, key=category_scores.get)
            
            # Determine priority
            priority = self._determine_priority(category, max(category_scores.values()) / 10)
            
            # Suggest department
            suggested_department = self._suggest_department(category, content)
            
            return AIAnalysis(
                category=category,
                confidence=min(max(category_scores.values()) / 10, 1.0),
                labels=[f"{cat}:{score}" for cat, score in category_scores.items() if score > 0],
                auto_priority=priority,
                suggested_department=suggested_department
            )
            
        except Exception as e:
            logger.error(f"Error analyzing text content: {e}")
            return AIAnalysis(
                category="other",
                confidence=0.0,
                labels=[],
                auto_priority=GrievancePriority.MEDIUM,
                suggested_department="Municipal Corporation"
            )
    
    def _determine_priority(self, category: str, confidence: float) -> GrievancePriority:
        """Determine priority based on category and confidence"""
        high_priority_categories = ["safety", "utilities"]
        medium_priority_categories = ["infrastructure", "transportation"]
        low_priority_categories = ["environment", "other"]
        
        if category in high_priority_categories:
            return GrievancePriority.HIGH
        elif category in medium_priority_categories:
            return GrievancePriority.MEDIUM
        elif category in low_priority_categories:
            return GrievancePriority.LOW
        else:
            return GrievancePriority.MEDIUM
    
    def _suggest_department(self, category: str, content: str = "") -> str:
        """Suggest department based on category and content"""
        # Check for water-related keywords in content
        water_keywords = ["water supply", "water", "pipe", "pipeline", "water leak", "water shortage", "no water", "water problem", "drainage", "sewer"]
        has_water_keywords = any(keyword in content.lower() for keyword in water_keywords)
        
        # Check for electrical keywords in content
        electrical_keywords = ["electricity", "electrical", "power", "street light", "lighting", "pole", "wire", "cable", "transformer"]
        has_electrical_keywords = any(keyword in content.lower() for keyword in electrical_keywords)
        
        if category == "utilities":
            if has_water_keywords and not has_electrical_keywords:
                return "Water Supply Department"
            elif has_electrical_keywords:
                return "Electricity Department"
            else:
                return "Electricity Department"  # Default for utilities
        
        department_mapping = {
            "infrastructure": "Public Works Department (PWD)",
            "transportation": "Transport Department",
            "environment": "Environment Department",
            "safety": "Police Department",
            "other": "Municipal Corporation"
        }
        
        return department_mapping.get(category, "Municipal Corporation")
    
    async def _create_department_notification(
        self, 
        grievance_id: str, 
        department_name: str, 
        title: str,
        citizen_name: str,
        db: AsyncIOMotorDatabase
    ):
        """Create notification for department about new grievance"""
        try:
            # Use the enhanced notification service
            await self.notification_service.create_department_assignment_notification(
                department_name=department_name,
                grievance_id=grievance_id,
                grievance_title=title,
                citizen_name=citizen_name,
                db=db
            )
            
        except Exception as e:
            logger.error(f"Error creating department notification: {e}")


# Export singleton instance
auto_assignment_service = AutoAssignmentService()
