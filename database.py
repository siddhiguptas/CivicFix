# database.py
import os
import pymongo
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class ImageClassificationDB:
    def __init__(self):
        """Connect to MongoDB"""
        try:
            # Get MongoDB connection string
            mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            print(f"Connecting to MongoDB at: {mongodb_uri}")
            
            # Connect to MongoDB
            self.client = pymongo.MongoClient(mongodb_uri)
            
            # Select database and collection
            self.db = self.client['city_issues_db']
            self.collection = self.db['image_classifications']
            
            # Test connection
            self.client.server_info()
            print("✅ Successfully connected to MongoDB!")
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    def save_classification(self, image_path, classification_result, metadata=None):
        """Save classification result to MongoDB"""
        try:
            # Create document to save
            document = {
                'image_path': image_path,
                'classification': {
                    'category': classification_result.get('category', 'Unknown'),
                    'confidence': classification_result.get('confidence', 0.0),
                    'labels': classification_result.get('labels', [])
                },
                'created_at': datetime.utcnow(),
                'status': 'pending'  # Can be: pending, in_progress, resolved
            }
            
            # Add extra information if provided
            if metadata:
                document.update({
                    'location': metadata.get('location', ''),
                    'description': metadata.get('description', ''),
                    'reporter_name': metadata.get('reporter_name', 'Anonymous')
                })
            
            # Save to MongoDB
            result = self.collection.insert_one(document)
            print(f"✅ Saved classification with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            print(f"❌ Error saving to database: {e}")
            return None
    
    def get_all_classifications(self):
        """Get all classifications from database"""
        try:
            # Get all documents, newest first
            cursor = self.collection.find().sort('created_at', -1)
            
            results = []
            for doc in cursor:
                doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
                results.append(doc)
            
            return results
        except Exception as e:
            print(f"❌ Error getting classifications: {e}")
            return []
    
    def get_stats(self):
        """Get simple statistics"""
        try:
            total = self.collection.count_documents({})
            
            # Count by category
            categories = {}
            for doc in self.collection.find():
                cat = doc.get('classification', {}).get('category', 'Unknown')
                categories[cat] = categories.get(cat, 0) + 1
            
            return {
                'total': total,
                'by_category': categories
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {'total': 0, 'by_category': {}}