#!/usr/bin/env python3
"""
Google Drive Sync Script
Ninh ơi, script này download ảnh từ Google Drive về local folder
"""

import os
import sys
import requests
import json
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import time

# Configuration
DRIVE_FOLDER_ID = "1YiRnl2CfccL6rH98S8UlWexgckV_dnbU"
LOCAL_IMAGES_DIR = "public/images/fabrics"
SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

def extract_folder_id_from_url(url):
    """Extract folder ID from Google Drive URL"""
    if '/folders/' in url:
        return url.split('/folders/')[1].split('?')[0]
    return None

def get_drive_files_list(folder_id):
    """
    Get list of files from Google Drive folder using public API
    Note: Requires the folder to be publicly accessible
    """
    try:
        # Use Google Drive API v3 (requires API key for production)
        # For now, we'll use a different approach with gdown
        print(f"📁 Scanning Google Drive folder: {folder_id}")
        
        # Alternative: Use gdown to list files (if folder is public)
        import subprocess
        
        # Try to use gdown if available
        try:
            result = subprocess.run([
                'gdown', '--folder', f'https://drive.google.com/drive/folders/{folder_id}',
                '--remaining-ok', '--quiet'
            ], capture_output=True, text=True, cwd='/tmp')
            
            if result.returncode == 0:
                print("✅ Successfully accessed Drive folder")
                return True
            else:
                print(f"❌ gdown failed: {result.stderr}")
                return False
                
        except FileNotFoundError:
            print("❌ gdown not installed. Installing...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'gdown'])
            return get_drive_files_list(folder_id)
            
    except Exception as e:
        print(f"❌ Error accessing Drive folder: {e}")
        return False

def download_drive_folder(folder_id, output_dir):
    """Download entire Google Drive folder using gdown"""
    try:
        import subprocess
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"📥 Downloading from Drive folder to: {output_dir}")
        
        # Use gdown to download entire folder
        result = subprocess.run([
            'gdown', '--folder', 
            f'https://drive.google.com/drive/folders/{folder_id}',
            '-O', output_dir,
            '--remaining-ok'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Download completed successfully")
            return True
        else:
            print(f"❌ Download failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error downloading: {e}")
        return False

def filter_image_files(directory):
    """Filter and organize image files"""
    image_files = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                image_files.append(file_path)
    
    return image_files

def organize_images(source_dir, target_dir):
    """Organize downloaded images into proper structure"""
    try:
        image_files = filter_image_files(source_dir)
        
        if not image_files:
            print("❌ No image files found")
            return False
        
        print(f"📋 Found {len(image_files)} image files")
        
        # Ensure target directory exists
        os.makedirs(target_dir, exist_ok=True)
        
        success_count = 0
        error_count = 0
        
        for image_file in image_files:
            try:
                # Copy to target directory with original name
                target_path = Path(target_dir) / image_file.name
                
                # Copy file
                import shutil
                shutil.copy2(image_file, target_path)
                
                print(f"✅ Copied: {image_file.name}")
                success_count += 1
                
            except Exception as e:
                print(f"❌ Failed to copy {image_file.name}: {e}")
                error_count += 1
        
        print(f"\n📊 Summary:")
        print(f"✅ Success: {success_count}")
        print(f"❌ Errors: {error_count}")
        
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Error organizing images: {e}")
        return False

def check_fabric_mapping(images_dir, csv_file="fabric_inventory_updated.csv"):
    """Check which fabric codes have matching images"""
    try:
        import pandas as pd
        
        # Read fabric codes from CSV
        df = pd.read_csv(csv_file)
        fabric_codes = df['Ma_hang'].tolist()
        
        # Get image files
        image_files = list(Path(images_dir).glob('*'))
        image_names = [f.stem for f in image_files if f.suffix.lower() in SUPPORTED_EXTENSIONS]
        
        # Check mapping
        mapped_count = 0
        unmapped_codes = []
        
        for code in fabric_codes:
            if code in image_names:
                mapped_count += 1
            else:
                unmapped_codes.append(code)
        
        print(f"\n🎯 Mapping Report:")
        print(f"📊 Total fabrics: {len(fabric_codes)}")
        print(f"✅ With images: {mapped_count}")
        print(f"❌ Without images: {len(unmapped_codes)}")
        print(f"📈 Coverage: {mapped_count/len(fabric_codes)*100:.1f}%")
        
        if unmapped_codes[:10]:  # Show first 10 missing
            print(f"\n❌ Missing images (first 10):")
            for code in unmapped_codes[:10]:
                print(f"   • {code}")
        
        return mapped_count, len(unmapped_codes)
        
    except Exception as e:
        print(f"❌ Error checking mapping: {e}")
        return 0, 0

def main():
    """Main sync function"""
    print("🚀 Starting Google Drive sync...")
    print(f"📁 Drive folder ID: {DRIVE_FOLDER_ID}")
    print(f"📂 Local target: {LOCAL_IMAGES_DIR}")
    
    # Create temporary download directory
    temp_dir = "/tmp/drive_download"
    
    try:
        # Step 1: Download from Drive
        print("\n📥 Step 1: Downloading from Google Drive...")
        if not download_drive_folder(DRIVE_FOLDER_ID, temp_dir):
            print("❌ Failed to download from Drive")
            return False
        
        # Step 2: Organize images
        print("\n📁 Step 2: Organizing images...")
        if not organize_images(temp_dir, LOCAL_IMAGES_DIR):
            print("❌ Failed to organize images")
            return False
        
        # Step 3: Check mapping
        print("\n🎯 Step 3: Checking fabric mapping...")
        check_fabric_mapping(LOCAL_IMAGES_DIR)
        
        print("\n🎉 Sync completed successfully!")
        print(f"📂 Images saved to: {LOCAL_IMAGES_DIR}")
        print("💡 Refresh your web app to see the images")
        
        return True
        
    except Exception as e:
        print(f"❌ Sync failed: {e}")
        return False
    
    finally:
        # Cleanup temp directory
        try:
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
        except:
            pass

if __name__ == "__main__":
    # Check if running from correct directory
    if not os.path.exists("package.json"):
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Install required packages
    try:
        import pandas
        import gdown
    except ImportError:
        print("📦 Installing required packages...")
        import subprocess
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pandas', 'gdown'])
    
    # Run sync
    success = main()
    sys.exit(0 if success else 1)
