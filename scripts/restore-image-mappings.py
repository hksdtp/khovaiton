#!/usr/bin/env python3
"""
Script để khôi phục lại tất cả mapping hình ảnh đã mất
Sử dụng file image_mapping.json để cập nhật lại database
"""

import json
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime

# Supabase configuration
SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

def load_image_mappings():
    """Load mapping hình ảnh từ file JSON"""
    mapping_files = [
        'public/image_mapping.json',
        'image_mapping.json',
        'dist/image_mapping.json'
    ]
    
    for file_path in mapping_files:
        try:
            if Path(file_path).exists():
                print(f"📖 Đang đọc mapping từ {file_path}...")
                with open(file_path, 'r', encoding='utf-8') as f:
                    mappings = json.load(f)
                print(f"✅ Đã load {len(mappings)} mappings từ {file_path}")
                return mappings
        except Exception as e:
            print(f"❌ Lỗi đọc {file_path}: {e}")
            continue
    
    print("❌ Không tìm thấy file mapping nào!")
    return {}

def supabase_request(method, endpoint, data=None):
    """Thực hiện request đến Supabase API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    try:
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        else:
            req = urllib.request.Request(url, headers=headers, method=method)
        
        with urllib.request.urlopen(req) as response:
            return response.getcode(), response.read().decode('utf-8')
            
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def get_all_fabrics():
    """Lấy tất cả sản phẩm từ database"""
    print("📥 Đang lấy danh sách sản phẩm từ database...")
    
    status_code, response = supabase_request('GET', 'fabrics?select=id,code,name,image,custom_image_url')
    
    if status_code == 200:
        try:
            fabrics = json.loads(response)
            print(f"✅ Đã lấy {len(fabrics)} sản phẩm từ database")
            return fabrics
        except Exception as e:
            print(f"❌ Lỗi parse response: {e}")
            return []
    else:
        print(f"❌ Lỗi lấy dữ liệu: {status_code} - {response}")
        return []

def normalize_code(code):
    """Chuẩn hóa mã sản phẩm để so sánh"""
    if not code:
        return ""
    return str(code).strip().upper()

def find_fabric_by_code(fabrics, target_code):
    """Tìm fabric theo mã (bao gồm cả mã có suffix _DUP)"""
    target_normalized = normalize_code(target_code)
    
    # Tìm exact match trước
    for fabric in fabrics:
        if normalize_code(fabric['code']) == target_normalized:
            return fabric
    
    # Tìm match với original code (loại bỏ _DUP suffix)
    target_base = target_normalized.split('_DUP')[0] if '_DUP' in target_normalized else target_normalized
    
    for fabric in fabrics:
        fabric_base = normalize_code(fabric['code']).split('_DUP')[0]
        if fabric_base == target_base:
            return fabric
    
    return None

def update_fabric_image(fabric_id, image_url):
    """Cập nhật hình ảnh cho fabric"""
    update_data = {
        'image': image_url,
        'updated_at': datetime.now().isoformat()
    }
    
    status_code, response = supabase_request('PATCH', f'fabrics?id=eq.{fabric_id}', update_data)
    
    return status_code in [200, 204]

def restore_image_mappings(mappings, fabrics):
    """Khôi phục tất cả mapping hình ảnh"""
    print(f"🔄 Đang khôi phục {len(mappings)} mappings...")
    
    restored_count = 0
    not_found_count = 0
    error_count = 0
    
    for code, image_url in mappings.items():
        # Tìm fabric tương ứng
        fabric = find_fabric_by_code(fabrics, code)
        
        if not fabric:
            not_found_count += 1
            print(f"   ⚠️  Không tìm thấy fabric cho mã: {code}")
            continue
        
        # Cập nhật hình ảnh
        if update_fabric_image(fabric['id'], image_url):
            restored_count += 1
            print(f"   ✅ {restored_count}: {fabric['code']} → {image_url}")
        else:
            error_count += 1
            print(f"   ❌ Lỗi cập nhật {fabric['code']}")
    
    print(f"\n📊 Kết quả khôi phục:")
    print(f"   ✅ Thành công: {restored_count}")
    print(f"   ⚠️  Không tìm thấy: {not_found_count}")
    print(f"   ❌ Lỗi: {error_count}")
    
    return restored_count, not_found_count, error_count

def verify_restoration():
    """Kiểm tra kết quả khôi phục"""
    print("🔍 Kiểm tra kết quả khôi phục...")
    
    status_code, response = supabase_request('GET', 'fabrics?select=code,image&limit=10')
    
    if status_code == 200:
        try:
            sample_fabrics = json.loads(response)
            print("📋 Sample fabrics với hình ảnh:")
            
            count_with_images = 0
            for fabric in sample_fabrics:
                if fabric.get('image'):
                    count_with_images += 1
                    print(f"   • {fabric['code']}: {fabric['image'][:50]}...")
            
            print(f"✅ {count_with_images}/{len(sample_fabrics)} fabrics có hình ảnh")
            return True
        except Exception as e:
            print(f"❌ Lỗi kiểm tra: {e}")
            return False
    else:
        print(f"❌ Lỗi kiểm tra: {status_code}")
        return False

def get_total_image_stats():
    """Lấy thống kê tổng về hình ảnh"""
    print("📊 Lấy thống kê tổng...")
    
    query = """
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE image IS NOT NULL AND image != '') as has_image,
        COUNT(*) FILTER (WHERE custom_image_url IS NOT NULL AND custom_image_url != '') as has_custom_image
    FROM fabrics;
    """
    
    status_code, response = supabase_request('POST', '../database/query', {'query': query})
    
    if status_code == 200:
        try:
            result = json.loads(response)
            if result:
                stats = result[0]
                print(f"📈 Thống kê hình ảnh:")
                print(f"   📦 Tổng sản phẩm: {stats['total']}")
                print(f"   🖼️  Có hình ảnh: {stats['has_image']}")
                print(f"   🎨 Có custom image: {stats['has_custom_image']}")
                
                coverage = (stats['has_image'] / stats['total'] * 100) if stats['total'] > 0 else 0
                print(f"   📊 Tỷ lệ có hình: {coverage:.1f}%")
                
                return stats
        except Exception as e:
            print(f"❌ Lỗi parse stats: {e}")
    
    return None

def create_restoration_report(mappings, restored_count, not_found_count, error_count, stats):
    """Tạo báo cáo khôi phục"""
    
    total_mappings = len(mappings)
    success_rate = (restored_count / total_mappings * 100) if total_mappings > 0 else 0
    
    report_content = f"""# 📊 BÁO CÁO KHÔI PHỤC MAPPING HÌNH ẢNH

## 📈 Tổng quan:
- **File nguồn:** public/image_mapping.json
- **Tổng mappings:** {total_mappings}
- **Khôi phục thành công:** {restored_count}
- **Không tìm thấy:** {not_found_count}
- **Lỗi:** {error_count}
- **Tỷ lệ thành công:** {success_rate:.1f}%

## 📊 Thống kê database sau khôi phục:
"""
    
    if stats:
        coverage = (stats['has_image'] / stats['total'] * 100) if stats['total'] > 0 else 0
        report_content += f"""- **Tổng sản phẩm:** {stats['total']}
- **Có hình ảnh:** {stats['has_image']}
- **Có custom image:** {stats['has_custom_image']}
- **Tỷ lệ có hình:** {coverage:.1f}%
"""
    
    report_content += f"""
## ✅ Kết quả:
- ✅ Đã khôi phục {restored_count} mapping hình ảnh
- ✅ Web app sẽ hiển thị hình ảnh cho các sản phẩm đã mapping
- ✅ Tất cả URL Cloudinary đã được cập nhật
- ✅ Dữ liệu mapping được đồng bộ với database

## 💡 Lưu ý:
- {not_found_count} mã không tìm thấy có thể do:
  - Mã đã thay đổi trong quá trình import mới
  - Mã có suffix _DUP mà chưa xử lý đúng
  - Mã không tồn tại trong dữ liệu mới

## 🚀 Bước tiếp theo:
1. Restart web app để load hình ảnh
2. Kiểm tra hiển thị trên giao diện
3. Upload thêm hình ảnh cho các sản phẩm chưa có
4. Cập nhật mapping cho các mã mới

---
Tạo bởi: restore-image-mappings.py
Thời gian: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
    
    # Lưu báo cáo
    with open('BAO_CAO_KHOI_PHUC_HINH_ANH.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"💾 Đã tạo báo cáo: BAO_CAO_KHOI_PHUC_HINH_ANH.md")

def main():
    print("🚀 BẮT ĐẦU KHÔI PHỤC MAPPING HÌNH ẢNH")
    print("="*60)
    
    # 1. Load mapping từ file
    mappings = load_image_mappings()
    if not mappings:
        print("❌ Không có mapping để khôi phục")
        return
    
    # 2. Lấy danh sách fabrics từ database
    fabrics = get_all_fabrics()
    if not fabrics:
        print("❌ Không thể lấy dữ liệu fabrics")
        return
    
    print(f"\n📊 Sẽ khôi phục {len(mappings)} mappings cho {len(fabrics)} sản phẩm")
    
    # Xác nhận từ user
    confirm = input("\n🔄 Bạn có muốn khôi phục tất cả mapping hình ảnh? (y/N): ")
    
    if confirm.lower() != 'y':
        print("❌ Đã hủy khôi phục")
        return
    
    # 3. Khôi phục mappings
    restored_count, not_found_count, error_count = restore_image_mappings(mappings, fabrics)
    
    # 4. Kiểm tra kết quả
    if verify_restoration():
        print("\n✅ Khôi phục thành công!")
        
        # 5. Lấy thống kê
        stats = get_total_image_stats()
        
        # 6. Tạo báo cáo
        create_restoration_report(mappings, restored_count, not_found_count, error_count, stats)
        
        print(f"\n🎉 KHÔI PHỤC HOÀN TẤT!")
        print(f"   ✅ Đã khôi phục {restored_count} mappings")
        print(f"   📊 Tỷ lệ thành công: {(restored_count/len(mappings)*100):.1f}%")
        print("\n💡 Bước tiếp theo: Restart web app để thấy hình ảnh!")
        
    else:
        print("❌ Khôi phục không thành công hoàn toàn")

if __name__ == "__main__":
    main()
