"""
Test script to verify the new backend structure
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all modules can be imported"""
    try:
        print("Testing imports...")
        
        # Test core modules
        from app.core.config import settings
        print("✅ Config imported successfully")
        
        from app.core.database import connect_to_mongo
        print("✅ Database imported successfully")
        
        from app.core.security import create_access_token
        print("✅ Security imported successfully")
        
        # Test models
        from app.models.user import UserCreate
        print("✅ User models imported successfully")
        
        from app.models.grievance import GrievanceCreate
        print("✅ Grievance models imported successfully")
        
        # Test services
        from app.services.auth_service import AuthService
        print("✅ Auth service imported successfully")
        
        from app.services.image_service import ImageService
        print("✅ Image service imported successfully")
        
        from app.services.ai_service import AIService
        print("✅ AI service imported successfully")
        
        # Test API
        from app.api.v1.api import api_router
        print("✅ API router imported successfully")
        
        print("\n🎉 All imports successful! The new structure is working.")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_config():
    """Test configuration"""
    try:
        from app.core.config import settings
        print(f"\nConfiguration test:")
        print(f"  - API Version: {settings.API_V1_STR}")
        print(f"  - Database: {settings.DATABASE_NAME}")
        print(f"  - CORS Origins: {settings.ALLOWED_HOSTS}")
        return True
    except Exception as e:
        print(f"❌ Config error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Civic Connect Backend Structure")
    print("=" * 50)
    
    success = True
    success &= test_imports()
    success &= test_config()
    
    if success:
        print("\n✅ All tests passed! Ready to run the API.")
        print("\nTo start the API, run:")
        print("  python run.py")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)
