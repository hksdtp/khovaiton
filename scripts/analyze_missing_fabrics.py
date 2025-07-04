#!/usr/bin/env python3
"""
Phân tích chi tiết nguyên nhân thiếu 149 fabric codes sau tích hợp VTT9
Ninh ơi, script này sẽ:
1. Phân loại nguyên nhân thiếu ảnh
2. Cross-reference với ảnh VTT9 chưa match
3. Tìm potential matches với similarity thấp hơn
4. Đề xuất giải pháp cải thiện coverage
"""

import os
import re
import csv
from pathlib import Path
from collections import defaultdict
import json

# Import functions from previous scripts
import sys
sys.path.append(os.path.dirname(__file__))
from analyze_vtt9_images import (
    extract_fabric_code, 
    calculate_similarity,
    get_existing_fabric_codes,
    map_images_to_fabric_codes,
    IMAGE_EXTENSIONS
)

# Paths
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"
CSV_FILE = "/Users/nih/web app/khovaiton/public/fabric_inventory_updated.csv"

def get_current_coverage():
    """Lấy thông tin coverage hiện tại"""
    print("📊 PHÂN TÍCH COVERAGE HIỆN TẠI")
    print("=" * 50)
    
    # Get all fabric codes
    fabric_codes = get_existing_fabric_codes()
    
    # Get images in web app
    if not os.path.exists(WEB_APP_IMAGES):
        print("❌ Thư mục images không tồn tại")
        return None, None, None
    
    image_files = [f for f in os.listdir(WEB_APP_IMAGES) 
                   if Path(f).suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}]
    
    # Find which fabric codes have images
    codes_with_images = set()
    codes_without_images = set(fabric_codes)
    
    for image_file in image_files:
        fabric_code = Path(image_file).stem
        if fabric_code in fabric_codes:
            codes_with_images.add(fabric_code)
            codes_without_images.discard(fabric_code)
    
    coverage = len(codes_with_images) / len(fabric_codes) * 100
    
    print(f"📈 Coverage hiện tại: {len(codes_with_images)}/{len(fabric_codes)} ({coverage:.1f}%)")
    print(f"⚠️ Fabric codes thiếu ảnh: {len(codes_without_images)}")
    print(f"🖼️ Tổng ảnh trong web app: {len(image_files)}")
    
    return codes_with_images, codes_without_images, fabric_codes

def analyze_vtt9_unmatched():
    """Phân tích ảnh VTT9 chưa được match"""
    print("\n🔍 PHÂN TÍCH ẢNH VTT9 CHƯA MATCH")
    print("=" * 50)
    
    # Get mapping results
    mapping = map_images_to_fabric_codes()
    
    unmatched_images = mapping['unmatched']
    print(f"📊 Tổng ảnh VTT9 chưa match: {len(unmatched_images)}")
    
    # Analyze patterns in unmatched images
    patterns = defaultdict(list)
    
    for image_data in unmatched_images:
        filename = image_data['file']
        extracted_code = image_data['extracted_code']
        
        # Categorize by pattern
        if 'mất mã' in filename.lower() or 'mat ma' in filename.lower():
            patterns['missing_code'].append(image_data)
        elif any(word in filename.lower() for word in ['mo rong', 'mở rộng']):
            patterns['expansion'].append(image_data)
        elif len(extracted_code) < 3:
            patterns['short_code'].append(image_data)
        elif any(char in extracted_code for char in [' ', '-']):
            patterns['complex_name'].append(image_data)
        else:
            patterns['other'].append(image_data)
    
    print(f"\n📋 Phân loại ảnh chưa match:")
    for pattern, images in patterns.items():
        print(f"   • {pattern}: {len(images)} ảnh")
        # Show samples
        for i, img in enumerate(images[:3]):
            print(f"     - {img['file']} → {img['extracted_code']}")
        if len(images) > 3:
            print(f"     ... và {len(images) - 3} ảnh khác")
    
    return unmatched_images, patterns

def find_potential_matches(missing_codes, unmatched_images, threshold=0.5):
    """Tìm potential matches với similarity thấp hơn"""
    print(f"\n🎯 TÌM POTENTIAL MATCHES (threshold ≥{threshold})")
    print("=" * 50)
    
    potential_matches = []
    
    for missing_code in list(missing_codes)[:50]:  # Analyze first 50
        best_matches = []
        
        for image_data in unmatched_images:
            extracted_code = image_data['extracted_code']
            similarity = calculate_similarity(missing_code, extracted_code)
            
            if similarity >= threshold:
                best_matches.append({
                    'fabric_code': missing_code,
                    'image_file': image_data['file'],
                    'extracted_code': extracted_code,
                    'similarity': similarity
                })
        
        # Sort by similarity
        best_matches.sort(key=lambda x: x['similarity'], reverse=True)
        
        if best_matches:
            potential_matches.extend(best_matches[:3])  # Top 3 matches
    
    # Sort all potential matches by similarity
    potential_matches.sort(key=lambda x: x['similarity'], reverse=True)
    
    print(f"📊 Found {len(potential_matches)} potential matches")
    print(f"\n🏆 Top 20 potential matches:")
    
    for i, match in enumerate(potential_matches[:20]):
        print(f"   {i+1:2d}. {match['fabric_code']:<20} ← {match['image_file']:<30} ({match['similarity']:.2f})")
    
    return potential_matches

def analyze_missing_fabric_patterns(missing_codes):
    """Phân tích patterns của fabric codes thiếu ảnh"""
    print(f"\n📋 PHÂN TÍCH PATTERNS FABRIC CODES THIẾU ẢNH")
    print("=" * 50)
    
    # Load detailed fabric info from CSV
    fabric_details = {}
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                code = row.get('Ma_hang', '').strip()
                if code:
                    fabric_details[code] = {
                        'name': row.get('Ten_hang', ''),
                        'type': row.get('Loai_vai', ''),
                        'location': row.get('Vi_tri', ''),
                        'quantity': row.get('So_luong', ''),
                        'condition': row.get('Tinh_trang', '')
                    }
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        return
    
    # Categorize missing codes
    categories = {
        'short_codes': [],      # Codes < 5 chars
        'long_codes': [],       # Codes > 20 chars  
        'special_chars': [],    # Codes with special characters
        'numeric_only': [],     # Only numbers
        'alpha_only': [],       # Only letters
        'mixed': [],           # Mixed patterns
        'damaged': [],         # Damaged/error fabrics
        'low_stock': []        # Low quantity
    }
    
    for code in list(missing_codes)[:100]:  # Analyze first 100
        details = fabric_details.get(code, {})
        
        # Categorize by code pattern
        if len(code) < 5:
            categories['short_codes'].append(code)
        elif len(code) > 20:
            categories['long_codes'].append(code)
        elif any(char in code for char in ['/', '\\', '(', ')', '[', ']']):
            categories['special_chars'].append(code)
        elif code.isdigit():
            categories['numeric_only'].append(code)
        elif code.isalpha():
            categories['alpha_only'].append(code)
        else:
            categories['mixed'].append(code)
        
        # Categorize by condition
        condition = details.get('condition', '').lower()
        if any(word in condition for word in ['lỗi', 'bẩn', 'mốc', 'hỏng']):
            categories['damaged'].append(code)
        
        # Categorize by quantity
        try:
            quantity = float(details.get('quantity', '0'))
            if quantity < 5:
                categories['low_stock'].append(code)
        except:
            pass
    
    print(f"📊 Phân loại fabric codes thiếu ảnh:")
    for category, codes in categories.items():
        if codes:
            print(f"   • {category}: {len(codes)} codes")
            # Show samples
            for code in codes[:3]:
                details = fabric_details.get(code, {})
                name = details.get('name', '')[:40] + '...' if len(details.get('name', '')) > 40 else details.get('name', '')
                print(f"     - {code} | {name}")
            if len(codes) > 3:
                print(f"     ... và {len(codes) - 3} codes khác")
    
    return categories, fabric_details

def suggest_improvements():
    """Đề xuất cải thiện logic matching"""
    print(f"\n💡 ĐỀ XUẤT CẢI THIỆN LOGIC MATCHING")
    print("=" * 50)
    
    suggestions = [
        "1. Giảm threshold từ 70% xuống 60% cho round 2 matching",
        "2. Thêm logic xử lý tên có dấu cách: 'HA 1754' → 'HA1754'",
        "3. Xử lý số có leading zeros: '071' → '71'", 
        "4. Mapping thủ công cho các codes đặc biệt",
        "5. Fuzzy search cho tên dài: 'HERMITAGE 27466' → 'HERMITAGE27466'",
        "6. Xử lý prefix/suffix: 'MO RONG VAI_' → remove prefix",
        "7. Thêm dictionary mapping cho các tên thường gặp",
        "8. OCR cho ảnh có text overlay",
        "9. Machine learning classifier cho pattern recognition",
        "10. Manual review interface cho borderline cases"
    ]
    
    for suggestion in suggestions:
        print(f"   {suggestion}")

def generate_manual_review_list(potential_matches, missing_codes, unmatched_images):
    """Tạo danh sách để review thủ công"""
    print(f"\n📋 TẠO DANH SÁCH MANUAL REVIEW")
    print("=" * 50)
    
    # Create review data
    review_data = {
        'high_potential_matches': [],
        'medium_potential_matches': [],
        'unmatched_images_for_review': [],
        'missing_codes_samples': []
    }
    
    # High potential matches (50-70% similarity)
    for match in potential_matches:
        if 0.5 <= match['similarity'] < 0.7:
            review_data['high_potential_matches'].append(match)
    
    # Medium potential matches (30-50% similarity)  
    for match in potential_matches:
        if 0.3 <= match['similarity'] < 0.5:
            review_data['medium_potential_matches'].append(match)
    
    # Sample unmatched images
    review_data['unmatched_images_for_review'] = [
        {
            'file': img['file'],
            'extracted_code': img['extracted_code'],
            'path': img['path']
        }
        for img in unmatched_images[:30]
    ]
    
    # Sample missing codes
    review_data['missing_codes_samples'] = list(missing_codes)[:50]
    
    # Save to JSON for easy review
    with open('manual_review_data.json', 'w', encoding='utf-8') as f:
        json.dump(review_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Saved manual review data to: manual_review_data.json")
    print(f"   • High potential matches: {len(review_data['high_potential_matches'])}")
    print(f"   • Medium potential matches: {len(review_data['medium_potential_matches'])}")
    print(f"   • Unmatched images: {len(review_data['unmatched_images_for_review'])}")
    print(f"   • Missing codes samples: {len(review_data['missing_codes_samples'])}")
    
    return review_data

def main():
    """Main analysis function"""
    print("🔍 PHÂN TÍCH CHI TIẾT FABRIC CODES THIẾU ẢNH")
    print("=" * 70)
    
    # Step 1: Get current coverage
    codes_with_images, codes_without_images, all_codes = get_current_coverage()
    
    if not codes_without_images:
        print("✅ Tất cả fabric codes đã có ảnh!")
        return
    
    # Step 2: Analyze VTT9 unmatched images
    unmatched_images, patterns = analyze_vtt9_unmatched()
    
    # Step 3: Find potential matches with lower threshold
    potential_matches = find_potential_matches(codes_without_images, unmatched_images, threshold=0.3)
    
    # Step 4: Analyze missing fabric patterns
    categories, fabric_details = analyze_missing_fabric_patterns(codes_without_images)
    
    # Step 5: Suggest improvements
    suggest_improvements()
    
    # Step 6: Generate manual review list
    review_data = generate_manual_review_list(potential_matches, codes_without_images, unmatched_images)
    
    # Summary
    print(f"\n🎯 TỔNG KẾT PHÂN TÍCH")
    print("=" * 50)
    print(f"📊 Fabric codes thiếu ảnh: {len(codes_without_images)}")
    print(f"🖼️ Ảnh VTT9 chưa match: {len(unmatched_images)}")
    print(f"🎯 Potential matches found: {len(potential_matches)}")
    print(f"💡 Có thể tăng coverage thêm ~{len([m for m in potential_matches if m['similarity'] >= 0.5])} codes")
    
    print(f"\n📋 Next steps:")
    print(f"   1. Review manual_review_data.json")
    print(f"   2. Implement improved matching logic")
    print(f"   3. Manual mapping cho high potential matches")
    print(f"   4. Tìm nguồn ảnh khác cho missing codes")

if __name__ == "__main__":
    main()
