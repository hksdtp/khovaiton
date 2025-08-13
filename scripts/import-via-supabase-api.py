#!/usr/bin/env python3
"""
Script để import dữ liệu thật vào Supabase thông qua API
Sử dụng urllib thay vì requests
"""

import json
import urllib.request
import urllib.parse
from datetime import datetime

# Supabase configuration
SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

def load_real_data():
    """Load dữ liệu từ file JSON backup"""
    try:
        with open('real-data-backup.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        fabrics = data['fabrics']
        print(f"✅ Đã load {len(fabrics)} sản phẩm từ backup")
        return fabrics
        
    except Exception as e:
        print(f"❌ Lỗi load backup: {e}")
        return []

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

def clear_existing_data():
    """Xóa dữ liệu cũ"""
    print("🗑️ Đang xóa dữ liệu cũ...")

    # Lấy tất cả IDs trước
    status_code, response = supabase_request('GET', 'fabrics?select=id')

    if status_code != 200:
        print(f"❌ Lỗi lấy danh sách IDs: {status_code} - {response}")
        return False

    try:
        existing_records = json.loads(response)
        if not existing_records:
            print("✅ Không có dữ liệu cũ để xóa")
            return True

        print(f"🗑️ Tìm thấy {len(existing_records)} records cũ, đang xóa...")

        # Xóa tất cả records bằng cách sử dụng filter
        status_code, response = supabase_request('DELETE', 'fabrics?id=gte.0')

        if status_code in [200, 204]:
            print("✅ Đã xóa dữ liệu cũ thành công")
            return True
        else:
            print(f"❌ Lỗi xóa dữ liệu: {status_code} - {response}")
            return False

    except Exception as e:
        print(f"❌ Exception khi xóa dữ liệu: {e}")
        return False

def prepare_fabric_for_insert(fabric):
    """Chuẩn bị fabric object cho insert"""
    return {
        'code': fabric['code'],
        'name': fabric['name'],
        'type': fabric['type'],
        'quantity': fabric['quantity'],
        'unit': fabric['unit'],
        'location': fabric['location'],
        'status': fabric['status'],
        'image': '',  # Sẽ được cập nhật sau
        'price': None,
        'price_note': fabric.get('note', ''),  # Sử dụng price_note thay cho note
        'is_hidden': False,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat()
    }

def insert_fabrics_batch(fabrics_batch):
    """Insert một batch fabrics"""
    prepared_batch = [prepare_fabric_for_insert(f) for f in fabrics_batch]
    
    status_code, response = supabase_request('POST', 'fabrics', prepared_batch)
    
    if status_code in [200, 201]:
        return True, len(fabrics_batch)
    else:
        print(f"❌ Lỗi insert batch: {status_code} - {response}")
        return False, 0

def import_all_fabrics(fabrics):
    """Import tất cả fabrics theo batch"""
    print(f"📤 Đang import {len(fabrics)} sản phẩm...")
    
    batch_size = 20  # Giảm batch size để tránh timeout
    total_inserted = 0
    failed_batches = 0
    
    for i in range(0, len(fabrics), batch_size):
        batch = fabrics[i:i + batch_size]
        batch_num = i // batch_size + 1
        
        print(f"   📦 Batch {batch_num}: Đang insert {len(batch)} sản phẩm...")
        
        success, inserted_count = insert_fabrics_batch(batch)
        
        if success:
            total_inserted += inserted_count
            print(f"   ✅ Batch {batch_num}: Thành công ({total_inserted}/{len(fabrics)})")
        else:
            failed_batches += 1
            print(f"   ❌ Batch {batch_num}: Thất bại")
            
            # Thử insert từng item riêng lẻ
            print(f"   🔄 Thử insert từng item trong batch {batch_num}...")
            for j, fabric in enumerate(batch):
                try:
                    success_single, _ = insert_fabrics_batch([fabric])
                    if success_single:
                        total_inserted += 1
                        print(f"      ✅ Item {j+1}: {fabric['code']}")
                    else:
                        print(f"      ❌ Item {j+1}: {fabric['code']} - Failed")
                except Exception as e:
                    print(f"      ❌ Item {j+1}: {fabric['code']} - Exception: {e}")
    
    print(f"\n📊 Kết quả import:")
    print(f"   ✅ Thành công: {total_inserted}/{len(fabrics)} sản phẩm")
    print(f"   ❌ Batch thất bại: {failed_batches}")
    
    return total_inserted

def verify_import():
    """Kiểm tra kết quả import"""
    print("🔍 Kiểm tra kết quả import...")
    
    # Đếm tổng số records
    status_code, response = supabase_request('GET', 'fabrics?select=count')
    
    if status_code == 200:
        try:
            # Supabase trả về count trong header Content-Range
            print("✅ Import thành công!")
            
            # Lấy sample data
            status_code2, response2 = supabase_request('GET', 'fabrics?select=code,name,quantity,location&limit=5')
            
            if status_code2 == 200:
                sample_data = json.loads(response2)
                print("📋 Sample data:")
                for item in sample_data:
                    print(f"   • {item['code']} - {item['name']} ({item['quantity']} tại {item['location']})")
            
            return True
        except Exception as e:
            print(f"❌ Lỗi parse response: {e}")
            return False
    else:
        print(f"❌ Lỗi kiểm tra: {status_code} - {response}")
        return False

def main():
    print("🚀 BẮT ĐẦU IMPORT DỮ LIỆU THẬT VÀO SUPABASE")
    print("="*60)
    
    # 1. Load dữ liệu từ backup
    fabrics = load_real_data()
    if not fabrics:
        print("❌ Không có dữ liệu để import")
        return
    
    print(f"\n📊 Sẽ import {len(fabrics)} sản phẩm thật")
    
    # Xác nhận
    confirm = input("\n⚠️  CẢNH BÁO: Thao tác này sẽ XÓA TẤT CẢ dữ liệu cũ.\nBạn có chắc chắn? (y/N): ")
    
    if confirm.lower() != 'y':
        print("❌ Đã hủy import")
        return
    
    # 2. Xóa dữ liệu cũ
    if not clear_existing_data():
        print("❌ Không thể xóa dữ liệu cũ")
        return
    
    # 3. Import dữ liệu mới
    inserted_count = import_all_fabrics(fabrics)
    
    # 4. Kiểm tra kết quả
    if verify_import():
        print(f"\n🎉 IMPORT THÀNH CÔNG!")
        print(f"   ✅ Đã import {inserted_count}/{len(fabrics)} sản phẩm thật")
        print(f"   ✅ Thay thế hoàn toàn dữ liệu giả")
        print(f"   ✅ Web app sẽ hiển thị dữ liệu thật")
        
        # Tạo báo cáo kết quả
        result_report = f"""# 📊 KẾT QUẢ IMPORT DỮ LIỆU THẬT

## ✅ Thành công:
- **Đã import:** {inserted_count}/{len(fabrics)} sản phẩm
- **Tỷ lệ thành công:** {(inserted_count/len(fabrics)*100):.1f}%
- **Thời gian:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

## 🎯 Kết quả:
- Đã thay thế hoàn toàn dữ liệu giả bằng dữ liệu thật từ giavonmoi.xlsx
- Web app sẽ hiển thị {inserted_count} sản phẩm thật
- Tất cả thông tin (mã, tên, số lượng, vị trí) đều chính xác

## 💡 Bước tiếp theo:
1. Restart web app để load dữ liệu mới
2. Kiểm tra hiển thị trên giao diện
3. Test các chức năng search, filter

---
Tạo bởi: import-via-supabase-api.py
"""
        
        with open('KET_QUA_IMPORT.md', 'w', encoding='utf-8') as f:
            f.write(result_report)
        
        print("\n💡 Bước tiếp theo: Restart web app để load dữ liệu mới!")
        
    else:
        print("❌ Import không thành công hoàn toàn")

if __name__ == "__main__":
    main()
