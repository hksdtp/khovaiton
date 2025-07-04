#!/usr/bin/env python3
"""
Tìm fabric codes thiếu ảnh để upload manual
Ninh ơi, script này sẽ:
1. List fabric codes thiếu ảnh
2. Tạo template folders để upload
3. Hướng dẫn upload manual
"""

import os
import csv
from pathlib import Path

# Paths
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"
CSV_FILE = "/Users/nih/web app/khovaiton/public/fabric_inventory_updated.csv"
UPLOAD_FOLDER = "/Users/nih/web app/khovaiton/upload_missing_images"

def get_missing_fabric_codes():
    """Lấy danh sách fabric codes thiếu ảnh"""
    print("🔍 TÌM FABRIC CODES THIẾU ẢNH")
    print("=" * 50)
    
    # Load all fabric codes from CSV
    all_fabric_codes = set()
    fabric_details = {}
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                code = row.get('Ma_hang', '').strip()
                if code:
                    all_fabric_codes.add(code)
                    fabric_details[code] = {
                        'name': row.get('Ten_hang', ''),
                        'location': row.get('Vi_tri', ''),
                        'quantity': row.get('So_luong', ''),
                        'condition': row.get('Tinh_trang', '')
                    }
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        return set(), {}
    
    # Get fabric codes with images
    codes_with_images = set()
    if os.path.exists(WEB_APP_IMAGES):
        for filename in os.listdir(WEB_APP_IMAGES):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                fabric_code = Path(filename).stem
                if fabric_code in all_fabric_codes:
                    codes_with_images.add(fabric_code)
    
    # Calculate missing
    missing_codes = all_fabric_codes - codes_with_images
    
    print(f"📊 THỐNG KÊ:")
    print(f"   📋 Total fabric codes: {len(all_fabric_codes)}")
    print(f"   ✅ Có ảnh: {len(codes_with_images)}")
    print(f"   ❌ Thiếu ảnh: {len(missing_codes)}")
    print(f"   📈 Coverage: {len(codes_with_images)/len(all_fabric_codes)*100:.1f}%")
    
    return missing_codes, fabric_details

def create_upload_structure(missing_codes, fabric_details):
    """Tạo cấu trúc folder để upload"""
    print(f"\n📁 TẠO CẤU TRÚC UPLOAD")
    print("=" * 50)
    
    # Create main upload folder
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    # Create priority folders
    priority_folders = {
        'high_priority': 'Fabric codes ưu tiên cao (số lượng lớn)',
        'medium_priority': 'Fabric codes ưu tiên trung bình',
        'low_priority': 'Fabric codes ưu tiên thấp (số lượng ít, lỗi)',
        'special_cases': 'Fabric codes đặc biệt (tên phức tạp)'
    }
    
    categorized_codes = {
        'high_priority': [],
        'medium_priority': [],
        'low_priority': [],
        'special_cases': []
    }
    
    # Categorize missing codes
    for code in missing_codes:
        details = fabric_details.get(code, {})
        quantity = details.get('quantity', '0')
        condition = details.get('condition', '').lower()
        name = details.get('name', '')
        
        try:
            qty_num = float(quantity) if quantity else 0
        except:
            qty_num = 0
        
        # Categorize
        if any(word in condition for word in ['lỗi', 'bẩn', 'mốc', 'hỏng']):
            categorized_codes['low_priority'].append(code)
        elif len(code) > 25 or '/' in code or '(' in code:
            categorized_codes['special_cases'].append(code)
        elif qty_num > 50:
            categorized_codes['high_priority'].append(code)
        elif qty_num > 10:
            categorized_codes['medium_priority'].append(code)
        else:
            categorized_codes['low_priority'].append(code)
    
    # Create folders and instruction files
    for folder_key, folder_desc in priority_folders.items():
        folder_path = os.path.join(UPLOAD_FOLDER, folder_key)
        os.makedirs(folder_path, exist_ok=True)
        
        codes_in_category = categorized_codes[folder_key]
        
        # Create instruction file
        instruction_file = os.path.join(folder_path, 'INSTRUCTIONS.txt')
        with open(instruction_file, 'w', encoding='utf-8') as f:
            f.write(f"📁 {folder_desc}\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"📊 Số lượng: {len(codes_in_category)} fabric codes\n\n")
            f.write("🎯 HƯỚNG DẪN UPLOAD:\n")
            f.write("1. Chụp ảnh hoặc scan fabric samples\n")
            f.write("2. Đặt tên file CHÍNH XÁC theo fabric code\n")
            f.write("3. Format: [FABRIC_CODE].jpg (ví dụ: TP01623-222.jpg)\n")
            f.write("4. Copy ảnh vào folder này\n")
            f.write("5. Chạy script sync để upload vào web app\n\n")
            f.write("⚠️ LƯU Ý:\n")
            f.write("- Tên file phải CHÍNH XÁC 100%\n")
            f.write("- Không có space thừa, ký tự đặc biệt\n")
            f.write("- Chỉ dùng .jpg, .jpeg, .png\n")
            f.write("- Kích thước tối đa 5MB/ảnh\n\n")
            f.write("📋 DANH SÁCH FABRIC CODES:\n")
            f.write("-" * 40 + "\n")
            
            for i, code in enumerate(codes_in_category, 1):
                details = fabric_details.get(code, {})
                name = details.get('name', '')[:50] + '...' if len(details.get('name', '')) > 50 else details.get('name', '')
                quantity = details.get('quantity', '')
                location = details.get('location', '')
                
                f.write(f"{i:3d}. {code}\n")
                f.write(f"     Tên: {name}\n")
                f.write(f"     Vị trí: {location}\n")
                f.write(f"     Số lượng: {quantity}\n")
                f.write(f"     File cần: {code}.jpg\n\n")
        
        print(f"   📁 {folder_key}: {len(codes_in_category)} codes")
    
    print(f"\n✅ Created upload structure at: {UPLOAD_FOLDER}")
    return categorized_codes

def create_sync_script():
    """Tạo script để sync ảnh từ upload folder vào web app"""
    sync_script_content = '''#!/usr/bin/env python3
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
        
        print(f"\\n📁 Processing {folder_name}...")
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
    
    print(f"\\n🎉 SYNC COMPLETE!")
    print(f"📊 Total synced: {total_synced} images")
    print(f"🔄 Restart web app để xem ảnh mới")

if __name__ == "__main__":
    sync_uploaded_images()
'''
    
    sync_script_path = os.path.join(UPLOAD_FOLDER, 'sync_images.py')
    with open(sync_script_path, 'w', encoding='utf-8') as f:
        f.write(sync_script_content)
    
    # Make executable
    os.chmod(sync_script_path, 0o755)
    
    print(f"📝 Created sync script: {sync_script_path}")

def generate_upload_guide():
    """Tạo hướng dẫn upload chi tiết"""
    guide_content = '''# 📸 HƯỚNG DẪN UPLOAD ẢNH FABRIC

## 🎯 QUY TRÌNH UPLOAD:

### Bước 1: Chuẩn bị ảnh
1. **Chụp ảnh fabric** với ánh sáng tốt
2. **Crop ảnh** để focus vào texture
3. **Resize** về kích thước hợp lý (800-1200px)
4. **Format:** JPG hoặc PNG
5. **Kích thước:** Tối đa 5MB/ảnh

### Bước 2: Đặt tên file
1. **Tên file = Fabric code CHÍNH XÁC**
2. **Ví dụ:** 
   - Fabric code: `TP01623-222` → File: `TP01623-222.jpg`
   - Fabric code: `carnival r/b purple` → File: `carnival r/b purple.jpg`
3. **Lưu ý:** Giữ nguyên spaces, dấu gạch ngang, ký tự đặc biệt

### Bước 3: Upload vào folder phù hợp
1. **High Priority:** Fabric có số lượng lớn, quan trọng
2. **Medium Priority:** Fabric số lượng trung bình
3. **Low Priority:** Fabric ít, có lỗi
4. **Special Cases:** Fabric có tên phức tạp

### Bước 4: Sync vào web app
```bash
cd /Users/nih/web app/khovaiton/upload_missing_images
python3 sync_images.py
```

## ⚠️ LƯU Ý QUAN TRỌNG:

### ✅ ĐÚNG:
- Tên file chính xác 100%
- Format JPG/PNG
- Ảnh rõ nét, đủ sáng
- Kích thước hợp lý

### ❌ SAI:
- Tên file sai chính tả
- Thêm số thứ tự (1), (2)
- Format khác (HEIC, BMP)
- Ảnh mờ, tối

## 📊 PRIORITY GUIDE:

### 🔥 High Priority (Upload trước):
- Fabric có số lượng > 50
- Fabric thường xuyên sử dụng
- Fabric ở vị trí dễ tiếp cận

### 🔶 Medium Priority:
- Fabric số lượng 10-50
- Fabric sử dụng thỉnh thoảng

### 🔸 Low Priority:
- Fabric số lượng < 10
- Fabric có lỗi, bẩn
- Fabric ít sử dụng

## 🎯 MỤC TIÊU:
Tăng coverage từ 63.2% lên 80%+ bằng cách upload ảnh cho ~50-60 fabric codes quan trọng nhất.
'''
    
    guide_path = os.path.join(UPLOAD_FOLDER, 'UPLOAD_GUIDE.md')
    with open(guide_path, 'w', encoding='utf-8') as f:
        f.write(guide_content)
    
    print(f"📖 Created upload guide: {guide_path}")

def main():
    """Main function"""
    print("📸 SETUP MANUAL IMAGE UPLOAD SYSTEM")
    print("=" * 60)
    print("🎯 Mục tiêu: Upload ảnh cho fabric codes thiếu")
    
    # Step 1: Find missing codes
    missing_codes, fabric_details = get_missing_fabric_codes()
    
    if not missing_codes:
        print("✅ Tất cả fabric codes đã có ảnh!")
        return
    
    # Step 2: Create upload structure
    categorized_codes = create_upload_structure(missing_codes, fabric_details)
    
    # Step 3: Create sync script
    create_sync_script()
    
    # Step 4: Create upload guide
    generate_upload_guide()
    
    print(f"\n🎉 SETUP COMPLETE!")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"📊 Missing codes: {len(missing_codes)}")
    print(f"\n📋 NEXT STEPS:")
    print(f"   1. Mở folder: {UPLOAD_FOLDER}")
    print(f"   2. Đọc UPLOAD_GUIDE.md")
    print(f"   3. Upload ảnh vào priority folders")
    print(f"   4. Chạy sync_images.py để sync vào web app")
    print(f"   5. Commit và deploy lên Vercel")

if __name__ == "__main__":
    main()
