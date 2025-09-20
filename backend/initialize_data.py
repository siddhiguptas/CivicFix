"""
Data initialization script for Civic Connect
This script initializes departments and demo users
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.services.auth_service import AuthService
from app.models.department import DepartmentInDB, DepartmentResponse

# Default departments for Indian civic issues
DEFAULT_DEPARTMENTS = [
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
        "description": "Manages sanitation, waste management, and local civic services",
        "contact_email": "municipal@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6790",
        "head_name": "Municipal Commissioner",
        "categories": ["sanitation", "waste", "garbage", "drainage", "cleaning"],
        "status": "active"
    },
    {
        "name": "Electricity Department",
        "description": "Handles street lighting, power infrastructure, and electrical issues",
        "contact_email": "electricity@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6791",
        "head_name": "Chief Electrical Engineer",
        "categories": ["utilities", "street_lights", "power", "electrical", "lighting"],
        "status": "active"
    },
    {
        "name": "Transport Department",
        "description": "Manages traffic signals, road signs, and transportation infrastructure",
        "contact_email": "transport@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6792",
        "head_name": "Transport Commissioner",
        "categories": ["transportation", "traffic", "signals", "signs", "parking"],
        "status": "active"
    },
    {
        "name": "Water Supply Department",
        "description": "Handles water supply, drainage, and water-related infrastructure",
        "contact_email": "water@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6793",
        "head_name": "Chief Water Engineer",
        "categories": ["water", "drainage", "sewage", "flooding", "supply"],
        "status": "active"
    },
    {
        "name": "Police Department",
        "description": "Handles safety, security, and law enforcement related issues",
        "contact_email": "police@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6794",
        "head_name": "Police Commissioner",
        "categories": ["safety", "security", "crime", "traffic_violations", "emergency"],
        "status": "active"
    },
    {
        "name": "Environment Department",
        "description": "Manages environmental issues, pollution, and green initiatives",
        "contact_email": "environment@civicconnect.gov.in",
        "contact_phone": "+91-11-2345-6795",
        "head_name": "Environment Commissioner",
        "categories": ["environment", "pollution", "green", "trees", "air_quality"],
        "status": "active"
    }
]

async def initialize_departments(db):
    """Initialize default departments"""
    try:
        print("Initializing departments...")
        
        # Check if departments already exist
        existing_count = await db.departments.count_documents({})
        if existing_count > 0:
            print(f"✅ {existing_count} departments already exist")
            return
        
        # Create departments
        departments = []
        for dept_data in DEFAULT_DEPARTMENTS:
            dept_doc = {
                **dept_data,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "total_grievances": 0,
                "resolved_grievances": 0,
                "avg_resolution_time": None
            }
            
            result = await db.departments.insert_one(dept_doc)
            dept_doc["_id"] = str(result.inserted_id)
            departments.append(DepartmentInDB(**dept_doc))
        
        print(f"✅ Initialized {len(departments)} departments")
        return departments
        
    except Exception as e:
        print(f"❌ Error initializing departments: {e}")
        raise

async def initialize_demo_users(db):
    """Initialize demo users"""
    try:
        print("Initializing demo users...")
        
        auth_service = AuthService()
        result = await auth_service.create_demo_users()
        
        print(f"✅ Created {len(result)} demo users")
        for email, user_id in result.items():
            print(f"   - {email}: {user_id}")
        
        return result
        
    except Exception as e:
        print(f"❌ Error initializing demo users: {e}")
        raise

async def main():
    """Main initialization function"""
    try:
        print("🚀 Starting Civic Connect data initialization...")
        
        # Connect to database
        await connect_to_mongo()
        db = get_database()
        
        # Initialize departments
        await initialize_departments(db)
        
        # Initialize demo users
        await initialize_demo_users(db)
        
        print("\n🎉 Data initialization completed successfully!")
        print("\nDemo accounts created:")
        print("  Citizen: citizen@demo.com / password123")
        print("  Admin: admin@demo.com / password123")
        print("  Department Heads:")
        print("    - head1@demo.com (PWD) / password123")
        print("    - head2@demo.com (Municipal) / password123")
        print("    - head3@demo.com (Electricity) / password123")
        print("    - head4@demo.com (Transport) / password123")
        print("    - head5@demo.com (Water) / password123")
        print("    - head6@demo.com (Police) / password123")
        print("    - head7@demo.com (Environment) / password123")
        
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        sys.exit(1)
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
