#!/usr/bin/env python3
"""
Script to check mapping between fabric codes in source and files in Google Drive
"""

import requests
import json
import re
from typing import List, Dict, Set

# Google Drive API configuration
API_KEY = "AIzaSyBijqu8qSHhahlsk5Y4EPZMC81Y4d4wThM"
DRIVE_API_BASE = "https://www.googleapis.com/drive/v3"

# Subfolder IDs
SUBFOLDERS = [
    "1N0kD1XzoQ2quVLgPwywZBVkMGyebECif",  # Ảnh vải - Phần 1
    "1GKq_J5Xd_93docDHgKABeg85lqyksz22"   # Ảnh vải - Phần 2
]

def load_fabric_codes_from_csv(csv_path: str = "../public/fabric_inventory_updated.csv") -> List[str]:
    """Load fabric codes from CSV file"""
    import csv
    import os

    # Get absolute path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(script_dir, csv_path)

    fabric_codes = []

    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                code = row.get('Ma_hang', '').strip()
                if code:
                    fabric_codes.append(code)

        print(f"📋 Loaded {len(fabric_codes)} fabric codes from CSV")
        return fabric_codes

    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        # Fallback to sample data
        return [
            "3 PASS BO - WHITE - COL 15",
            "33139-2-270",
            "71022-10",
            "71022-7",
            "8015-1",
            "8059",
            "99-129-39",
            "A9003-5",
            "AS22541-5",
            "AS22878-7"
        ]

def get_files_from_folder(folder_id: str) -> List[Dict]:
    """Get all files from a Google Drive folder"""
    files = []
    next_page_token = None
    
    while True:
        params = {
            'key': API_KEY,
            'q': f"'{folder_id}' in parents and trashed=false",
            'fields': 'nextPageToken,files(id,name,size,mimeType,modifiedTime)',
            'pageSize': 1000
        }
        
        if next_page_token:
            params['pageToken'] = next_page_token
            
        response = requests.get(f"{DRIVE_API_BASE}/files", params=params)
        
        if response.status_code != 200:
            print(f"❌ Error accessing folder {folder_id}: {response.status_code}")
            break
            
        data = response.json()
        files.extend(data.get('files', []))
        
        next_page_token = data.get('nextPageToken')
        if not next_page_token:
            break
    
    return files

def extract_fabric_code_from_filename(filename: str) -> str:
    """Extract fabric code from filename (remove extension)"""
    # Remove file extension
    name_without_ext = re.sub(r'\.(jpg|jpeg|png|webp|gif)$', '', filename, flags=re.IGNORECASE)
    return name_without_ext.strip()

def is_image_file(filename: str) -> bool:
    """Check if file is an image"""
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    return any(filename.lower().endswith(ext) for ext in image_extensions)

def analyze_mapping():
    """Analyze mapping between fabric codes and Drive files"""
    print("🔍 CHECKING FABRIC CODE MAPPING")
    print("=" * 50)

    # Load fabric codes from CSV
    fabric_codes = load_fabric_codes_from_csv()
    
    # Get all files from subfolders
    all_drive_files = []
    
    for i, folder_id in enumerate(SUBFOLDERS, 1):
        print(f"\n📁 Scanning Subfolder {i}: {folder_id}")
        files = get_files_from_folder(folder_id)
        image_files = [f for f in files if is_image_file(f['name'])]
        
        print(f"   Total files: {len(files)}")
        print(f"   Image files: {len(image_files)}")
        
        all_drive_files.extend(image_files)
    
    print(f"\n📊 TOTAL IMAGE FILES IN DRIVE: {len(all_drive_files)}")
    
    # Extract fabric codes from filenames
    drive_fabric_codes = set()
    filename_to_code = {}
    
    for file in all_drive_files:
        fabric_code = extract_fabric_code_from_filename(file['name'])
        drive_fabric_codes.add(fabric_code)
        filename_to_code[file['name']] = fabric_code
    
    # Convert source fabric codes to set
    source_fabric_codes = set(fabric_codes)
    
    print(f"📋 FABRIC CODES IN SOURCE: {len(source_fabric_codes)}")
    print(f"🖼️  FABRIC CODES IN DRIVE: {len(drive_fabric_codes)}")
    
    # Find matches and mismatches
    perfect_matches = source_fabric_codes & drive_fabric_codes
    missing_in_drive = source_fabric_codes - drive_fabric_codes
    extra_in_drive = drive_fabric_codes - source_fabric_codes
    
    print("\n" + "=" * 50)
    print("📈 MAPPING ANALYSIS RESULTS")
    print("=" * 50)
    
    print(f"\n✅ PERFECT MATCHES: {len(perfect_matches)}")
    if perfect_matches:
        for code in sorted(perfect_matches):
            print(f"   ✓ {code}")
    
    print(f"\n❌ MISSING IN DRIVE: {len(missing_in_drive)}")
    if missing_in_drive:
        for code in sorted(missing_in_drive):
            print(f"   ✗ {code}")
    
    print(f"\n⚠️  EXTRA IN DRIVE: {len(extra_in_drive)}")
    if extra_in_drive:
        for code in sorted(extra_in_drive):
            # Find the original filename
            original_filename = None
            for filename, extracted_code in filename_to_code.items():
                if extracted_code == code:
                    original_filename = filename
                    break
            print(f"   ? {code} (file: {original_filename})")
    
    # Calculate match percentage
    total_source = len(source_fabric_codes)
    matched = len(perfect_matches)
    match_percentage = (matched / total_source * 100) if total_source > 0 else 0
    
    print(f"\n📊 SUMMARY:")
    print(f"   Match rate: {matched}/{total_source} ({match_percentage:.1f}%)")
    print(f"   Missing images: {len(missing_in_drive)}")
    print(f"   Extra images: {len(extra_in_drive)}")
    
    return {
        'perfect_matches': perfect_matches,
        'missing_in_drive': missing_in_drive,
        'extra_in_drive': extra_in_drive,
        'match_percentage': match_percentage,
        'total_source': total_source,
        'total_drive': len(drive_fabric_codes)
    }

if __name__ == "__main__":
    try:
        results = analyze_mapping()
        
        if results['match_percentage'] >= 80:
            print(f"\n🎉 GOOD MAPPING! {results['match_percentage']:.1f}% match rate")
        elif results['match_percentage'] >= 50:
            print(f"\n⚠️  MODERATE MAPPING. {results['match_percentage']:.1f}% match rate")
        else:
            print(f"\n❌ POOR MAPPING. Only {results['match_percentage']:.1f}% match rate")
            
    except Exception as e:
        print(f"❌ Error: {e}")
