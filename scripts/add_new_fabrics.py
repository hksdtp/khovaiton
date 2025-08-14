#!/usr/bin/env python3
"""
Script để thêm các fabric records mới vào database
"""

import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

def add_new_fabrics():
    """Thêm các fabric records mới vào database"""
    
    # Connect to Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🔄 THÊM FABRIC RECORDS MỚI VÀO DATABASE")
    print("=" * 50)
    
    # Đọc dữ liệu từ file JSON
    try:
        with open('new_fabric_records.json', 'r', encoding='utf-8') as f:
            new_records = json.load(f)
    except FileNotFoundError:
        print("❌ Không tìm thấy file new_fabric_records.json")
        return
    
    if not new_records:
        print("⚠️  Không có records nào để thêm")
        return
    
    print(f"📋 Sẽ thêm {len(new_records)} records mới...")
    
    success_count = 0
    failed_count = 0
    
    for record in new_records:
        try:
            # Kiểm tra xem record đã tồn tại chưa
            existing = supabase.table('fabrics').select('id').eq('code', record['code']).execute()
            
            if existing.data:
                print(f"⚠️  {record['code']} đã tồn tại, bỏ qua...")
                continue
            
            # Chuẩn bị dữ liệu để insert
            insert_data = {
                'code': record['code'],
                'name': record['name'],
                'type': record['type'],
                'quantity': record['quantity'],
                'unit': record['unit'],
                'price': record['price'],
                'liquidation_price': record['liquidation_price'],
                'location': record['location'],
                'condition': record['condition'],
                'notes': record['notes'],
                'is_deleted': False
            }
            
            # Insert vào database
            response = supabase.table('fabrics').insert(insert_data).execute()
            
            if response.data:
                print(f"✅ Thêm thành công: {record['code']}")
                success_count += 1
            else:
                print(f"❌ Thêm thất bại: {record['code']}")
                failed_count += 1
                
        except Exception as e:
            print(f"❌ Lỗi khi thêm {record['code']}: {str(e)}")
            failed_count += 1
    
    print(f"\n📊 KẾT QUẢ:")
    print(f"   - Thành công: {success_count}")
    print(f"   - Thất bại: {failed_count}")
    print(f"   - Tổng cộng: {len(new_records)}")
    
    if success_count > 0:
        print(f"\n🎉 Đã thêm {success_count} fabric records mới vào database!")
        print(f"💡 Bây giờ bạn có thể chạy lại script cập nhật giá thanh lý")

if __name__ == "__main__":
    add_new_fabrics()
