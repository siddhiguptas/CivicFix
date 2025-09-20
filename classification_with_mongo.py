import os
from clarifai.client.model import Model
from database import ImageClassificationDB
from dotenv import load_dotenv

# Import the Python EXIF reader
from python_exif_reader import read_meta, extract_gps_data
from PIL import Image

# Load environment variables
load_dotenv()

# Initialize Clarifai
api_key = os.environ.get("CLARIFAI_PAT")
if not api_key:
    print("❌ CLARIFAI_PAT not found in environment variables!")
    exit(1)

model = Model(
    url="https://clarifai.com/clarifai/main/models/general-image-recognition",
    pat=api_key
)

# Initialize database
db = ImageClassificationDB()

categories = {
    "pothole": [
        "pothole", "crack", "hole", "asphalt", "road damage", "broken road",
        "pavement", "concrete", "street", "road", "surface", "damaged",
        "cracked", "broken", "deteriorated", "worn"
    ],
    "streetlight": [
        "street light", "lamp post", "streetlamp", "lamp", "light pole",
        "lighting", "pole", "post", "illumination", "street lamp",
        "outdoor light", "public light"
    ],
    "traffic_light": [
        "traffic light", "stoplight", "signal light", "signal", "red light",
        "yellow light", "green light", "pedestrian signal", "signal post",
        "traffic signal", "stop light", "traffic control", "intersection"
    ],
    "garbage": [
        "trash", "garbage", "waste", "dumpster", "litter", "rubbish",
        "debris", "refuse", "bin", "container", "dump", "junk"
    ],
    "waterlogging": [
        "flood", "puddle", "water", "drain", "flooding", "wet", "pool",
        "standing water", "accumulated water", "drainage", "overflow"
    ]
}

def extract_image_metadata(image_path):
    """
    Extract EXIF metadata using Python PIL library
    """
    try:
        print("📋 Extracting metadata using Python PIL...")
        metadata_result = read_meta(image_path)
        
        if "error" in metadata_result:
            return {"error": metadata_result["error"]}
        
        # Format the metadata for consistency with the previous structure
        formatted_metadata = {
            "gps": {},
            "camera": {},
            "datetime": {},
            "image_details": {},
            "camera_settings": {},
            "file_info": {},
            "raw_metadata": metadata_result.get("exif_data", {})
        }
        
        # Extract GPS data
        gps_data = metadata_result.get("gps_data")
        if gps_data:
            formatted_metadata["gps"] = {
                "latitude": gps_data.get("latitude"),
                "longitude": gps_data.get("longitude"),
                "altitude": gps_data.get("altitude")
            }
        
        # Extract camera info from EXIF data
        exif_data = metadata_result.get("exif_data", {})
        formatted_metadata["camera"] = {
            "make": exif_data.get("Make"),
            "model": exif_data.get("Model"),
            "software": exif_data.get("Software"),
            "lens_model": exif_data.get("LensModel")
        }
        
        # Extract datetime info
        formatted_metadata["datetime"] = {
            "original": exif_data.get("DateTimeOriginal"),
            "digitized": exif_data.get("DateTimeDigitized"),
            "modified": exif_data.get("DateTime")
        }
        
        # Extract image details
        image_info = metadata_result.get("image_info", {})
        formatted_metadata["image_details"] = {
            "width": image_info.get("width"),
            "height": image_info.get("height"),
            "format": image_info.get("format"),
            "mode": image_info.get("mode")
        }
        
        # Extract camera settings
        formatted_metadata["camera_settings"] = {
            "iso": exif_data.get("ISOSpeedRatings"),
            "aperture": exif_data.get("FNumber"),
            "shutter_speed": exif_data.get("ExposureTime"),
            "focal_length": exif_data.get("FocalLength"),
            "flash": exif_data.get("Flash"),
            "white_balance": exif_data.get("WhiteBalance")
        }
        
        # File info
        formatted_metadata["file_info"] = {
            "file_size": os.path.getsize(image_path) if os.path.exists(image_path) else None,
            "file_type": image_info.get("format"),
            "filename": image_info.get("filename")
        }
        
        return formatted_metadata
        
    except Exception as e:
        return {"error": f"Metadata extraction error: {str(e)}"}

def categorize_image(image_path, top_k=5):
    try:
        prediction = model.predict_by_filepath(image_path, input_type="image")
        concepts = prediction.outputs[0].data.concepts[:top_k]
        
        if not concepts:
            return {
                "labels": [],
                "category": "Uncategorized",
                "confidence": 0.0
            }
        
        labels = [c.name.lower() for c in concepts]
        confidences = {c.name.lower(): c.value for c in concepts}
        
        category_scores = {cat: 0 for cat in categories}
        
        for label in labels:
            for cat, keywords in categories.items():
                if label in keywords:
                    category_scores[cat] += confidences[label]
        
        if max(category_scores.values()) == 0:
            assigned_category = "Uncategorized"
            confidence = 0.0
        else:
            assigned_category = max(category_scores, key=category_scores.get)
            confidence = category_scores[assigned_category]
        
        return {
            "labels": [(c.name, f"{c.value*100:.2f}%") for c in concepts],
            "category": assigned_category,
            "confidence": confidence
        }
        
    except Exception as e:
        print(f"❌ Classification error: {e}")
        return {
            "labels": [],
            "category": "Error",
            "confidence": 0.0,
            "error": str(e)
        }

def classify_and_save(image_path, location="", description="", reporter_name=""):
    print(f"🔍 Analyzing image: {image_path}")
    
    # Step 1: Extract metadata using Python
    metadata = extract_image_metadata(image_path)
    
    # Step 2: Classify image
    result = categorize_image(image_path)
    
    # Step 3: Auto-detect location from GPS if not provided
    auto_location = location
    if not location and 'gps' in metadata and not metadata.get('error'):
        gps = metadata['gps']
        if gps.get('latitude') and gps.get('longitude'):
            auto_location = f"GPS: {gps['latitude']:.6f}, {gps['longitude']:.6f}"
            print(f"📍 Auto-detected GPS location: {auto_location}")
    
    # Step 4: Prepare metadata for database
    db_metadata = {
        'location': auto_location,
        'description': description,
        'reporter_name': reporter_name,
        'extracted_metadata': metadata
    }
    
    # Step 5: Save to database
    doc_id = db.save_classification(image_path, result, db_metadata)
    result['database_id'] = doc_id
    result['saved'] = doc_id is not None
    result['metadata'] = metadata
    result['auto_location'] = auto_location
    
    return result

def print_detailed_results(result):
    """Print comprehensive results including metadata"""
    print(f"\n{'='*60}")
    print(f"📊 COMPLETE IMAGE ANALYSIS RESULTS")
    print(f"{'='*60}")
    
    # Classification results
    print(f"\n🤖 CLASSIFICATION:")
    print(f"   Category: {result['category']}")
    print(f"   Confidence: {result['confidence']:.2%}")
    
    if result.get('labels'):
        print(f"   Detected labels:")
        for label, confidence in result['labels']:
            print(f"     • {label}: {confidence}")
    
    # Metadata results
    print(f"\n📋 METADATA:")
    metadata = result.get('metadata', {})
    
    if metadata.get('error'):
        print(f"   ❌ Error: {metadata['error']}")
    else:
        # GPS Information
        gps = metadata.get('gps', {})
        if gps.get('latitude') and gps.get('longitude'):
            print(f"   📍 GPS Location: {gps['latitude']:.6f}, {gps['longitude']:.6f}")
            if gps.get('altitude'):
                print(f"   📍 Altitude: {gps['altitude']} meters")
            print(f"   🌍 Google Maps: https://www.google.com/maps?q={gps['latitude']},{gps['longitude']}")
        else:
            print(f"   📍 GPS Location: Not available")
        
        # Camera Information
        camera = metadata.get('camera', {})
        if any(camera.values()):
            make = camera.get('make', 'Unknown')
            model = camera.get('model', '')
            print(f"   📷 Camera: {make} {model}")
            if camera.get('software'):
                print(f"   📷 Software: {camera['software']}")
        
        # Date/Time
        datetime_info = metadata.get('datetime', {})
        date_taken = (datetime_info.get('original') or 
                     datetime_info.get('digitized') or 
                     datetime_info.get('modified'))
        if date_taken:
            print(f"   📅 Date taken: {date_taken}")
        
        # Image dimensions
        image_details = metadata.get('image_details', {})
        if image_details.get('width') and image_details.get('height'):
            print(f"   📐 Dimensions: {image_details['width']} x {image_details['height']} pixels")
        
        # Camera settings
        settings = metadata.get('camera_settings', {})
        settings_list = []
        if settings.get('iso'):
            settings_list.append(f"ISO {settings['iso']}")
        if settings.get('aperture'):
            settings_list.append(f"f/{settings['aperture']}")
        if settings.get('shutter_speed'):
            settings_list.append(f"{settings['shutter_speed']}s")
        if settings.get('focal_length'):
            settings_list.append(f"{settings['focal_length']}mm")
        
        if settings_list:
            print(f"   ⚙️  Camera Settings: {', '.join(settings_list)}")
    
    # Database info
    print(f"\n💾 DATABASE:")
    print(f"   Saved: {'✅ Yes' if result['saved'] else '❌ No'}")
    if result['saved']:
        print(f"   Database ID: {result['database_id']}")
    
    # Auto-detected location
    if result.get('auto_location'):
        print(f"   📍 Auto-detected location: {result['auto_location']}")

def show_all_reports():
    print("\n📋 All Reports:")
    print("=" * 50)
    reports = db.get_all_classifications()
    if not reports:
        print("No reports found.")
        return
    
    for i, report in enumerate(reports, 1):
        print(f"Report #{i}")
        print(f"  ID: {report['_id']}")
        print(f"  Image: {report['image_path']}")
        print(f"  Category: {report['classification']['category']}")
        print(f"  Confidence: {report['classification']['confidence']:.2%}")
        print(f"  Location: {report.get('location', 'N/A')}")
        print(f"  Status: {report.get('status', 'pending')}")
        print(f"  Date: {report['created_at']}")
        
        # Show GPS if available
        metadata = report.get('extracted_metadata', {})
        if metadata and not metadata.get('error'):
            gps = metadata.get('gps', {})
            if gps.get('latitude') and gps.get('longitude'):
                print(f"  GPS: {gps['latitude']:.6f}, {gps['longitude']:.6f}")
        
        print("-" * 30)

def show_stats():
    print("\n📊 Statistics:")
    print("=" * 30)
    stats = db.get_stats()
    print(f"Total Reports: {stats['total']}")
    print("\nBy Category:")
    for category, count in stats['by_category'].items():
        print(f"  {category}: {count}")

if __name__ == "__main__":
    print("🚀 Image Classification with Python Metadata Extraction")
    print("Using PIL (Pillow) for EXIF data extraction\n")
    
    # Take image path as input from user
    image_path = input("Please enter the image file path: ").strip()
    
    # Check if file exists
    if not os.path.exists(image_path):
        print(f"❌ Error: File '{image_path}' not found!")
        exit(1)
    
    # Optional: take additional metadata input
    print(f"\n📝 Optional information (press Enter to skip):")
    location = input("Enter location: ").strip()
    description = input("Enter description: ").strip()
    reporter_name = input("Enter reporter name: ").strip()
    
    # Classify and save
    result = classify_and_save(
        image_path=image_path,
        location=location,
        description=description,
        reporter_name=reporter_name
    )
    
    # Show detailed results
    print_detailed_results(result)
    
    # Show all reports
    show_all_reports()
    
    # Show statistics
    show_stats()