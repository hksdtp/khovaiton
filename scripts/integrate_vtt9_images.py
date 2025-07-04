#!/usr/bin/env python3
"""
Tích hợp ảnh vải từ folder vtt9 vào web app
Ninh ơi, script này sẽ:
1. Backup ảnh hiện có
2. Convert .heic sang .jpg nếu cần
3. Copy ảnh matched vào public/images/fabrics/
4. Verify và test kết quả
"""

import os
import shutil
import subprocess
from pathlib import Path
from datetime import datetime
import json

# Import functions from analyze script
import sys
sys.path.append(os.path.dirname(__file__))
from analyze_vtt9_images import (
    map_images_to_fabric_codes, 
    get_existing_fabric_codes,
    IMAGE_EXTENSIONS
)

# Paths
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"
BACKUP_FOLDER = "/Users/nih/web app/khovaiton/backup_images"

def create_backup():
    """Backup ảnh hiện có"""
    print("💾 TẠO BACKUP ẢNH HIỆN CÓ")
    print("=" * 50)
    
    if not os.path.exists(WEB_APP_IMAGES):
        print("📁 Tạo thư mục images/fabrics")
        os.makedirs(WEB_APP_IMAGES, exist_ok=True)
        return True
    
    # Create backup folder with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{BACKUP_FOLDER}_{timestamp}"
    
    try:
        if os.path.exists(WEB_APP_IMAGES):
            shutil.copytree(WEB_APP_IMAGES, backup_path)
            print(f"✅ Backup created: {backup_path}")
            
            # Count backed up files
            backup_count = len([f for f in os.listdir(backup_path) 
                              if Path(f).suffix.lower() in IMAGE_EXTENSIONS])
            print(f"📊 Backed up {backup_count} existing images")
            
        return True
        
    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return False

def convert_heic_to_jpg(heic_path, jpg_path):
    """Convert HEIC to JPG using sips (macOS built-in)"""
    try:
        result = subprocess.run([
            'sips', '-s', 'format', 'jpeg', heic_path, '--out', jpg_path
        ], capture_output=True, text=True)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ HEIC conversion failed: {e}")
        return False

def copy_matched_images(mapping):
    """Copy ảnh matched vào web app"""
    print("\n📋 COPY ẢNH VÀO WEB APP")
    print("=" * 50)
    
    success_count = 0
    error_count = 0
    converted_count = 0
    
    for fabric_code, image_data in mapping['matched'].items():
        try:
            source_path = image_data['path']
            source_ext = Path(source_path).suffix.lower()
            
            # Determine target filename
            target_filename = f"{fabric_code}.jpg"
            target_path = os.path.join(WEB_APP_IMAGES, target_filename)
            
            # Handle HEIC conversion
            if source_ext == '.heic':
                print(f"🔄 Converting HEIC: {fabric_code}")
                if convert_heic_to_jpg(source_path, target_path):
                    converted_count += 1
                    success_count += 1
                    print(f"✅ Converted & copied: {fabric_code}")
                else:
                    print(f"❌ HEIC conversion failed: {fabric_code}")
                    error_count += 1
                    continue
            else:
                # Direct copy for JPG/PNG
                shutil.copy2(source_path, target_path)
                success_count += 1
                print(f"✅ Copied: {fabric_code}")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Error copying {fabric_code}: {e}")
    
    print(f"\n📊 COPY SUMMARY:")
    print(f"   ✅ Success: {success_count}")
    print(f"   🔄 Converted: {converted_count}")
    print(f"   ❌ Errors: {error_count}")
    
    return success_count, error_count

def verify_integration():
    """Verify ảnh đã được tích hợp thành công"""
    print("\n🔍 VERIFY TÍCH HỢP")
    print("=" * 50)
    
    if not os.path.exists(WEB_APP_IMAGES):
        print("❌ Thư mục images/fabrics không tồn tại")
        return False
    
    # Count images
    image_files = [f for f in os.listdir(WEB_APP_IMAGES) 
                   if Path(f).suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}]
    
    print(f"📊 Tổng số ảnh trong web app: {len(image_files)}")
    
    # Check fabric codes coverage
    fabric_codes = get_existing_fabric_codes()
    matched_codes = []
    
    for image_file in image_files:
        fabric_code = Path(image_file).stem
        if fabric_code in fabric_codes:
            matched_codes.append(fabric_code)
    
    coverage = len(matched_codes) / len(fabric_codes) * 100
    print(f"📈 Coverage: {len(matched_codes)}/{len(fabric_codes)} ({coverage:.1f}%)")
    
    # Sample verification
    print(f"\n📋 Sample ảnh mới (10 đầu tiên):")
    for i, image_file in enumerate(image_files[:10]):
        file_size = os.path.getsize(os.path.join(WEB_APP_IMAGES, image_file))
        print(f"   • {image_file} ({file_size//1024}KB)")
    
    return True

def generate_integration_report(mapping, success_count, error_count):
    """Tạo báo cáo tích hợp chi tiết"""
    print("\n📋 BÁO CÁO TÍCH HỢP VTT9")
    print("=" * 60)
    
    total_vtt9_images = len(mapping['matched']) + len(mapping['unmatched'])
    fabric_codes = get_existing_fabric_codes()
    
    print(f"📊 TỔNG QUAN:")
    print(f"   🖼️ Tổng ảnh VTT9: {total_vtt9_images}")
    print(f"   🎯 Ảnh matched: {len(mapping['matched'])}")
    print(f"   ✅ Ảnh copied thành công: {success_count}")
    print(f"   ❌ Ảnh lỗi: {error_count}")
    print(f"   📈 Success rate: {success_count/len(mapping['matched'])*100:.1f}%")
    
    print(f"\n🎯 COVERAGE:")
    coverage = len(mapping['matched']) / len(fabric_codes) * 100
    print(f"   📊 Fabric codes có ảnh: {len(mapping['matched'])}/{len(fabric_codes)} ({coverage:.1f}%)")
    print(f"   ⚠️ Fabric codes thiếu ảnh: {len(mapping['missing_codes'])}")
    print(f"   🔄 Ảnh VTT9 chưa match: {len(mapping['unmatched'])}")
    
    # Top similarity matches
    print(f"\n🏆 TOP MATCHES (similarity score):")
    sorted_matches = sorted(
        mapping['matched'].items(), 
        key=lambda x: x[1].get('similarity', 0), 
        reverse=True
    )
    
    for i, (code, data) in enumerate(sorted_matches[:10]):
        similarity = data.get('similarity', 0)
        print(f"   {i+1}. {code} ({similarity:.2f}) ← {data['file']}")
    
    return {
        'total_vtt9_images': total_vtt9_images,
        'matched_count': len(mapping['matched']),
        'success_count': success_count,
        'error_count': error_count,
        'coverage_percent': coverage,
        'missing_count': len(mapping['missing_codes'])
    }

def main():
    """Main integration function"""
    print("🚀 BẮT ĐẦU TÍCH HỢP VTT9 IMAGES VÀO WEB APP")
    print("=" * 70)
    
    # Step 1: Analyze and map images
    print("📊 Bước 1: Phân tích và mapping ảnh...")
    mapping = map_images_to_fabric_codes()
    
    if not mapping['matched']:
        print("❌ Không có ảnh nào được match. Dừng tích hợp.")
        return
    
    print(f"✅ Found {len(mapping['matched'])} matched images")
    
    # Step 2: Create backup
    print("\n💾 Bước 2: Tạo backup...")
    if not create_backup():
        print("❌ Backup failed. Dừng tích hợp để an toàn.")
        return
    
    # Step 3: Copy images
    print("\n📋 Bước 3: Copy ảnh vào web app...")
    success_count, error_count = copy_matched_images(mapping)
    
    # Step 4: Verify
    print("\n🔍 Bước 4: Verify kết quả...")
    verify_integration()
    
    # Step 5: Generate report
    report = generate_integration_report(mapping, success_count, error_count)
    
    print(f"\n🎉 HOÀN THÀNH TÍCH HỢP!")
    print(f"📊 Đã tích hợp {success_count}/{len(mapping['matched'])} ảnh")
    print(f"📈 Coverage tăng lên: {report['coverage_percent']:.1f}%")
    print(f"🔄 Restart web app để xem ảnh mới!")

if __name__ == "__main__":
    main()
