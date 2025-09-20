import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import json

def dms_to_decimal(dms, ref):
    """Convert DMS (degrees, minutes, seconds) to decimal degrees"""
    degrees = dms[0]
    minutes = dms[1] / 60.0
    seconds = dms[2] / 3600.0
    
    decimal = degrees + minutes + seconds
    
    if ref in ['S', 'W']:
        decimal = -decimal
    
    return decimal

def extract_gps_data(exif_data):
    """Extract GPS coordinates from EXIF data"""
    gps_data = {}
    
    if 'GPSInfo' not in exif_data:
        return None
    
    gps_info = exif_data['GPSInfo']
    
    # Get GPS coordinates
    if 1 in gps_info and 2 in gps_info and 3 in gps_info and 4 in gps_info:
        # Latitude
        lat_dms = gps_info[2]
        lat_ref = gps_info[1]
        latitude = dms_to_decimal(lat_dms, lat_ref)
        
        # Longitude  
        lon_dms = gps_info[4]
        lon_ref = gps_info[3]
        longitude = dms_to_decimal(lon_dms, lon_ref)
        
        gps_data['latitude'] = latitude
        gps_data['longitude'] = longitude
    
    # Get altitude if available
    if 6 in gps_info and 5 in gps_info:
        altitude = float(gps_info[6])
        altitude_ref = gps_info[5]
        if altitude_ref == 1:  # Below sea level
            altitude = -altitude
        gps_data['altitude'] = altitude
    
    return gps_data if gps_data else None

def read_meta(image_path='./harsh.jpg'):
    """
    Read EXIF metadata from an image file
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Extracted metadata or error information
    """
    try:
        # Check if file exists first
        if not os.path.exists(image_path):
            print(f"File not found: {image_path}")
            print(f"Current directory: {os.getcwd()}")
            print("Make sure the image file is in the correct location.")
            return {"error": "File not found"}
        
        print(f"Found image: {image_path}")
        
        # Open image and extract EXIF data
        with Image.open(image_path) as image:
            # Get basic image info
            image_info = {
                'filename': os.path.basename(image_path),
                'format': image.format,
                'mode': image.mode,
                'size': image.size,
                'width': image.width,
                'height': image.height
            }
            
            # Get EXIF data
            exifdata = image.getexif()
            
            if not exifdata:
                print("No EXIF metadata found in this image.")
                return {
                    "image_info": image_info,
                    "exif_data": {},
                    "gps_data": None,
                    "message": "No EXIF metadata found"
                }
            
            # Process EXIF data
            metadata = {}
            
            for tag_id in exifdata:
                # Get the tag name, instead of human unreadable tag id
                tag = TAGS.get(tag_id, tag_id)
                data = exifdata.get(tag_id)
                
                # Decode bytes to string if necessary
                if isinstance(data, bytes):
                    try:
                        data = data.decode('utf-8')
                    except UnicodeDecodeError:
                        data = str(data)
                
                metadata[tag] = data
            
            # Extract GPS data
            gps_data = extract_gps_data(exifdata)
            
            # Display results
            print("All metadata:", json.dumps(metadata, indent=2, default=str))
            
            if gps_data and 'latitude' in gps_data and 'longitude' in gps_data:
                print(f"GPS: {gps_data['latitude']}, {gps_data['longitude']}")
                if 'altitude' in gps_data:
                    print(f"Altitude: {gps_data['altitude']} meters")
            else:
                print("No GPS data in this image.")
            
            return {
                "image_info": image_info,
                "exif_data": metadata,
                "gps_data": gps_data,
                "message": "Metadata extracted successfully"
            }
            
    except FileNotFoundError:
        error_msg = f"File not found: {image_path}"
        print(error_msg)
        print(f"Current directory: {os.getcwd()}")
        print("Make sure the image file is in the correct location.")
        return {"error": error_msg}
    
    except Exception as err:
        error_msg = f"Error reading metadata: {err}"
        print(error_msg)
        return {"error": error_msg}

def read_meta_detailed(image_path='./harsh.jpg'):
    """
    Read EXIF metadata with more detailed output formatting
    
    Args:
        image_path (str): Path to the image file
        
    Returns:
        dict: Detailed metadata information
    """
    result = read_meta(image_path)
    
    if "error" in result:
        return result
    
    print("\n" + "="*50)
    print("DETAILED METADATA ANALYSIS")
    print("="*50)
    
    # Image basic info
    image_info = result.get("image_info", {})
    print(f"\n📷 IMAGE INFORMATION:")
    print(f"   Filename: {image_info.get('filename', 'Unknown')}")
    print(f"   Format: {image_info.get('format', 'Unknown')}")
    print(f"   Dimensions: {image_info.get('width', 'Unknown')} x {image_info.get('height', 'Unknown')} pixels")
    print(f"   Mode: {image_info.get('mode', 'Unknown')}")
    
    # GPS Information
    gps_data = result.get("gps_data")
    if gps_data:
        print(f"\n📍 GPS LOCATION:")
        print(f"   Latitude: {gps_data['latitude']}")
        print(f"   Longitude: {gps_data['longitude']}")
        if 'altitude' in gps_data:
            print(f"   Altitude: {gps_data['altitude']} meters")
        print(f"   Google Maps: https://www.google.com/maps?q={gps_data['latitude']},{gps_data['longitude']}")
    else:
        print(f"\n📍 GPS LOCATION: Not available")
    
    # Camera Information
    exif_data = result.get("exif_data", {})
    if exif_data:
        print(f"\n📷 CAMERA DETAILS:")
        
        # Camera make and model
        make = exif_data.get('Make', 'Unknown')
        model = exif_data.get('Model', 'Unknown')
        print(f"   Camera: {make} {model}")
        
        # Date and time
        date_time = exif_data.get('DateTime', exif_data.get('DateTimeOriginal', 'Unknown'))
        print(f"   Date taken: {date_time}")
        
        # Camera settings
        if 'ISOSpeedRatings' in exif_data:
            print(f"   ISO: {exif_data['ISOSpeedRatings']}")
        
        if 'FNumber' in exif_data:
            print(f"   Aperture: f/{exif_data['FNumber']}")
        
        if 'ExposureTime' in exif_data:
            print(f"   Shutter Speed: {exif_data['ExposureTime']}s")
        
        if 'FocalLength' in exif_data:
            print(f"   Focal Length: {exif_data['FocalLength']}mm")
        
        # Software
        if 'Software' in exif_data:
            print(f"   Software: {exif_data['Software']}")
    
    return result

if __name__ == "__main__":
    # You can change the image path here or take it as input
    image_path = input("Enter image path (or press Enter for './harsh.jpg'): ").strip()
    if not image_path:
        image_path = './harsh.jpg'
    
    # Read metadata
    result = read_meta_detailed(image_path)
    
    # You can also call the simpler version:
    # result = read_meta(image_path)