#!/usr/bin/env python3
"""
📊 ANALYZE ANHHUNG EXCEL FILE
Ninh ơi, script này đọc trực tiếp file anhhung.xlsx và phân tích dữ liệu vải tồn kho
"""

import pandas as pd
import json
import os
from datetime import datetime
import sys

def install_packages():
    """Install required packages if not available"""
    try:
        import pandas
        import openpyxl
        print("✅ Required packages already available")
        return True
    except ImportError:
        print("📦 Installing required packages...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "openpyxl"])
            print("✅ Packages installed successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to install packages: {e}")
            print("💡 Please run manually: pip install pandas openpyxl")
            return False

def analyze_anhhung_excel():
    """Analyze anhhung.xlsx file and convert to web app format"""
    print("📊 ANALYZING ANHHUNG.XLSX - KHO VẢI TỒN")
    print("═" * 60)
    
    # Check if packages are available
    if not install_packages():
        return False
    
    # Re-import after installation
    import pandas as pd
    
    try:
        # Check if Excel file exists
        excel_file = "anhhung.xlsx"
        if not os.path.exists(excel_file):
            print(f"❌ File {excel_file} not found")
            print(f"📍 Current directory: {os.getcwd()}")
            
            # Look for Excel files
            excel_files = [f for f in os.listdir('.') if f.endswith(('.xlsx', '.xls'))]
            if excel_files:
                print(f"📁 Found Excel files: {excel_files}")
                print(f"💡 Please rename your file to 'anhhung.xlsx' or update the script")
            else:
                print("📁 No Excel files found in current directory")
            return False
        
        print(f"✅ Found {excel_file}")
        file_size = os.path.getsize(excel_file) / 1024
        print(f"📊 File size: {file_size:.1f} KB")
        
        # Read Excel file with proper header handling
        print("\n🔄 Reading Excel file...")

        # Try to read all sheets first
        try:
            excel_data = pd.read_excel(excel_file, sheet_name=None, header=None)
            sheet_names = list(excel_data.keys())
            print(f"📋 Found {len(sheet_names)} sheets: {sheet_names}")

            # Use first sheet or find main data sheet
            main_sheet = sheet_names[0]
            if len(sheet_names) > 1:
                # Look for common sheet names
                for candidate in ['Sheet1', 'Data', 'Fabric', 'Vải', 'Kho', 'Tồn']:
                    if candidate in sheet_names:
                        main_sheet = candidate
                        break

            print(f"📄 Using sheet: '{main_sheet}'")
            df_raw = excel_data[main_sheet]

            # Find the actual header row (look for "STT", "Mã hàng", etc.)
            header_row = None
            for i, row in df_raw.iterrows():
                row_str = ' '.join(str(cell) for cell in row if pd.notna(cell)).lower()
                if 'stt' in row_str and 'mã hàng' in row_str:
                    header_row = i
                    break

            if header_row is not None:
                print(f"📋 Found header at row {header_row + 1}")
                # Read again with proper header
                df = pd.read_excel(excel_file, sheet_name=main_sheet, header=header_row)
            else:
                print("⚠️  Could not find header row, using row 1")
                df = pd.read_excel(excel_file, sheet_name=main_sheet, header=1)

        except Exception as e:
            print(f"⚠️  Error reading sheets: {e}")
            # Fallback to default sheet
            df = pd.read_excel(excel_file, header=1)
            main_sheet = "Default"
        
        print(f"✅ Successfully read Excel data")
        print(f"📊 Shape: {df.shape[0]} rows × {df.shape[1]} columns")
        
        # Display column information
        print(f"\n📋 COLUMN INFORMATION:")
        for i, col in enumerate(df.columns):
            non_null_count = df[col].notna().sum()
            print(f"  {i+1:2d}. {col:<30} ({non_null_count} non-null values)")
        
        # Show first few rows
        print(f"\n📋 FIRST 5 ROWS:")
        print(df.head().to_string())
        
        # Clean data
        print(f"\n🧹 Cleaning data...")
        
        # Remove completely empty rows
        df_clean = df.dropna(how='all')
        print(f"📊 After removing empty rows: {df_clean.shape[0]} rows")
        
        # Remove rows where first few columns are all NaN
        important_cols = df_clean.columns[:min(3, len(df_clean.columns))]
        df_clean = df_clean.dropna(subset=important_cols, how='all')
        print(f"📊 After removing rows with empty key columns: {df_clean.shape[0]} rows")
        
        # Auto-detect column types with better logic
        print(f"\n🔍 AUTO-DETECTING COLUMNS:")

        columns = list(df_clean.columns)

        # Find fabric code column (Mã hàng)
        code_col = None
        for col in columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in ['mã hàng', 'mã', 'code', 'id']):
                code_col = col
                break
        if not code_col:
            code_col = columns[1] if len(columns) > 1 else columns[0]  # Usually second column

        # Find name column (Tên hàng)
        name_col = None
        for col in columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in ['tên hàng', 'tên', 'name', 'vải']):
                name_col = col
                break
        if not name_col:
            name_col = columns[2] if len(columns) > 2 else None

        # Find quantity column (Số lượng)
        quantity_col = None
        for col in columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in ['số lượng', 'tồn', 'quantity', 'sl']):
                quantity_col = col
                break
        if not quantity_col:
            quantity_col = columns[4] if len(columns) > 4 else None  # Usually 5th column

        # Find unit column (ĐVT)
        unit_col = None
        for col in columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in ['đvt', 'đơn vị', 'unit', 'dv']):
                unit_col = col
                break
        if not unit_col:
            unit_col = columns[3] if len(columns) > 3 else None  # Usually 4th column

        # Find location column (Vị trí)
        location_col = None
        for col in columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in ['vị trí', 'location', 'position']):
                location_col = col
                break
        
        print(f"  📋 Code Column: '{code_col}'")
        print(f"  📋 Name Column: '{name_col}'")
        print(f"  📋 Quantity Column: '{quantity_col}'")
        print(f"  📋 Unit Column: '{unit_col}'")
        print(f"  📋 Location Column: '{location_col}'")
        
        # Convert to web app format
        print(f"\n🔄 Converting to web app format...")
        
        web_app_fabrics = []
        
        for index, row in df_clean.iterrows():
            # Extract values
            code = str(row[code_col]).strip() if code_col and pd.notna(row[code_col]) else f"VT{index+1:03d}"
            name = str(row[name_col]).strip() if name_col and pd.notna(row[name_col]) else f"Vải {code}"

            # Parse quantity
            quantity_str = str(row[quantity_col]) if quantity_col and pd.notna(row[quantity_col]) else "0"
            try:
                # Remove non-numeric characters except decimal point
                quantity_clean = ''.join(c for c in quantity_str if c.isdigit() or c == '.')
                quantity = float(quantity_clean) if quantity_clean else 0
                quantity = int(quantity) if quantity.is_integer() else quantity
            except:
                quantity = 0

            unit = str(row[unit_col]).strip() if unit_col and pd.notna(row[unit_col]) else "m"
            location = str(row[location_col]).strip() if location_col and pd.notna(row[location_col]) else "T4 B1.2"

            # Skip if no meaningful code or is header row
            if (code in ['nan', 'NaN', '', 'STT'] or
                code.startswith('Unnamed') or
                code.isdigit() and int(code) == index):  # Skip if code is just row number
                continue
            
            fabric_item = {
                "id": f"fabric-{index + 1}",
                "code": code,
                "name": name,
                "description": f"Vải tồn kho - {name}",
                "category": "Vải tồn kho",
                "subcategory": "Kho chính",
                "width": 150,
                "composition": "Chưa xác định",
                "weight": "Chưa xác định",
                "color": "Đa màu",
                "pattern": "Trơn",
                "texture": "Mềm mại",
                "care": "Giặt máy",
                "price": 0,
                "currency": "VND",
                "availability": "in_stock" if quantity > 0 else "out_of_stock",
                "quantity": quantity,  # Use 'quantity' field for web app compatibility
                "stock": quantity,     # Keep 'stock' for backward compatibility
                "unit": unit,
                "supplier": "Kho nội bộ",
                "location": location,
                "dateAdded": datetime.now().isoformat(),
                "lastUpdated": datetime.now().isoformat(),
                "tags": ["vải tồn", "kho chính"],
                "image": None  # Will be mapped later
            }
            
            web_app_fabrics.append(fabric_item)
        
        # Filter only fabrics with stock > 0 (VẢI TỒN KHO)
        in_stock_fabrics = [f for f in web_app_fabrics if f["stock"] > 0]
        
        print(f"\n📊 PROCESSING RESULTS:")
        print(f"  📦 Total fabrics processed: {len(web_app_fabrics)}")
        print(f"  ✅ Fabrics in stock: {len(in_stock_fabrics)}")
        print(f"  ❌ Out of stock: {len(web_app_fabrics) - len(in_stock_fabrics)}")
        
        # Create output data (ONLY IN-STOCK FABRICS)
        output_data = {
            "metadata": {
                "source": "anhhung.xlsx",
                "sheet": main_sheet,
                "processedAt": datetime.now().isoformat(),
                "totalItems": len(in_stock_fabrics),
                "totalStock": sum(f["stock"] for f in in_stock_fabrics),
                "averageStock": sum(f["stock"] for f in in_stock_fabrics) / len(in_stock_fabrics) if in_stock_fabrics else 0,
                "units": list(set(f["unit"] for f in in_stock_fabrics)),
                "description": "Dữ liệu vải tồn kho - CHỈ VẢI CÒN TỒN KHO (stock > 0)",
                "columns_detected": {
                    "code": code_col,
                    "name": name_col,
                    "quantity": quantity_col,
                    "unit": unit_col
                }
            },
            "fabrics": in_stock_fabrics
        }
        
        # Save files
        json_file = "anhhung-fabrics.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"\n💾 Saved JSON to: {json_file}")
        
        # Copy to public and src/data directories
        public_path = os.path.join("public", "anhhung-fabrics.json")
        os.makedirs("public", exist_ok=True)
        with open(public_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"📁 Copied to: {public_path}")
        
        src_data_path = os.path.join("src", "data", "anhhung-fabrics.json")
        os.makedirs(os.path.join("src", "data"), exist_ok=True)
        with open(src_data_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"📁 Copied to: {src_data_path}")
        
        # Save CSV for reference
        csv_file = "anhhung.csv"
        df_clean.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"📄 Saved CSV to: {csv_file}")
        
        # Generate detailed summary
        print(f"\n📊 FINAL SUMMARY:")
        print(f"📄 Source: {excel_file} (sheet: {main_sheet})")
        print(f"📊 Fabrics in stock: {output_data['metadata']['totalItems']}")
        print(f"📦 Total stock: {output_data['metadata']['totalStock']:.1f} units")
        print(f"📊 Average stock: {output_data['metadata']['averageStock']:.1f} units per fabric")
        print(f"📋 Units used: {', '.join(output_data['metadata']['units'])}")
        
        # Show top fabrics by stock
        top_fabrics = sorted(in_stock_fabrics, key=lambda x: x["stock"], reverse=True)[:5]
        print(f"\n🏆 TOP 5 FABRICS BY STOCK:")
        for i, fabric in enumerate(top_fabrics, 1):
            print(f"  {i}. {fabric['code']} - {fabric['name']} ({fabric['stock']} {fabric['unit']})")
        
        # Show sample fabric codes for image mapping
        sample_codes = [f["code"] for f in in_stock_fabrics[:10]]
        print(f"\n📋 SAMPLE FABRIC CODES (for image mapping):")
        for i, code in enumerate(sample_codes, 1):
            print(f"  {i:2d}. {code}")
        
        print(f"\n🎉 ANALYSIS COMPLETE!")
        print(f"🔄 Next steps:")
        print(f"  1. Update web app to use anhhung-fabrics.json")
        print(f"  2. Map existing images to fabric codes")
        print(f"  3. Web app will show ONLY fabrics with stock > 0")
        print(f"  4. Upload missing images for high-stock fabrics")
        
        return True
        
    except Exception as e:
        print(f"❌ Error analyzing Excel file: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting Excel analysis...")
    success = analyze_anhhung_excel()
    
    if success:
        print("\n✅ Analysis completed successfully!")
        print("📱 Ready to update web app with fabric inventory data")
    else:
        print("\n❌ Analysis failed. Please check the error messages above.")
