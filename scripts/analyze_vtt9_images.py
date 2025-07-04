#!/usr/bin/env python3
"""
Phân tích và mapping ảnh vải từ folder vtt9
Ninh ơi, script này sẽ:
1. Phân tích cấu trúc folder vtt9
2. Extract fabric codes từ tên file
3. So sánh với 331 mã vải hiện có
4. Tạo báo cáo mapping chi tiết
"""

import os
import re
import json
import shutil
from pathlib import Path
from collections import defaultdict

# Paths
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"
BACKUP_FOLDER = "/Users/nih/web app/khovaiton/backup_images"

# Supported image extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'}

def extract_fabric_code(filename):
    """
    Extract fabric code từ filename sử dụng logic giống fabricMappingChecker.ts
    Enhanced để handle các pattern trong vtt9
    """
    # Remove extension
    name = Path(filename).stem

    # Clean up common suffixes and prefixes
    name = re.sub(r'\s*\(.*?\)\s*', '', name)  # Remove (1), (copy), etc.
    name = re.sub(r'\s*-\s*copy\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*cankhoto\s*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\d{8}\s*$', '', name)  # Remove date suffixes

    # Handle specific patterns found in vtt9
    # Pattern: "07 013D -26" -> "07013D-26"
    name = re.sub(r'(\d+)\s+(\w+)\s*-\s*(\d+)', r'\1\2-\3', name)

    # Pattern: "10 780 -17" -> "10780-17"
    name = re.sub(r'(\d+)\s+(\d+)\s*-\s*(\d+)', r'\1\2-\3', name)

    # Pattern: "CADIZ FLE SURF 01" -> "CADIZ FLE SURF 01"
    # Keep spaces for multi-word codes

    # Normalize basic cleanup
    name = re.sub(r'\s+', ' ', name).strip()  # Normalize spaces

    # Try exact match first (for codes with spaces)
    if len(name) > 0:
        return name

    # Fallback: return original filename without extension
    return Path(filename).stem

def analyze_folder_structure():
    """Phân tích cấu trúc folder vtt9"""
    print("🔍 PHÂN TÍCH FOLDER VTT9")
    print("=" * 50)
    
    if not os.path.exists(VTT9_FOLDER):
        print(f"❌ Folder không tồn tại: {VTT9_FOLDER}")
        return None
    
    analysis = {
        'total_files': 0,
        'image_files': 0,
        'subfolders': {},
        'file_types': defaultdict(int),
        'sample_files': []
    }
    
    # Scan all files
    for root, dirs, files in os.walk(VTT9_FOLDER):
        folder_name = os.path.basename(root)
        
        if root == VTT9_FOLDER:
            folder_name = "root"
        
        if folder_name not in analysis['subfolders']:
            analysis['subfolders'][folder_name] = {
                'total_files': 0,
                'image_files': 0,
                'files': []
            }
        
        for file in files:
            if file.startswith('.'):
                continue
                
            analysis['total_files'] += 1
            analysis['subfolders'][folder_name]['total_files'] += 1
            analysis['subfolders'][folder_name]['files'].append(file)
            
            # Check if image
            ext = Path(file).suffix.lower()
            analysis['file_types'][ext] += 1
            
            if ext in IMAGE_EXTENSIONS:
                analysis['image_files'] += 1
                analysis['subfolders'][folder_name]['image_files'] += 1
                
                # Collect samples
                if len(analysis['sample_files']) < 20:
                    analysis['sample_files'].append(file)
    
    return analysis

def get_existing_fabric_codes():
    """Lấy danh sách 331 mã vải từ CSV file thật"""
    import csv

    fabric_codes = set()
    csv_file = "/Users/nih/web app/khovaiton/public/fabric_inventory_updated.csv"

    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                code = row.get('Ma_hang', '').strip()
                if code:
                    fabric_codes.add(code)

        print(f"📋 Loaded {len(fabric_codes)} fabric codes from CSV")
        return fabric_codes

    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        # Fallback to sample data
        return {
            "3 PASS BO - WHITE - COL 15", "33139-2-270", "71022-10", "71022-7",
            "8015-1", "8059", "99-129-39", "A9003-5", "AS22541-5", "B-1001"
        }

def normalize_for_comparison(text):
    """Normalize text for better comparison"""
    if not text:
        return ""

    # Convert to uppercase
    text = text.upper()

    # Remove common variations
    text = re.sub(r'[^\w\-]', '', text)  # Keep only alphanumeric and dash
    text = re.sub(r'\-+', '-', text)     # Normalize multiple dashes
    text = text.strip('-')               # Remove leading/trailing dashes

    return text

def calculate_similarity(str1, str2):
    """Calculate similarity between two strings"""
    if not str1 or not str2:
        return 0.0

    # Exact match
    if str1 == str2:
        return 1.0

    # Normalized match
    norm1 = normalize_for_comparison(str1)
    norm2 = normalize_for_comparison(str2)

    if norm1 == norm2:
        return 0.9

    # Substring match
    if norm1 in norm2 or norm2 in norm1:
        return 0.8

    # Partial match (common subsequence)
    common_chars = sum(1 for c in norm1 if c in norm2)
    max_len = max(len(norm1), len(norm2))

    if max_len > 0:
        return common_chars / max_len

    return 0.0

def map_images_to_fabric_codes():
    """Map ảnh với fabric codes sử dụng fuzzy matching"""
    print("\n🎯 MAPPING ẢNH VỚI MÃ VẢI")
    print("=" * 50)

    # Get existing fabric codes
    fabric_codes = get_existing_fabric_codes()
    print(f"📊 Tổng số mã vải: {len(fabric_codes)}")

    # Scan images
    image_mapping = {
        'matched': {},
        'unmatched': [],
        'missing_codes': set(fabric_codes.copy()),
        'similarity_scores': {}
    }

    for root, dirs, files in os.walk(VTT9_FOLDER):
        for file in files:
            ext = Path(file).suffix.lower()
            if ext not in IMAGE_EXTENSIONS:
                continue

            # Extract fabric code
            extracted_code = extract_fabric_code(file)

            # Find best match using similarity
            best_match = None
            best_score = 0.0

            for fabric_code in fabric_codes:
                score = calculate_similarity(extracted_code, fabric_code)

                if score > best_score and score >= 0.7:  # Minimum 70% similarity
                    best_score = score
                    best_match = fabric_code

            if best_match:
                # Only keep the best match for each fabric code
                if best_match not in image_mapping['matched'] or \
                   best_score > image_mapping['similarity_scores'].get(best_match, 0):

                    image_mapping['matched'][best_match] = {
                        'file': file,
                        'path': os.path.join(root, file),
                        'extracted_code': extracted_code,
                        'similarity': best_score
                    }
                    image_mapping['similarity_scores'][best_match] = best_score
                    image_mapping['missing_codes'].discard(best_match)
            else:
                image_mapping['unmatched'].append({
                    'file': file,
                    'path': os.path.join(root, file),
                    'extracted_code': extracted_code
                })

    return image_mapping

def generate_report(analysis, mapping):
    """Tạo báo cáo chi tiết"""
    print("\n📋 BÁO CÁO PHÂN TÍCH VTT9")
    print("=" * 50)
    
    # Folder structure
    print(f"📁 Tổng số file: {analysis['total_files']}")
    print(f"🖼️ Tổng số ảnh: {analysis['image_files']}")
    print(f"📂 Số subfolder: {len(analysis['subfolders'])}")
    
    print("\n📊 Phân bố theo subfolder:")
    for folder, data in analysis['subfolders'].items():
        print(f"   • {folder}: {data['image_files']} ảnh / {data['total_files']} file")
    
    print("\n📄 Phân bố theo định dạng:")
    for ext, count in analysis['file_types'].items():
        if ext in IMAGE_EXTENSIONS:
            print(f"   • {ext}: {count} file")
    
    # Mapping results
    matched_count = len(mapping['matched'])
    unmatched_count = len(mapping['unmatched'])
    missing_count = len(mapping['missing_codes'])
    total_fabric_codes = matched_count + missing_count
    
    coverage_percent = (matched_count / total_fabric_codes) * 100
    
    print(f"\n🎯 KẾT QUẢ MAPPING:")
    print(f"   ✅ Matched: {matched_count}/{total_fabric_codes} ({coverage_percent:.1f}%)")
    print(f"   ❌ Unmatched: {unmatched_count} ảnh")
    print(f"   ⚠️ Missing: {missing_count} mã vải")
    
    # Sample matched files
    print(f"\n📋 Mẫu ảnh đã match (10 đầu tiên):")
    for i, (code, data) in enumerate(list(mapping['matched'].items())[:10]):
        print(f"   • {code} ← {data['file']}")
    
    # Sample unmatched files
    if mapping['unmatched']:
        print(f"\n⚠️ Mẫu ảnh chưa match (10 đầu tiên):")
        for i, data in enumerate(mapping['unmatched'][:10]):
            print(f"   • {data['extracted_code']} ← {data['file']}")
    
    return {
        'total_images': analysis['image_files'],
        'matched_count': matched_count,
        'unmatched_count': unmatched_count,
        'missing_count': missing_count,
        'coverage_percent': coverage_percent
    }

def main():
    """Main function"""
    print("🚀 BẮT ĐẦU PHÂN TÍCH VTT9 IMAGES")
    print("=" * 60)
    
    # Step 1: Analyze folder structure
    analysis = analyze_folder_structure()
    if not analysis:
        return
    
    # Step 2: Map images to fabric codes
    mapping = map_images_to_fabric_codes()
    
    # Step 3: Generate report
    report = generate_report(analysis, mapping)
    
    print(f"\n🎉 HOÀN THÀNH PHÂN TÍCH!")
    print(f"📊 Tỷ lệ coverage: {report['coverage_percent']:.1f}%")
    print(f"🖼️ Sẵn sàng tích hợp {report['matched_count']} ảnh vào web app")

if __name__ == "__main__":
    main()
