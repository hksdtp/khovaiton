#!/usr/bin/env python3
"""
Emergency rollback cho mappings sai
Ninh ơi, script này sẽ remove các mappings chắc chắn sai
"""

import os
import shutil
from datetime import datetime

WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"

def emergency_rollback():
    """Rollback các mappings chắc chắn sai"""
    print("🚨 EMERGENCY ROLLBACK - REMOVE INCORRECT MAPPINGS")
    print("=" * 60)
    
    # Danh sách mappings chắc chắn sai hoặc đáng ngờ cao
    incorrect_mappings = [
        'DCR-71022-8.jpg',  # Sai prefix
        'CARNIVAL R_B MULBERRY 210.jpg',  # Sai mapping từ CAMVAL RBYY
        'HBM BLACKOUT HUESO.jpg',  # Mapping từ TWILIGHT - không liên quan
        'carnival  r_b purple.jpg',  # Không tìm thấy source rõ ràng
        'DCR-1000-2300-9124.jpg',  # Mapping từ BRICK - không liên quan
        'EB5448 ALA PASTER.jpg',  # Không tìm thấy source rõ ràng
        'VN 10808.jpg',  # Không tìm thấy source rõ ràng
        'ET66470183.jpg',  # Không tìm thấy source rõ ràng
        'HENILY R_B RUN BN.jpg',  # Không tìm thấy source rõ ràng
        'CARNIVAL R_B TEAL 210.jpg',  # Mapping có vấn đề
    ]
    
    # Backup folder
    backup_folder = f"rollback_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_folder, exist_ok=True)
    
    removed_count = 0
    
    for filename in incorrect_mappings:
        filepath = os.path.join(WEB_APP_IMAGES, filename)
        
        if os.path.exists(filepath):
            # Backup before removing
            backup_path = os.path.join(backup_folder, filename)
            shutil.copy2(filepath, backup_path)
            
            # Remove from web app
            os.remove(filepath)
            removed_count += 1
            
            print(f"❌ Removed: {filename}")
        else:
            print(f"⚠️ Not found: {filename}")
    
    print(f"\n📊 ROLLBACK SUMMARY:")
    print(f"   ❌ Removed: {removed_count} incorrect mappings")
    print(f"   💾 Backup: {backup_folder}")
    
    return removed_count

def add_correct_mappings():
    """Thêm lại mappings chính xác"""
    print(f"\n✅ ADDING CORRECT MAPPINGS")
    print("=" * 50)
    
    VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
    
    # Mappings chính xác 100%
    correct_mappings = [
        {
            'fabric_code': '71022-8',
            'source_file': '71022-8.jpg',
            'reason': 'Exact match, remove wrong DCR- prefix'
        },
        {
            'fabric_code': '71022-2', 
            'source_file': '71022-2.jpg',
            'reason': 'Exact match'
        },
        # Chỉ thêm những cái chắc chắn đúng
    ]
    
    added_count = 0
    
    for mapping in correct_mappings:
        fabric_code = mapping['fabric_code']
        source_file = mapping['source_file']
        
        # Find source file
        source_path = None
        for root, dirs, files in os.walk(VTT9_FOLDER):
            if source_file in files:
                source_path = os.path.join(root, source_file)
                break
        
        if source_path:
            target_path = os.path.join(WEB_APP_IMAGES, f"{fabric_code}.jpg")
            
            # Copy if not exists
            if not os.path.exists(target_path):
                shutil.copy2(source_path, target_path)
                added_count += 1
                print(f"✅ Added: {fabric_code} ← {source_file}")
            else:
                print(f"⚠️ Already exists: {fabric_code}")
        else:
            print(f"❌ Source not found: {source_file}")
    
    print(f"\n📊 Added {added_count} correct mappings")
    return added_count

def calculate_final_coverage():
    """Tính coverage sau rollback"""
    import csv
    
    # Load fabric codes
    fabric_codes = set()
    csv_file = "/Users/nih/web app/khovaiton/public/fabric_inventory_updated.csv"
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                code = row.get('Ma_hang', '').strip()
                if code:
                    fabric_codes.add(code)
    except:
        print("❌ Cannot load CSV")
        return 0, 0
    
    # Count current images
    if not os.path.exists(WEB_APP_IMAGES):
        return 0, 0
    
    image_files = [f for f in os.listdir(WEB_APP_IMAGES) 
                   if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    
    matched_codes = set()
    for image_file in image_files:
        fabric_code = os.path.splitext(image_file)[0]
        if fabric_code in fabric_codes:
            matched_codes.add(fabric_code)
    
    coverage = len(matched_codes) / len(fabric_codes) * 100
    return len(matched_codes), coverage

def main():
    """Main rollback function"""
    print("🚨 EMERGENCY ROLLBACK - FIX INCORRECT MAPPINGS")
    print("=" * 70)
    print("🎯 Mục tiêu: Remove mappings sai, chỉ giữ mappings chính xác 100%")
    
    # Step 1: Remove incorrect mappings
    removed_count = emergency_rollback()
    
    # Step 2: Add back correct mappings
    added_count = add_correct_mappings()
    
    # Step 3: Calculate final coverage
    matched_count, coverage = calculate_final_coverage()
    
    print(f"\n🎯 FINAL RESULTS AFTER ROLLBACK:")
    print(f"   ❌ Removed incorrect: {removed_count}")
    print(f"   ✅ Added correct: {added_count}")
    print(f"   📊 Final coverage: {matched_count}/326 ({coverage:.1f}%)")
    print(f"   🎯 Net change: {added_count - removed_count}")
    
    print(f"\n💡 RECOMMENDATION:")
    print(f"   ✅ Chỉ giữ mappings chính xác tuyệt đối")
    print(f"   ⚠️ Không mapping bừa, chất lượng > số lượng")
    print(f"   🔍 Manual review cho mọi mapping không chắc chắn")
    
    print(f"\n🔄 Refresh web app để xem kết quả sau rollback!")

if __name__ == "__main__":
    main()
