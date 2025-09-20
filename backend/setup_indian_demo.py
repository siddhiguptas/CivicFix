"""
Setup script for Indian-style demo data
Creates proper users, departments, and sample grievances with Indian names and realistic data
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import get_password_hash
from app.models.department import DepartmentInDB, DepartmentResponse
from app.models.user import UserCreate, UserRole, UserStatus
from app.models.grievance import GrievanceCreate, GrievanceCategory, GrievancePriority, Location, ImageMetadata
from app.services.auth_service import AuthService
from app.services.auto_assignment_service import AutoAssignmentService

# Indian-style demo data
INDIAN_DEPARTMENTS = [
    {
        "name": "Public Works Department (PWD)",
        "description": "Handles road infrastructure, bridges, and public construction projects",
        "contact_email": "pwd@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6789",
        "head_name": "Chief Engineer",
        "categories": ["infrastructure", "roads", "bridges", "potholes", "sidewalks"],
        "status": "active"
    },
    {
        "name": "Municipal Corporation",
        "description": "General municipal services and administration",
        "contact_email": "municipal@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6790",
        "head_name": "Municipal Commissioner",
        "categories": ["general", "administration", "public_facilities"],
        "status": "active"
    },
    {
        "name": "Electricity Department",
        "description": "Handles electrical infrastructure, street lighting, and power supply",
        "contact_email": "electricity@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6791",
        "head_name": "Chief Electrical Engineer",
        "categories": ["utilities", "street_lights", "power", "electrical_safety"],
        "status": "active"
    },
    {
        "name": "Transport Department",
        "description": "Manages public transportation, traffic signals, and road safety",
        "contact_email": "transport@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6792",
        "head_name": "Transport Commissioner",
        "categories": ["transportation", "traffic", "public_transport", "road_safety"],
        "status": "active"
    },
    {
        "name": "Water Supply Department",
        "description": "Manages water supply, drainage, and sanitation",
        "contact_email": "water@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6793",
        "head_name": "Chief Water Engineer",
        "categories": ["water", "drainage", "sanitation", "sewage"],
        "status": "active"
    },
    {
        "name": "Police Department",
        "description": "Law enforcement and public safety",
        "contact_email": "police@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6794",
        "head_name": "Police Commissioner",
        "categories": ["safety", "law_enforcement", "traffic_violations", "public_order"],
        "status": "active"
    },
    {
        "name": "Environment Department",
        "description": "Environmental protection and waste management",
        "contact_email": "environment@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6795",
        "head_name": "Environment Officer",
        "categories": ["environment", "waste_management", "pollution", "green_spaces"],
        "status": "active"
    }
]

INDIAN_DEMO_USERS = [
    # Citizens
    {
        "email": "rajesh.kumar@demo.com",
        "full_name": "Rajesh Kumar",
        "phone": "+919876543210",
        "password": "password123",
        "role": "citizen",
        "status": "active"
    },
    {
        "email": "priya.sharma@demo.com",
        "full_name": "Priya Sharma",
        "phone": "+919876543211",
        "password": "password123",
        "role": "citizen",
        "status": "active"
    },
    {
        "email": "amit.singh@demo.com",
        "full_name": "Amit Singh",
        "phone": "+919876543212",
        "password": "password123",
        "role": "citizen",
        "status": "active"
    },
    
    # Admin
    {
        "email": "admin@civicconnect.gov.in",
        "full_name": "Dr. Suresh Mehta",
        "phone": "+911123456789",
        "password": "admin123",
        "role": "admin",
        "status": "active"
    },
    
    # Department Heads
    {
        "email": "pwd.head@civicconnect.gov.in",
        "full_name": "Shri Ramesh Gupta",
        "phone": "+911123456790",
        "password": "password123",
        "role": "department_head",
        "department": "Public Works Department (PWD)",
        "status": "active"
    },
    {
        "email": "municipal.head@civicconnect.gov.in",
        "full_name": "Shri Vijay Kumar",
        "phone": "+911123456791",
        "password": "password123",
        "role": "department_head",
        "department": "Municipal Corporation",
        "status": "active"
    },
    {
        "email": "electricity.head@civicconnect.gov.in",
        "full_name": "Shri Anil Sharma",
        "phone": "+911123456792",
        "password": "password123",
        "role": "department_head",
        "department": "Electricity Department",
        "status": "active"
    },
    {
        "email": "transport.head@civicconnect.gov.in",
        "full_name": "Shri Deepak Verma",
        "phone": "+911123456793",
        "password": "password123",
        "role": "department_head",
        "department": "Transport Department",
        "status": "active"
    },
    {
        "email": "water.head@civicconnect.gov.in",
        "full_name": "Shri Rajesh Tiwari",
        "phone": "+911123456794",
        "password": "password123",
        "role": "department_head",
        "department": "Water Supply Department",
        "status": "active"
    },
    {
        "email": "police.head@civicconnect.gov.in",
        "full_name": "Shri Ajay Singh",
        "phone": "+911123456795",
        "password": "password123",
        "role": "department_head",
        "department": "Police Department",
        "status": "active"
    },
    {
        "email": "environment.head@civicconnect.gov.in",
        "full_name": "Shri Sunil Kumar",
        "phone": "+911123456796",
        "password": "password123",
        "role": "department_head",
        "department": "Environment Department",
        "status": "active"
    }
]

SAMPLE_GRIEVANCES = [
    {
        "title": "Broken Electric Pole Near Metro Station",
        "description": "An electric pole is broken and hanging dangerously near the metro station. It's a safety hazard for pedestrians and commuters.",
        "category": GrievanceCategory.UTILITIES,
        "priority": GrievancePriority.HIGH,
        "location": Location(
            address="Near Rajiv Chowk Metro Station, New Delhi",
            coordinates=[77.1025, 28.7041],  # [longitude, latitude]
            city="New Delhi",
            state="Delhi",
            pincode="110001",
            landmark="Rajiv Chowk Metro Station"
        ),
        "images": []
    },
    {
        "title": "Large Pothole on Main Road",
        "description": "There's a large pothole on the main road causing traffic jams and vehicle damage. It's been there for weeks.",
        "category": GrievanceCategory.INFRASTRUCTURE,
        "priority": GrievancePriority.MEDIUM,
        "location": Location(
            address="Connaught Place, New Delhi",
            coordinates=[77.2090, 28.6139],  # [longitude, latitude]
            city="New Delhi",
            state="Delhi",
            pincode="110001",
            landmark="Connaught Place"
        ),
        "images": []
    },
    {
        "title": "Water Leakage from Main Pipe",
        "description": "Water is leaking from the main water supply pipe near our house. It's wasting water and causing waterlogging.",
        "category": GrievanceCategory.UTILITIES,
        "priority": GrievancePriority.HIGH,
        "location": Location(
            address="Karol Bagh, New Delhi",
            coordinates=[77.3910, 28.5355],  # [longitude, latitude]
            city="New Delhi",
            state="Delhi",
            pincode="110005",
            landmark="Karol Bagh Market"
        ),
        "images": []
    },
    {
        "title": "Broken Traffic Signal",
        "description": "The traffic signal at the intersection is not working properly, causing traffic chaos during peak hours.",
        "category": GrievanceCategory.TRANSPORTATION,
        "priority": GrievancePriority.MEDIUM,
        "location": Location(
            address="India Gate, New Delhi",
            coordinates=[77.2090, 28.6139],  # [longitude, latitude]
            city="New Delhi",
            state="Delhi",
            pincode="110003",
            landmark="India Gate"
        ),
        "images": []
    },
    {
        "title": "Garbage Not Being Collected",
        "description": "Garbage collection has stopped in our area for the past week. The bins are overflowing and causing health issues.",
        "category": GrievanceCategory.ENVIRONMENT,
        "priority": GrievancePriority.MEDIUM,
        "location": Location(
            address="Lajpat Nagar, New Delhi",
            coordinates=[77.3910, 28.5355],  # [longitude, latitude]
            city="New Delhi",
            state="Delhi",
            pincode="110024",
            landmark="Lajpat Nagar Market"
        ),
        "images": []
    }
]

async def setup_indian_demo():
    """Setup Indian-style demo data"""
    try:
        print("🇮🇳 Setting up Indian-style demo data...")
        
        # Connect to database
        await connect_to_mongo()
        db = get_database()
        
        # Clean existing data
        print("🧹 Cleaning existing data...")
        for collection_name in ["users", "notifications", "grievances", "departments"]:
            await db.drop_collection(collection_name)
            print(f"   ✅ Dropped collection: {collection_name}")
        
        # Create departments
        print("🏢 Creating departments...")
        departments = []
        for dept_data in INDIAN_DEPARTMENTS:
            dept_doc = {
                **dept_data,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "total_grievances": 0,
                "resolved_grievances": 0,
                "avg_resolution_time": None
            }
            result = await db.departments.insert_one(dept_doc)
            departments.append(DepartmentInDB(**{**dept_doc, "_id": str(result.inserted_id)}))
            print(f"   ✅ Created department: {dept_data['name']}")
        print(f"✅ Created {len(departments)} departments")
        
        # Create demo users
        print("👥 Creating demo users...")
        created_users = {}
        for user_data in INDIAN_DEMO_USERS:
            try:
                hashed_password = get_password_hash(user_data["password"])
                user_doc = {
                    "email": user_data["email"],
                    "full_name": user_data["full_name"],
                    "phone": user_data.get("phone"),
                    "role": user_data["role"],
                    "department": user_data.get("department"),
                    "status": user_data["status"],
                    "hashed_password": hashed_password,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "is_verified": True
                }
                result = await db.users.insert_one(user_doc)
                created_users[user_data["email"]] = str(result.inserted_id)
                print(f"   ✅ Created user: {user_data['full_name']} ({user_data['role']}) - {user_data.get('department', 'N/A')}")
            except Exception as e:
                print(f"   ❌ Error creating user {user_data['email']}: {e}")
        print(f"✅ Created {len(created_users)} demo users")
        
        # Create sample grievances
        print("📝 Creating sample grievances...")
        auto_assignment_service = AutoAssignmentService()
        
        # Get citizen users
        citizen_users = [email for email, user_id in created_users.items() 
                        if email in ["rajesh.kumar@demo.com", "priya.sharma@demo.com", "amit.singh@demo.com"]]
        
        for i, grievance_data in enumerate(SAMPLE_GRIEVANCES):
            try:
                # Assign to random citizen
                citizen_email = random.choice(citizen_users)
                citizen_id = created_users[citizen_email]
                
                grievance_doc = {
                    "title": grievance_data["title"],
                    "description": grievance_data["description"],
                    "category": grievance_data["category"].value,
                    "priority": grievance_data["priority"].value,
                    "location": grievance_data["location"].dict(),
                    "images": [img.dict() for img in grievance_data["images"]],
                    "citizen_id": citizen_id,
                    "status": "pending",
                    "assigned_department": None,
                    "assigned_to": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "resolved_at": None,
                    "ai_analysis": None,
                    "comments": [],
                    "resolution_notes": None,
                    "estimated_resolution_date": None,
                    "citizen_satisfaction": None,
                    "citizen_feedback": None
                }
                
                result = await db.grievances.insert_one(grievance_doc)
                grievance_id = str(result.inserted_id)
                
                # Auto-assign grievance
                assignment_result = await auto_assignment_service.analyze_and_assign_grievance(
                    grievance_id=grievance_id,
                    images=grievance_data["images"],
                    title=grievance_data["title"],
                    description=grievance_data["description"],
                    citizen_name=citizen_email.split('@')[0].replace('.', ' ').title(),
                    db=db
                )
                
                if assignment_result["success"]:
                    await db.grievances.update_one(
                        {"_id": result.inserted_id},
                        {"$set": {
                            "assigned_department": assignment_result["assigned_department"],
                            "ai_analysis": assignment_result["ai_analysis"],
                            "updated_at": datetime.utcnow()
                        }}
                    )
                    print(f"   ✅ Created grievance: {grievance_data['title']} -> {assignment_result['assigned_department']}")
                else:
                    print(f"   ❌ Failed to auto-assign grievance {grievance_data['title']}: {assignment_result['message']}")
                    
            except Exception as e:
                print(f"   ❌ Error creating grievance {grievance_data['title']}: {e}")
        
        print(f"✅ Created {len(SAMPLE_GRIEVANCES)} sample grievances")
        
        # Print summary
        print("\n🎉 Indian-style demo data setup completed successfully!")
        print("\n📋 Demo Accounts Created:")
        print("=" * 50)
        
        # Citizens
        print("👥 Citizens:")
        for user_data in INDIAN_DEMO_USERS:
            if user_data["role"] == "citizen":
                print(f"  - {user_data['full_name']} ({user_data['email']}) / {user_data['password']}")
        
        # Admin
        print("\n👨‍💼 Admin:")
        for user_data in INDIAN_DEMO_USERS:
            if user_data["role"] == "admin":
                print(f"  - {user_data['full_name']} ({user_data['email']}) / {user_data['password']}")
        
        # Department Heads
        print("\n🏢 Department Heads:")
        for user_data in INDIAN_DEMO_USERS:
            if user_data["role"] == "department_head":
                print(f"  - {user_data['full_name']} ({user_data['email']}) / {user_data['password']}")
                print(f"    Department: {user_data['department']}")
        
        print("\n📝 Sample Grievances Created:")
        print("=" * 50)
        for grievance_data in SAMPLE_GRIEVANCES:
            print(f"  - {grievance_data['title']}")
        
        print("\n🚀 You can now test the application with these accounts!")
        
    except Exception as e:
        print(f"❌ Error setting up demo data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(setup_indian_demo())
