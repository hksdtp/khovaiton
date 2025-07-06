#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import json
from datetime import datetime
import os

def convert_csv_to_json():
    """Convert CSV data to JSON format for web app"""
    
    try:
        # Đọc file CSV với header đúng
        print("🔄 Đọc file anhhung.csv...")
        df = pd.read_csv('anhhung.csv')
        
        print(f"✅ Đọc thành công {len(df)} dòng dữ liệu")
        
        # Tạo danh sách fabrics
        fabrics = []
        
        for index, row in df.iterrows():
            # Lấy dữ liệu từ các cột
            fabric_id = int(row.get('STT', index + 1)) if pd.notna(row.get('STT')) else index + 1
            code = row.get('Mã hàng', f'FABRIC-{index + 1}')
            name = row.get('Tên hàng', f'Vải {index + 1}')
            unit = row.get('ĐVT', 'm')
            quantity = float(row.get('Số lượng ', 0)) if pd.notna(row.get('Số lượng ')) else 0
            location = row.get('Vị trí', 'T4')
            fabric_type = row.get('Loại Vải') if pd.notna(row.get('Loại Vải')) else None
            condition = row.get('Tính trạng') if pd.notna(row.get('Tính trạng')) else None
            remarks = row.get('Ghi chú') if pd.notna(row.get('Ghi chú')) else None
            status_computed = row.get('Status_Computed', 'available')

            # Debug cho 5 dòng đầu
            if index < 5:
                print(f"Debug row {index + 1}: status_computed = '{status_computed}', type = {type(status_computed)}")

            # Xử lý status
            if pd.notna(status_computed) and status_computed in ['available', 'low_stock', 'out_of_stock', 'damaged', 'expired']:
                status = status_computed
                if index < 5:
                    print(f"  -> Using computed status: {status}")
            else:
                if index < 5:
                    print(f"  -> Using fallback logic")
                # Fallback logic
                status = 'available'
                if quantity == 0:
                    status = 'out_of_stock'
                elif quantity < 10:
                    status = 'low_stock'
                
                if condition and isinstance(condition, str):
                    condition_lower = condition.lower()
                    if any(word in condition_lower for word in ['lỗi', 'bẩn', 'mốc', 'hỏng', 'loang']):
                        status = 'damaged'
            
            # Extract width từ name
            width = None
            if isinstance(name, str):
                import re
                width_match = re.search(r'[Ww](\d+)cm|[Kk]hổ\s*(\d+)cm', name)
                if width_match:
                    width = int(width_match.group(1) or width_match.group(2))
            
            # Extract material từ name
            material = None
            if isinstance(name, str):
                name_lower = name.lower()
                if 'polyeste' in name_lower:
                    material = 'Polyester'
                elif 'cotton' in name_lower:
                    material = 'Cotton'
                elif 'lụa' in name_lower:
                    material = 'Silk'
                elif 'voan' in name_lower:
                    material = 'Chiffon'
            
            # Tạo fabric object
            fabric = {
                "id": fabric_id,
                "code": str(code) if pd.notna(code) else f'FABRIC-{index + 1}',
                "name": str(name) if pd.notna(name) else f'Vải {index + 1}',
                "unit": str(unit) if pd.notna(unit) else 'm',
                "quantity": quantity,
                "location": str(location) if pd.notna(location) else 'T4',
                "type": str(fabric_type) if fabric_type else None,
                "condition": str(condition) if condition else None,
                "remarks": str(remarks) if remarks else None,
                "width": width,
                "material": material,
                "status": status,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            fabrics.append(fabric)
        
        # Tạo metadata
        metadata = {
            "total_items": len(fabrics),
            "total_images": 0,  # Sẽ được cập nhật sau
            "mapped_images": 0,  # Sẽ được cập nhật sau
            "fabrics_with_images": 0,  # Sẽ được cập nhật sau
            "generated_at": datetime.now().isoformat(),
            "source_excel": "anhhung.xlsx",
            "source_csv": "anhhung.csv"
        }
        
        # Tạo JSON data
        json_data = {
            "metadata": metadata,
            "fabrics": fabrics,
            "image_mapping": {}  # Sẽ được cập nhật sau
        }
        
        # Lưu file JSON
        output_file = 'src/data/fabrics_data.json'
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Đã tạo file JSON: {output_file}")
        print(f"📊 Thống kê:")
        print(f"   • Tổng số vải: {len(fabrics)}")
        
        # Thống kê status
        status_counts = {}
        for fabric in fabrics:
            status = fabric['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        print(f"   • Phân bố status:")
        for status, count in status_counts.items():
            percentage = count / len(fabrics) * 100
            print(f"     - {status}: {count} ({percentage:.1f}%)")

        # Tạo file cho web app (format anhhung-fabrics.json)
        webapp_data = {
            "metadata": {
                "source": "anhhung.xlsx",
                "sheet": "Vải tầng 4",
                "processedAt": datetime.now().isoformat(),
                "totalItems": len(fabrics),
                "totalStock": sum(fabric['quantity'] for fabric in fabrics),
                "averageStock": sum(fabric['quantity'] for fabric in fabrics) / len(fabrics),
                "units": list(set(fabric['unit'] for fabric in fabrics)),
                "description": "Dữ liệu vải tồn kho - CHỈ VẢI CÒN TỒN KHO (stock > 0)",
                "columns_detected": {
                    "code": "Mã hàng",
                    "name": "Tên hàng",
                    "quantity": "Số lượng ",
                    "unit": "ĐVT",
                    "location": "Vị trí",
                    "type": "Loại Vải",
                    "condition": "Tính trạng",
                    "remarks": "Ghi chú",
                    "status": "Status_Computed"
                }
            },
            "fabrics": fabrics
        }

        # Ghi file cho web app
        webapp_file = "public/anhhung-fabrics.json"
        os.makedirs(os.path.dirname(webapp_file), exist_ok=True)

        with open(webapp_file, 'w', encoding='utf-8') as f:
            json.dump(webapp_data, f, ensure_ascii=False, indent=2)

        print(f"✅ Đã cập nhật file web app: {webapp_file}")

        return True
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        return False

if __name__ == "__main__":
    convert_csv_to_json()
