#!/usr/bin/env python3
"""
Sync uploaded images vào web app
"""

import os
import shutil
from pathlib import Path

UPLOAD_FOLDER = "/Users/nih/web app/khovaiton/upload_missing_images"
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"

def sync_uploaded_images():
    """Sync ảnh từ upload folders vào web app"""
    print("🔄 SYNCING UPLOADED IMAGES")
    print("=" * 50)
    
    total_synced = 0
    
    # Scan all priority folders
    for folder_name in ['high_priority', 'medium_priority', 'low_priority', 'special_cases']:
        folder_path = os.path.join(UPLOAD_FOLDER, folder_name)
        
        if not os.path.exists(folder_path):
            continue
        
        print(f"\n📁 Processing {folder_name}...")
        synced_in_folder = 0
        
        for filename in os.listdir(folder_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')) and filename != 'INSTRUCTIONS.txt':
                source_path = os.path.join(folder_path, filename)
                target_path = os.path.join(WEB_APP_IMAGES, filename)
                
                try:
                    # Copy to web app
                    shutil.copy2(source_path, target_path)
                    print(f"   ✅ Synced: {filename}")
                    synced_in_folder += 1
                    total_synced += 1
                    
                    # Move to processed folder
                    processed_folder = os.path.join(folder_path, 'processed')
                    os.makedirs(processed_folder, exist_ok=True)
                    shutil.move(source_path, os.path.join(processed_folder, filename))
                    
                except Exception as e:
                    print(f"   ❌ Error syncing {filename}: {e}")
        
        print(f"   📊 Synced {synced_in_folder} images from {folder_name}")
    
    print(f"\n🎉 SYNC COMPLETE!")
    print(f"📊 Total synced: {total_synced} images")
    print(f"🔄 Restart web app để xem ảnh mới")

if __name__ == "__main__":
    sync_uploaded_images()
