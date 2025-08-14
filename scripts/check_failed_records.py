#!/usr/bin/env python3
"""
Script để kiểm tra chi tiết 3 records lỗi và đề xuất giải pháp
"""

import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

def check_failed_records():
    """Kiểm tra chi tiết các records lỗi"""
    
    # Connect to Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🔍 PHÂN TÍCH CHI TIẾT 3 RECORDS LỖI")
    print("=" * 70)
    
    # Danh sách 3 records lỗi
    failed_records = [
        "HARMONY-OXC B003-NG (TRẮNG)",
        "VL-BFAT12 (H)",
        "VL-FQAT42 (H)"
    ]
    
    # Đọc dữ liệu từ Excel để lấy thông tin chi tiết
    print("\n1. Đọc dữ liệu từ Excel...")
    df = pd.read_excel('giavonmoi.xlsx', skiprows=1)
    
    # Đặt tên cột
    expected_columns = [
        'STT', 'Mã hàng', 'Tên hàng', 'ĐVT', 'Số lượng', 
        'Vị trí', 'Loại Vải', 'Tính trạng', 'Giá vốn', 'Giá thanh lý', 
        'Ghi chú', 'Giá vải', 'ĐV giá'
    ]
    df.columns = expected_columns[:len(df.columns)]
    
    print("\n2. Phân tích từng record lỗi...")
    
    for i, failed_code in enumerate(failed_records, 1):
        print(f"\n--- RECORD {i}: {failed_code} ---")
        
        # Tìm trong Excel
        excel_record = df[df['Mã hàng'] == failed_code]
        
        if not excel_record.empty:
            record = excel_record.iloc[0]
            print(f"📋 Thông tin từ Excel:")
            print(f"   - Mã hàng: {record['Mã hàng']}")
            print(f"   - Tên hàng: {record['Tên hàng']}")
            print(f"   - ĐVT: {record['ĐVT']}")
            print(f"   - Số lượng: {record['Số lượng']}")
            print(f"   - Vị trí: {record['Vị trí']}")
            print(f"   - Loại Vải: {record['Loại Vải']}")
            print(f"   - Tính trạng: {record['Tính trạng']}")
            print(f"   - Giá vốn: {record['Giá vốn']}")
            print(f"   - Giá thanh lý: {record['Giá thanh lý']}")
            print(f"   - Ghi chú: {record['Ghi chú']}")
            
            # Tìm kiếm tương tự trong database
            print(f"\n🔍 Tìm kiếm tương tự trong database:")
            
            # Thử tìm với code chính xác
            exact_match = supabase.table('fabrics').select('*').eq('code', failed_code).execute()
            if exact_match.data:
                print(f"   ✅ Tìm thấy exact match: {exact_match.data[0]['name']}")
                continue
            
            # Thử tìm với tên tương tự
            name_search = record['Tên hàng']
            if pd.notna(name_search):
                name_match = supabase.table('fabrics').select('*').eq('name', str(name_search)).execute()
                if name_match.data:
                    print(f"   ✅ Tìm thấy name match: {name_match.data[0]['code']}")
                    continue
            
            # Thử tìm với từ khóa
            keywords = failed_code.replace('(', '').replace(')', '').split()
            main_keyword = keywords[0] if keywords else ""
            
            if main_keyword:
                similar_response = supabase.table('fabrics').select('code, name').like('code', f'%{main_keyword}%').execute()
                
                if similar_response.data:
                    print(f"   🔍 Tìm thấy {len(similar_response.data)} records tương tự với '{main_keyword}':")
                    for similar in similar_response.data[:5]:  # Hiển thị 5 đầu tiên
                        print(f"     - {similar['code']}: {similar['name']}")
                else:
                    print(f"   ❌ Không tìm thấy records tương tự với '{main_keyword}'")
            
            # Đề xuất action
            print(f"\n💡 Đề xuất:")
            if record['Số lượng'] > 0:
                print(f"   ✅ NÊN THÊM VÀO DATABASE - Có tồn kho ({record['Số lượng']} {record['ĐVT']})")
                print(f"   📝 Thông tin để thêm:")
                print(f"      - Code: {record['Mã hàng']}")
                print(f"      - Name: {record['Tên hàng']}")
                print(f"      - Type: {record['Loại Vải'] if pd.notna(record['Loại Vải']) else 'N/A'}")
                print(f"      - Quantity: {record['Số lượng']}")
                print(f"      - Price: {record['Giá vốn'] if pd.notna(record['Giá vốn']) else 'N/A'}")
                print(f"      - Liquidation Price: {record['Giá thanh lý']}")
                print(f"      - Location: {record['Vị trí'] if pd.notna(record['Vị trí']) else 'N/A'}")
                print(f"      - Condition: {record['Tính trạng'] if pd.notna(record['Tính trạng']) else 'N/A'}")
            else:
                print(f"   ⚠️  CÂN NHẮC - Không có tồn kho hoặc số lượng = 0")
        else:
            print(f"   ❌ Không tìm thấy trong Excel (lỗi hệ thống)")
    
    print("\n" + "=" * 70)
    print("📊 TỔNG KẾT VÀ KHUYẾN NGHỊ")
    print("=" * 70)
    
    # Tạo script để thêm records mới
    print("\n3. Tạo script thêm records mới...")
    
    new_records = []
    for failed_code in failed_records:
        excel_record = df[df['Mã hàng'] == failed_code]
        if not excel_record.empty:
            record = excel_record.iloc[0]
            if record['Số lượng'] > 0:  # Chỉ thêm nếu có tồn kho
                new_record = {
                    'code': record['Mã hàng'],
                    'name': record['Tên hàng'] if pd.notna(record['Tên hàng']) else f"Vải {record['Mã hàng']}",
                    'type': record['Loại Vải'] if pd.notna(record['Loại Vải']) else 'Khác',
                    'quantity': float(record['Số lượng']),
                    'unit': record['ĐVT'] if pd.notna(record['ĐVT']) else 'm',
                    'price': float(record['Giá vốn']) if pd.notna(record['Giá vốn']) else 0,
                    'liquidation_price': float(record['Giá thanh lý']),
                    'location': record['Vị trí'] if pd.notna(record['Vị trí']) else '',
                    'condition': record['Tính trạng'] if pd.notna(record['Tính trạng']) else 'Bình thường',
                    'notes': record['Ghi chú'] if pd.notna(record['Ghi chú']) else '',
                    'is_deleted': False,
                    'created_at': 'now()',
                    'updated_at': 'now()'
                }
                new_records.append(new_record)
    
    if new_records:
        print(f"\n✅ Có {len(new_records)} records nên được thêm vào database:")
        for record in new_records:
            print(f"   - {record['code']}: {record['name']} (SL: {record['quantity']} {record['unit']})")
        
        # Lưu vào file JSON để review
        with open('new_fabric_records.json', 'w', encoding='utf-8') as f:
            json.dump(new_records, f, ensure_ascii=False, indent=2)
        
        print(f"\n📁 Đã lưu thông tin vào file: new_fabric_records.json")
        print(f"📝 Bạn có thể review và chạy script add_new_fabrics.py để thêm vào database")
        
        return new_records
    else:
        print(f"\n⚠️  Không có records nào cần thêm vào database")
        return []

def create_add_script(new_records):
    """Tạo script để thêm records mới vào database"""
    
    script_content = '''#!/usr/bin/env python3
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
    
    print(f"\\n📊 KẾT QUẢ:")
    print(f"   - Thành công: {success_count}")
    print(f"   - Thất bại: {failed_count}")
    print(f"   - Tổng cộng: {len(new_records)}")
    
    if success_count > 0:
        print(f"\\n🎉 Đã thêm {success_count} fabric records mới vào database!")
        print(f"💡 Bây giờ bạn có thể chạy lại script cập nhật giá thanh lý")

if __name__ == "__main__":
    add_new_fabrics()
'''
    
    with open('scripts/add_new_fabrics.py', 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print(f"\n📝 Đã tạo script: scripts/add_new_fabrics.py")

if __name__ == "__main__":
    new_records = check_failed_records()
    if new_records:
        create_add_script(new_records)
