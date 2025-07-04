#!/usr/bin/env python3
"""
Detailed mapping check - Kiểm tra từng mapping cụ thể
Ninh ơi, script này sẽ show chi tiết mapping để bạn verify thủ công
"""

import os
import csv
from pathlib import Path

# Paths
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
CSV_FILE = "/Users/nih/web app/khovaiton/public/fabric_inventory_updated.csv"

def load_fabric_details():
    """Load chi tiết fabric từ CSV"""
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
    
    return fabric_details

def find_vtt9_source_file(fabric_code):
    """Tìm source file trong VTT9 cho fabric code"""
    possible_sources = []
    
    for root, dirs, files in os.walk(VTT9_FOLDER):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.heic')):
                # Check if fabric code appears in filename
                if fabric_code.lower() in file.lower() or \
                   fabric_code.replace('-', '').lower() in file.replace('-', '').lower() or \
                   fabric_code.replace(' ', '').lower() in file.replace(' ', '').lower():
                    possible_sources.append({
                        'file': file,
                        'path': os.path.join(root, file)
                    })
    
    return possible_sources

def check_suspicious_mappings():
    """Kiểm tra các mappings đáng ngờ"""
    print("🔍 KIỂM TRA CHI TIẾT MAPPINGS")
    print("=" * 60)
    
    fabric_details = load_fabric_details()
    
    # Get all current images
    if not os.path.exists(WEB_APP_IMAGES):
        print("❌ Thư mục images không tồn tại")
        return
    
    image_files = [f for f in os.listdir(WEB_APP_IMAGES) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    print(f"📊 Total images in web app: {len(image_files)}")
    
    # Suspicious patterns to check
    suspicious_patterns = [
        'DCR-71022-8',  # Có thể nhầm với 71022-10
        '71022-2',      # Có thể nhầm với 71022-7 hoặc 71022-8
        'carnival  r/b purple',  # Có space thừa
        'HBM BLACKOUT HUESO',    # Tên hoàn toàn khác
        'Voile R_B Cream',       # Có thể bị sanitize sai
        'CARNIVAL R_B MULBERRY 210',  # Có thể bị sanitize
        'DCR-1000-2300-9124',    # Số phức tạp
        'EB5448 ALA PASTER',     # Tên khác biệt
        'VN 10808',              # Pattern khác
        'ET66470183',            # Số dài
        'HENILY R_B RUN BN',     # Có thể bị sanitize
        '91200201S0103',         # Số dài phức tạp
    ]
    
    print(f"\n🔍 CHECKING SUSPICIOUS MAPPINGS:")
    print("=" * 50)
    
    found_suspicious = []
    
    for image_file in image_files:
        fabric_code = Path(image_file).stem
        
        # Check if this is a suspicious mapping
        is_suspicious = False
        for pattern in suspicious_patterns:
            if pattern.replace('/', '_').replace(' ', '_') == fabric_code or pattern == fabric_code:
                is_suspicious = True
                break
        
        if is_suspicious or any(char in fabric_code for char in ['_']):  # Check sanitized names
            # Get fabric details
            original_code = fabric_code.replace('_', '/').replace('_', ' ')  # Try to reverse sanitization
            details = fabric_details.get(fabric_code) or fabric_details.get(original_code)
            
            # Find possible VTT9 sources
            vtt9_sources = find_vtt9_source_file(fabric_code)
            
            suspicious_info = {
                'fabric_code': fabric_code,
                'image_file': image_file,
                'fabric_details': details,
                'vtt9_sources': vtt9_sources,
                'reason': 'Suspicious pattern or sanitized filename'
            }
            
            found_suspicious.append(suspicious_info)
            
            print(f"\n⚠️ SUSPICIOUS: {fabric_code}")
            print(f"   📁 Image file: {image_file}")
            if details:
                print(f"   📋 Fabric name: {details['name'][:60]}...")
                print(f"   📍 Location: {details['location']}")
                print(f"   📊 Quantity: {details['quantity']}")
            else:
                print(f"   ❌ No fabric details found in CSV!")
            
            if vtt9_sources:
                print(f"   🎯 Possible VTT9 sources:")
                for source in vtt9_sources[:3]:  # Show max 3
                    print(f"      • {source['file']}")
            else:
                print(f"   ❌ No obvious VTT9 source found!")
    
    return found_suspicious

def check_exact_matches():
    """Kiểm tra các matches có vẻ chính xác"""
    print(f"\n✅ CHECKING LIKELY CORRECT MAPPINGS:")
    print("=" * 50)
    
    fabric_details = load_fabric_details()
    
    if not os.path.exists(WEB_APP_IMAGES):
        return []
    
    image_files = [f for f in os.listdir(WEB_APP_IMAGES) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    likely_correct = []
    
    for image_file in image_files:
        fabric_code = Path(image_file).stem
        
        # Skip sanitized names
        if '_' in fabric_code:
            continue
        
        # Check if fabric code exists in CSV
        details = fabric_details.get(fabric_code)
        if details:
            # Find VTT9 source
            vtt9_sources = find_vtt9_source_file(fabric_code)
            
            # Check if there's a clear match
            exact_match = False
            for source in vtt9_sources:
                source_name = Path(source['file']).stem.upper()
                if fabric_code.upper() in source_name or source_name in fabric_code.upper():
                    exact_match = True
                    break
            
            if exact_match:
                likely_correct.append({
                    'fabric_code': fabric_code,
                    'image_file': image_file,
                    'fabric_details': details,
                    'vtt9_sources': vtt9_sources
                })
    
    print(f"📊 Found {len(likely_correct)} likely correct mappings")
    
    # Show some examples
    for i, item in enumerate(likely_correct[:10]):
        print(f"   {i+1:2d}. {item['fabric_code']} ← {item['vtt9_sources'][0]['file'] if item['vtt9_sources'] else 'Unknown'}")
    
    if len(likely_correct) > 10:
        print(f"   ... and {len(likely_correct) - 10} more")
    
    return likely_correct

def generate_manual_review_list(suspicious_mappings):
    """Tạo danh sách để review thủ công"""
    print(f"\n📋 MANUAL REVIEW RECOMMENDATIONS:")
    print("=" * 50)
    
    if not suspicious_mappings:
        print("✅ No suspicious mappings found!")
        return
    
    print(f"⚠️ Found {len(suspicious_mappings)} mappings cần review:")
    print()
    
    for i, item in enumerate(suspicious_mappings, 1):
        print(f"{i:2d}. FABRIC CODE: {item['fabric_code']}")
        print(f"    📁 Image file: {item['image_file']}")
        
        if item['fabric_details']:
            print(f"    📋 CSV name: {item['fabric_details']['name'][:50]}...")
        else:
            print(f"    ❌ NOT FOUND in CSV - có thể mapping sai!")
        
        if item['vtt9_sources']:
            print(f"    🎯 VTT9 source: {item['vtt9_sources'][0]['file']}")
        else:
            print(f"    ❌ No clear VTT9 source")
        
        print(f"    💡 Action: Kiểm tra visual match giữa ảnh và fabric")
        print()
    
    # Create removal script for suspicious ones
    removal_script = "#!/bin/bash\n"
    removal_script += "# Remove suspicious mappings\n"
    removal_script += "# Review each case before running!\n\n"
    
    for item in suspicious_mappings:
        if not item['fabric_details']:  # Definitely wrong if not in CSV
            removal_script += f"# DEFINITELY WRONG - not in CSV\n"
            removal_script += f"rm '{WEB_APP_IMAGES}/{item['image_file']}'\n\n"
        else:
            removal_script += f"# REVIEW NEEDED - {item['fabric_code']}\n"
            removal_script += f"# rm '{WEB_APP_IMAGES}/{item['image_file']}'\n\n"
    
    with open('remove_suspicious_mappings.sh', 'w') as f:
        f.write(removal_script)
    
    print(f"📝 Created removal script: remove_suspicious_mappings.sh")
    print(f"💡 Review script trước khi chạy!")

def main():
    """Main function"""
    print("🔍 DETAILED MAPPING ACCURACY CHECK")
    print("=" * 60)
    print("🎯 Mục tiêu: Kiểm tra chi tiết từng mapping")
    print("⚠️ Highlight cases cần review thủ công")
    
    # Check suspicious mappings
    suspicious_mappings = check_suspicious_mappings()
    
    # Check likely correct mappings
    likely_correct = check_exact_matches()
    
    # Generate manual review recommendations
    generate_manual_review_list(suspicious_mappings)
    
    # Summary
    total_suspicious = len(suspicious_mappings)
    total_likely_correct = len(likely_correct)
    
    print(f"\n🎯 SUMMARY:")
    print(f"   ✅ Likely correct: {total_likely_correct}")
    print(f"   ⚠️ Need review: {total_suspicious}")
    
    if total_suspicious > 0:
        print(f"\n⚠️ RECOMMENDATION:")
        print(f"   1. Review {total_suspicious} suspicious mappings manually")
        print(f"   2. Check visual match giữa ảnh và fabric name")
        print(f"   3. Remove mappings sai bằng script")
        print(f"   4. Chỉ giữ lại mappings chính xác 100%")
    else:
        print(f"\n✅ All mappings look reasonable!")

if __name__ == "__main__":
    main()
