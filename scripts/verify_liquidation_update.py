#!/usr/bin/env python3
"""
Script để verify kết quả cập nhật giá thanh lý
"""

import pandas as pd
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def verify_updates():
    """Verify the liquidation price updates"""
    
    # Connect to Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🔍 VERIFICATION REPORT - Cập nhật Giá Thanh Lý")
    print("=" * 60)
    
    # 1. Đọc file Excel để so sánh
    print("\n1. Đọc dữ liệu từ Excel...")
    df = pd.read_excel('giavonmoi.xlsx', skiprows=1)
    
    # Đặt tên cột
    expected_columns = [
        'STT', 'Mã hàng', 'Tên hàng', 'ĐVT', 'Số lượng', 
        'Vị trí', 'Loại Vải', 'Tính trạng', 'Giá vốn', 'Giá thanh lý', 
        'Ghi chú', 'Giá vải', 'ĐV giá'
    ]
    df.columns = expected_columns[:len(df.columns)]
    
    # Lọc records có giá thanh lý
    df_with_price = df[df['Giá thanh lý'].notna()].copy()
    print(f"   - Records có giá thanh lý trong Excel: {len(df_with_price)}")
    
    # 2. Kiểm tra database
    print("\n2. Kiểm tra database...")
    response = supabase.table('fabrics').select('*').not_.is_('liquidation_price', 'null').execute()
    db_records = response.data
    print(f"   - Records có liquidation_price trong DB: {len(db_records)}")
    
    # 3. Verification samples
    print("\n3. Kiểm tra mẫu ngẫu nhiên...")
    
    # Lấy 5 mẫu từ Excel
    sample_excel = df_with_price.head(5)
    
    for idx, row in sample_excel.iterrows():
        code = row['Mã hàng']
        excel_price = row['Giá thanh lý']
        
        # Tìm trong database
        db_response = supabase.table('fabrics').select('*').eq('code', str(code)).execute()
        
        if db_response.data:
            db_record = db_response.data[0]
            db_price = db_record.get('liquidation_price')
            
            status = "✅" if float(db_price) == float(excel_price) else "❌"
            print(f"   {status} {code}: Excel={excel_price} | DB={db_price}")
        else:
            print(f"   ❌ {code}: Không tìm thấy trong DB")
    
    # 4. Thống kê tổng quan
    print("\n4. Thống kê tổng quan...")
    
    # Phân bố giá
    prices = [float(record['liquidation_price']) for record in db_records]
    unique_prices = set(prices)
    
    print(f"   - Các mức giá thanh lý: {sorted(unique_prices)}")
    
    for price in sorted(unique_prices):
        count = prices.count(price)
        print(f"     • {price:,.0f} VND: {count} records")
    
    # 5. Records cập nhật gần đây
    print("\n5. Records cập nhật gần đây (5 mới nhất)...")
    recent_response = supabase.table('fabrics').select('code, name, liquidation_price, updated_at').not_.is_('liquidation_price', 'null').order('updated_at', desc=True).limit(5).execute()
    
    for record in recent_response.data:
        print(f"   - {record['code']}: {record['liquidation_price']:>10} VND | {record['updated_at']}")
    
    # 6. Kiểm tra lỗi
    print("\n6. Kiểm tra các trường hợp lỗi...")
    
    # Đọc báo cáo lỗi từ file JSON
    import json
    try:
        with open('liquidation_price_update_report_20250814_142729.json', 'r', encoding='utf-8') as f:
            report = json.load(f)
        
        if report['errors']:
            print(f"   - Số lỗi: {len(report['errors'])}")
            for error in report['errors']:
                print(f"     • {error}")
        else:
            print("   - Không có lỗi")
            
    except FileNotFoundError:
        print("   - Không tìm thấy file báo cáo")
    
    print("\n" + "=" * 60)
    print("✅ VERIFICATION HOÀN THÀNH")

if __name__ == "__main__":
    verify_updates()
