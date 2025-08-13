#!/usr/bin/env python3
"""
Script để so sánh dữ liệu dự án với file giavonmoi.xlsx
Kiểm tra sự khác biệt giữa dữ liệu thực tế và dữ liệu trong hệ thống
"""

import pandas as pd
import json
import csv
import os
from pathlib import Path

def read_giavonmoi_excel():
    """Đọc dữ liệu từ file giavonmoi.xlsx"""
    try:
        # Đọc file Excel
        excel_path = Path("giavonmoi.xlsx")
        if not excel_path.exists():
            print("❌ Không tìm thấy file giavonmoi.xlsx")
            return None
            
        print("📖 Đang đọc file giavonmoi.xlsx...")
        
        # Thử đọc với các sheet khác nhau
        xl_file = pd.ExcelFile(excel_path)
        print(f"📋 Sheets có sẵn: {xl_file.sheet_names}")
        
        # Đọc sheet đầu tiên hoặc sheet có tên phù hợp
        sheet_name = xl_file.sheet_names[0]
        for name in xl_file.sheet_names:
            if any(keyword in name.lower() for keyword in ['gia', 'von', 'data', 'sheet1']):
                sheet_name = name
                break
                
        print(f"📊 Đọc sheet: {sheet_name}")
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        print(f"✅ Đã đọc {len(df)} dòng dữ liệu từ {sheet_name}")
        print(f"📋 Columns: {list(df.columns)}")
        
        return df
        
    except Exception as e:
        print(f"❌ Lỗi đọc file Excel: {e}")
        return None

def read_current_project_data():
    """Đọc dữ liệu hiện tại từ dự án"""
    current_data = {}
    
    # 1. Đọc fabric_inventory_updated.csv
    csv_path = Path("public/fabric_inventory_updated.csv")
    if csv_path.exists():
        try:
            df_csv = pd.read_csv(csv_path)
            current_data['fabric_csv'] = df_csv
            print(f"✅ Đọc {len(df_csv)} dòng từ fabric_inventory_updated.csv")
            print(f"📋 CSV Columns: {list(df_csv.columns)}")
        except Exception as e:
            print(f"❌ Lỗi đọc CSV: {e}")
    
    # 2. Đọc image mapping
    mapping_path = Path("public/image_mapping.json")
    if mapping_path.exists():
        try:
            with open(mapping_path, 'r', encoding='utf-8') as f:
                image_mapping = json.load(f)
            current_data['image_mapping'] = image_mapping
            print(f"✅ Đọc {len(image_mapping)} mappings từ image_mapping.json")
        except Exception as e:
            print(f"❌ Lỗi đọc image mapping: {e}")
    
    # 3. Đọc fabrics_data.json nếu có
    fabrics_path = Path("public/fabrics_data.json")
    if fabrics_path.exists():
        try:
            with open(fabrics_path, 'r', encoding='utf-8') as f:
                fabrics_data = json.load(f)
            current_data['fabrics_json'] = fabrics_data
            print(f"✅ Đọc fabrics_data.json")
        except Exception as e:
            print(f"❌ Lỗi đọc fabrics_data.json: {e}")
    
    return current_data

def normalize_fabric_code(code):
    """Chuẩn hóa mã vải để so sánh"""
    if pd.isna(code):
        return ""
    return str(code).strip().upper()

def compare_data(excel_df, current_data):
    """So sánh dữ liệu Excel với dữ liệu hiện tại"""
    print("\n" + "="*60)
    print("🔍 BẮT ĐẦU SO SÁNH DỮ LIỆU")
    print("="*60)
    
    comparison_results = {
        'excel_total': len(excel_df),
        'missing_in_project': [],
        'extra_in_project': [],
        'data_differences': [],
        'price_differences': [],
        'quantity_differences': []
    }
    
    # Chuẩn hóa dữ liệu Excel
    excel_codes = set()
    excel_data = {}
    
    # Tìm cột mã vải trong Excel
    code_column = None
    for col in excel_df.columns:
        if any(keyword in str(col).lower() for keyword in ['ma', 'code', 'mã']):
            code_column = col
            break
    
    if code_column is None:
        print("❌ Không tìm thấy cột mã vải trong Excel")
        return comparison_results
    
    print(f"📋 Sử dụng cột mã vải: {code_column}")
    
    # Xử lý dữ liệu Excel
    for idx, row in excel_df.iterrows():
        code = normalize_fabric_code(row[code_column])
        if code:
            excel_codes.add(code)
            excel_data[code] = row.to_dict()
    
    print(f"📊 Excel có {len(excel_codes)} mã vải duy nhất")
    
    # So sánh với CSV hiện tại
    if 'fabric_csv' in current_data:
        csv_df = current_data['fabric_csv']
        
        # Tìm cột mã vải trong CSV
        csv_code_column = None
        for col in csv_df.columns:
            if any(keyword in str(col).lower() for keyword in ['ma_hang', 'ma', 'code']):
                csv_code_column = col
                break
        
        if csv_code_column:
            print(f"📋 CSV sử dụng cột mã vải: {csv_code_column}")
            
            csv_codes = set()
            csv_data = {}
            
            for idx, row in csv_df.iterrows():
                code = normalize_fabric_code(row[csv_code_column])
                if code:
                    csv_codes.add(code)
                    csv_data[code] = row.to_dict()
            
            print(f"📊 CSV có {len(csv_codes)} mã vải duy nhất")
            
            # Tìm sự khác biệt
            missing_in_project = excel_codes - csv_codes
            extra_in_project = csv_codes - excel_codes
            common_codes = excel_codes & csv_codes
            
            comparison_results['missing_in_project'] = list(missing_in_project)
            comparison_results['extra_in_project'] = list(extra_in_project)
            comparison_results['csv_total'] = len(csv_codes)
            comparison_results['common_codes'] = len(common_codes)
            
            print(f"\n📈 KẾT QUẢ SO SÁNH:")
            print(f"   📊 Excel: {len(excel_codes)} mã vải")
            print(f"   📊 CSV:   {len(csv_codes)} mã vải")
            print(f"   ✅ Chung: {len(common_codes)} mã vải")
            print(f"   ❌ Thiếu trong dự án: {len(missing_in_project)} mã vải")
            print(f"   ➕ Thừa trong dự án: {len(extra_in_project)} mã vải")
            
            # So sánh chi tiết cho các mã chung
            print(f"\n🔍 Kiểm tra chi tiết {min(10, len(common_codes))} mã vải chung...")
            for i, code in enumerate(list(common_codes)[:10]):
                excel_row = excel_data[code]
                csv_row = csv_data[code]
                
                differences = []
                
                # So sánh số lượng
                excel_qty = excel_row.get('So_luong', excel_row.get('Quantity', excel_row.get('SL', '')))
                csv_qty = csv_row.get('So_luong', csv_row.get('Quantity', ''))
                
                if str(excel_qty) != str(csv_qty):
                    differences.append(f"Số lượng: Excel={excel_qty}, CSV={csv_qty}")
                
                # So sánh giá (nếu có)
                excel_price = excel_row.get('Gia', excel_row.get('Price', excel_row.get('Gia_von', '')))
                csv_price = csv_row.get('Gia', csv_row.get('Price', ''))
                
                if str(excel_price) != str(csv_price) and excel_price != '':
                    differences.append(f"Giá: Excel={excel_price}, CSV={csv_price}")
                
                if differences:
                    comparison_results['data_differences'].append({
                        'code': code,
                        'differences': differences
                    })
                    print(f"   ⚠️  {code}: {'; '.join(differences)}")
    
    return comparison_results

def generate_report(comparison_results, excel_df):
    """Tạo báo cáo chi tiết"""
    
    # Tạo file báo cáo
    report_content = f"""
# 📊 BÁO CÁO SO SÁNH DỮ LIỆU - GIAVONMOI.XLSX

## 📈 Tổng quan:
- **Excel (giavonmoi.xlsx):** {comparison_results['excel_total']} dòng
- **CSV hiện tại:** {comparison_results.get('csv_total', 'N/A')} mã vải
- **Mã vải chung:** {comparison_results.get('common_codes', 'N/A')}

## ❌ Thiếu trong dự án ({len(comparison_results['missing_in_project'])} mã):
"""
    
    for code in comparison_results['missing_in_project'][:20]:  # Chỉ hiển thị 20 đầu
        report_content += f"- {code}\n"
    
    if len(comparison_results['missing_in_project']) > 20:
        report_content += f"- ... và {len(comparison_results['missing_in_project']) - 20} mã khác\n"
    
    report_content += f"""
## ➕ Thừa trong dự án ({len(comparison_results['extra_in_project'])} mã):
"""
    
    for code in comparison_results['extra_in_project'][:20]:  # Chỉ hiển thị 20 đầu
        report_content += f"- {code}\n"
    
    if len(comparison_results['extra_in_project']) > 20:
        report_content += f"- ... và {len(comparison_results['extra_in_project']) - 20} mã khác\n"
    
    report_content += f"""
## ⚠️ Sự khác biệt dữ liệu ({len(comparison_results['data_differences'])} mã):
"""
    
    for diff in comparison_results['data_differences'][:10]:
        report_content += f"- **{diff['code']}:** {'; '.join(diff['differences'])}\n"
    
    report_content += f"""
## 💡 Khuyến nghị:
1. **Cập nhật dữ liệu thiếu:** Thêm {len(comparison_results['missing_in_project'])} mã vải từ Excel vào dự án
2. **Kiểm tra dữ liệu thừa:** Xem xét {len(comparison_results['extra_in_project'])} mã vải chỉ có trong dự án
3. **Đồng bộ dữ liệu:** Cập nhật {len(comparison_results['data_differences'])} mã vải có sự khác biệt

## 📁 Files được tạo:
- `BAO_CAO_SO_SANH_GIAVONMOI.md` - Báo cáo này
- `ma_vai_thieu_trong_du_an.csv` - Danh sách mã vải thiếu
- `ma_vai_thua_trong_du_an.csv` - Danh sách mã vải thừa
- `du_lieu_khac_biet.csv` - Chi tiết sự khác biệt

---
Tạo bởi: compare-data-with-giavonmoi.py
Thời gian: {pd.Timestamp.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
    
    # Lưu báo cáo
    with open('BAO_CAO_SO_SANH_GIAVONMOI.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    # Tạo CSV cho mã vải thiếu
    if comparison_results['missing_in_project']:
        missing_df = pd.DataFrame({
            'Ma_vai_thieu': comparison_results['missing_in_project'],
            'Ghi_chu': ['Có trong Excel nhưng thiếu trong dự án'] * len(comparison_results['missing_in_project'])
        })
        missing_df.to_csv('ma_vai_thieu_trong_du_an.csv', index=False, encoding='utf-8')
        print(f"💾 Đã tạo file: ma_vai_thieu_trong_du_an.csv ({len(comparison_results['missing_in_project'])} mã)")
    
    # Tạo CSV cho mã vải thừa
    if comparison_results['extra_in_project']:
        extra_df = pd.DataFrame({
            'Ma_vai_thua': comparison_results['extra_in_project'],
            'Ghi_chu': ['Có trong dự án nhưng không có trong Excel'] * len(comparison_results['extra_in_project'])
        })
        extra_df.to_csv('ma_vai_thua_trong_du_an.csv', index=False, encoding='utf-8')
        print(f"💾 Đã tạo file: ma_vai_thua_trong_du_an.csv ({len(comparison_results['extra_in_project'])} mã)")
    
    print(f"💾 Đã tạo báo cáo: BAO_CAO_SO_SANH_GIAVONMOI.md")

def main():
    print("🔍 BẮT ĐẦU SO SÁNH DỮ LIỆU VỚI GIAVONMOI.XLSX")
    print("="*60)
    
    # Đọc dữ liệu Excel
    excel_df = read_giavonmoi_excel()
    if excel_df is None:
        return
    
    # Đọc dữ liệu dự án hiện tại
    print("\n📖 Đang đọc dữ liệu dự án hiện tại...")
    current_data = read_current_project_data()
    
    # So sánh dữ liệu
    comparison_results = compare_data(excel_df, current_data)
    
    # Tạo báo cáo
    print("\n📝 Tạo báo cáo...")
    generate_report(comparison_results, excel_df)
    
    print("\n🎉 HOÀN TẤT!")
    print("📁 Kiểm tra các file báo cáo đã được tạo")

if __name__ == "__main__":
    main()
