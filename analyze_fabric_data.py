#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np
import sys

def analyze_fabric_data():
    """Phân tích chi tiết dữ liệu vải từ file Excel"""
    
    try:
        # Đọc file Excel với header ở dòng 1 (0-indexed)
        print("Đang đọc file anhhung.xlsx...")
        df = pd.read_excel('anhhung.xlsx', header=1)
        
        print('=' * 60)
        print('PHÂN TÍCH CHI TIẾT DỮ LIỆU VẢI TỒN KHO')
        print('=' * 60)
        
        # Thông tin tổng quan
        print(f'\n📊 THÔNG TIN TỔNG QUAN:')
        print(f'   • Tổng số dòng dữ liệu: {len(df):,}')
        print(f'   • Tổng số cột: {len(df.columns)}')
        print(f'   • Tên các cột: {list(df.columns)}')
        
        # Phân tích cột Tính trạng
        print(f'\n🔍 PHÂN TÍCH CỘT "Tính trạng":')
        if 'Tính trạng' in df.columns:
            tinh_trang_col = df['Tính trạng']
            co_gia_tri = tinh_trang_col.notna().sum()
            trong = tinh_trang_col.isna().sum()
            
            print(f'   • Số dòng có giá trị: {co_gia_tri:,} ({co_gia_tri/len(df)*100:.1f}%)')
            print(f'   • Số dòng trống: {trong:,} ({trong/len(df)*100:.1f}%)')
            
            if co_gia_tri > 0:
                print(f'\n   📋 Các trạng thái duy nhất:')
                unique_values = tinh_trang_col.dropna().unique()
                for i, val in enumerate(unique_values, 1):
                    count = (tinh_trang_col == val).sum()
                    print(f'      {i}. "{val}" → {count:,} dòng ({count/len(df)*100:.1f}%)')
            
            # Mẫu dòng trống
            if trong > 0:
                print(f'\n   📝 Mẫu 5 dòng có tính trạng trống:')
                empty_rows = df[tinh_trang_col.isna()]
                for idx, row in empty_rows.head().iterrows():
                    ma_hang = row.get('Mã hàng', 'N/A')
                    ten_hang = row.get('Tên hàng', 'N/A')
                    so_luong = row.get('Số lượng ', 'N/A')
                    print(f'      • Dòng {idx+2}: {ma_hang} | SL: {so_luong} | {ten_hang[:50]}...')
        else:
            print('   ❌ Không tìm thấy cột "Tính trạng"')
        
        # Phân tích số lượng tồn
        print(f'\n📦 PHÂN TÍCH SỐ LƯỢNG TỒN:')
        so_luong_cols = [col for col in df.columns if 'số lượng' in col.lower()]
        if so_luong_cols:
            so_luong_col = df[so_luong_cols[0]]
            print(f'   • Cột số lượng: "{so_luong_cols[0]}"')
            print(f'   • Tổng số lượng tồn: {so_luong_col.sum():,.2f}')
            print(f'   • Số lượng trung bình: {so_luong_col.mean():.2f}')
            print(f'   • Số lượng lớn nhất: {so_luong_col.max():,.2f}')
            print(f'   • Số lượng nhỏ nhất: {so_luong_col.min():.2f}')
            
            # Top 5 mã vải có số lượng lớn nhất
            print(f'\n   🔝 Top 5 mã vải có số lượng lớn nhất:')
            top_5 = df.nlargest(5, so_luong_cols[0])
            for idx, row in top_5.iterrows():
                ma_hang = row.get('Mã hàng', 'N/A')
                so_luong = row.get(so_luong_cols[0], 0)
                print(f'      • {ma_hang}: {so_luong:,.2f}')
        else:
            print('   ❌ Không tìm thấy cột số lượng')
        
        # Phân tích loại vải
        print(f'\n🧵 PHÂN TÍCH LOẠI VẢI:')
        if 'Loại Vải' in df.columns:
            loai_vai_col = df['Loại Vải']
            co_gia_tri = loai_vai_col.notna().sum()
            trong = loai_vai_col.isna().sum()
            
            print(f'   • Số dòng có loại vải: {co_gia_tri:,} ({co_gia_tri/len(df)*100:.1f}%)')
            print(f'   • Số dòng trống loại vải: {trong:,} ({trong/len(df)*100:.1f}%)')
            
            if co_gia_tri > 0:
                print(f'\n   📋 Các loại vải:')
                for val in loai_vai_col.dropna().unique():
                    count = (loai_vai_col == val).sum()
                    print(f'      • "{val}": {count:,} dòng ({count/len(df)*100:.1f}%)')
        else:
            print('   ❌ Không tìm thấy cột "Loại Vải"')
        
        # Phân tích vị trí
        print(f'\n📍 PHÂN TÍCH VỊ TRÍ:')
        if 'Vị trí' in df.columns:
            vi_tri_col = df['Vị trí']
            co_gia_tri = vi_tri_col.notna().sum()
            trong = vi_tri_col.isna().sum()
            
            print(f'   • Số dòng có vị trí: {co_gia_tri:,} ({co_gia_tri/len(df)*100:.1f}%)')
            print(f'   • Số dòng trống vị trí: {trong:,} ({trong/len(df)*100:.1f}%)')
            
            if co_gia_tri > 0:
                print(f'\n   📋 Top 10 vị trí phổ biến:')
                vi_tri_counts = vi_tri_col.value_counts().head(10)
                for vi_tri, count in vi_tri_counts.items():
                    print(f'      • "{vi_tri}": {count:,} dòng')
        
        # Mẫu dữ liệu
        print(f'\n📋 MẪU DỮ LIỆU (3 dòng đầu):')
        print('-' * 80)
        for idx, row in df.head(3).iterrows():
            print(f'Dòng {idx+2}:')
            for col in df.columns:
                value = row[col]
                if pd.isna(value):
                    value = "[TRỐNG]"
                print(f'   {col}: {value}')
            print('-' * 40)
        
        # Kiểm tra dữ liệu thiếu
        print(f'\n⚠️  KIỂM TRA DỮ LIỆU THIẾU:')
        missing_data = df.isnull().sum()
        for col, missing_count in missing_data.items():
            if missing_count > 0:
                percentage = missing_count / len(df) * 100
                print(f'   • {col}: {missing_count:,} dòng thiếu ({percentage:.1f}%)')
        
        print(f'\n✅ Phân tích hoàn tất!')
        
    except FileNotFoundError:
        print("❌ Không tìm thấy file anhhung.xlsx")
        return False
    except Exception as e:
        print(f"❌ Lỗi khi phân tích: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    analyze_fabric_data()
