#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np

def regenerate_csv_with_status():
    """Tái tạo file CSV với logic status mới"""
    
    try:
        # Đọc file Excel với header đúng
        print("Đang đọc file anhhung.xlsx...")
        df = pd.read_excel('anhhung.xlsx', header=1)
        
        print(f"✅ Đọc thành công {len(df)} dòng dữ liệu")
        
        # Phân tích trạng thái trước khi xử lý
        print("\n📊 PHÂN TÍCH TRẠNG THÁI TRƯỚC KHI XỬ LÝ:")
        if 'Tính trạng' in df.columns:
            tinh_trang_col = df['Tính trạng']
            print(f"   • Số dòng có tình trạng: {tinh_trang_col.notna().sum()}")
            print(f"   • Số dòng trống: {tinh_trang_col.isna().sum()}")
            
            # Hiển thị các tình trạng duy nhất
            unique_conditions = tinh_trang_col.dropna().unique()
            print(f"   • Các tình trạng duy nhất:")
            for condition in unique_conditions:
                count = (tinh_trang_col == condition).sum()
                print(f"     - '{condition}': {count} dòng")
        
        # Áp dụng logic status mới
        print("\n🔄 ÁP DỤNG LOGIC STATUS MỚI:")
        
        def determine_status(row):
            """Xác định status dựa trên số lượng và tình trạng"""
            quantity = row.get('Số lượng ', 0) or 0
            condition = row.get('Tính trạng', '')
            
            # Mặc định là available
            status = 'available'
            
            # Kiểm tra số lượng
            if quantity == 0:
                status = 'out_of_stock'
            elif quantity < 10:
                status = 'low_stock'
            
            # Kiểm tra tình trạng (ưu tiên cao hơn)
            if condition and isinstance(condition, str):
                condition_lower = condition.lower()
                
                if ('lỗi' in condition_lower or 
                    'bẩn' in condition_lower or 
                    'mốc' in condition_lower or
                    'hỏng' in condition_lower or
                    'loang' in condition_lower):
                    status = 'damaged'
                # Vải tồn cũ vẫn giữ nguyên status dựa trên quantity
                elif 'tồn cũ' in condition_lower:
                    pass  # Giữ nguyên status
            
            return status
        
        # Áp dụng logic cho từng dòng
        df['Status_Computed'] = df.apply(determine_status, axis=1)
        
        # Thống kê status mới
        status_counts = df['Status_Computed'].value_counts()
        print(f"   📈 Thống kê status sau khi xử lý:")
        for status, count in status_counts.items():
            percentage = count / len(df) * 100
            print(f"     - {status}: {count} dòng ({percentage:.1f}%)")
        
        # Lưu file CSV mới
        print(f"\n💾 LƯU FILE CSV MỚI:")
        output_file = 'anhhung_with_status.csv'
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"   ✅ Đã lưu: {output_file}")
        
        # Hiển thị mẫu dữ liệu
        print(f"\n📋 MẪU DỮ LIỆU (5 dòng đầu):")
        sample_cols = ['Mã hàng', 'Tên hàng', 'Số lượng ', 'Tính trạng', 'Status_Computed']
        available_cols = [col for col in sample_cols if col in df.columns]
        
        for idx, row in df.head().iterrows():
            print(f"\nDòng {idx + 2}:")
            for col in available_cols:
                value = row[col]
                if pd.isna(value):
                    value = "[TRỐNG]"
                print(f"   {col}: {value}")
        
        # Phân tích chi tiết các trường hợp damaged
        print(f"\n🔍 PHÂN TÍCH CHI TIẾT CÁC TRƯỜNG HỢP DAMAGED:")
        damaged_fabrics = df[df['Status_Computed'] == 'damaged']
        if len(damaged_fabrics) > 0:
            print(f"   • Tổng số vải damaged: {len(damaged_fabrics)}")
            
            # Nhóm theo tình trạng
            condition_groups = damaged_fabrics['Tính trạng'].value_counts()
            print(f"   • Phân nhóm theo tình trạng:")
            for condition, count in condition_groups.items():
                print(f"     - '{condition}': {count} dòng")
            
            # Mẫu 5 dòng damaged
            print(f"   • Mẫu 5 dòng damaged:")
            for idx, row in damaged_fabrics.head().iterrows():
                ma_hang = row.get('Mã hàng', 'N/A')
                so_luong = row.get('Số lượng ', 'N/A')
                tinh_trang = row.get('Tính trạng', 'N/A')
                print(f"     - {ma_hang} | SL: {so_luong} | Tình trạng: {tinh_trang}")
        
        # Phân tích các trường hợp không có tình trạng
        print(f"\n📝 PHÂN TÍCH CÁC TRƯỜNG HỢP KHÔNG CÓ TÌNH TRẠNG:")
        no_condition = df[df['Tính trạng'].isna()]
        if len(no_condition) > 0:
            print(f"   • Tổng số vải không có tình trạng: {len(no_condition)}")
            
            # Phân nhóm theo status
            status_groups = no_condition['Status_Computed'].value_counts()
            print(f"   • Phân nhóm theo status:")
            for status, count in status_groups.items():
                print(f"     - {status}: {count} dòng")
        
        print(f"\n✅ Hoàn tất! File CSV mới đã được tạo với logic status cập nhật.")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        return False

if __name__ == "__main__":
    regenerate_csv_with_status()
