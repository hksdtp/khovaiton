#!/usr/bin/env python3
"""
📊 EXCEL TO CSV/JSON CONVERTER
Ninh ơi, script này đọc chính xác file anhhung.xlsx và convert sang CSV/JSON
"""

import pandas as pd
import json
import os
from datetime import datetime
import sys

def convert_excel_to_csv_json():
    """Convert anhhung.xlsx to CSV and JSON formats"""
    print("📊 EXCEL TO CSV/JSON CONVERTER - KHO VẢI TỒN")
    print("═" * 60)
    
    # File paths
    excel_file = "anhhung.xlsx"
    csv_file = "anhhung.csv"
    json_file = "anhhung.json"
    
    try:
        # Check if Excel file exists
        if not os.path.exists(excel_file):
            print(f"❌ File {excel_file} not found")
            print(f"📍 Current directory: {os.getcwd()}")
            print(f"📁 Files in directory: {os.listdir('.')}")
            return
        
        print(f"✅ Found {excel_file}")
        file_size = os.path.getsize(excel_file) / 1024
        print(f"📊 File size: {file_size:.1f} KB")
        
        # Read Excel file
        print("\n🔄 Reading Excel file...")
        
        # Try different sheet reading approaches
        try:
            # First, try to read all sheets
            excel_data = pd.read_excel(excel_file, sheet_name=None)
            sheet_names = list(excel_data.keys())
            print(f"📋 Found {len(sheet_names)} sheets: {sheet_names}")
            
            # Use the first sheet or find the main data sheet
            if len(sheet_names) == 1:
                main_sheet = sheet_names[0]
            else:
                # Look for common sheet names
                main_candidates = ['Sheet1', 'Data', 'Fabric', 'Vải', 'Kho']
                main_sheet = None
                for candidate in main_candidates:
                    if candidate in sheet_names:
                        main_sheet = candidate
                        break
                if not main_sheet:
                    main_sheet = sheet_names[0]  # Use first sheet
            
            print(f"📄 Using sheet: '{main_sheet}'")
            df = excel_data[main_sheet]
            
        except Exception as e:
            print(f"⚠️  Error reading sheets, trying default approach: {e}")
            # Fallback: read default sheet
            df = pd.read_excel(excel_file)
        
        print(f"✅ Successfully read Excel data")
        print(f"📊 Shape: {df.shape[0]} rows × {df.shape[1]} columns")
        
        # Display basic info
        print(f"\n📋 COLUMN INFORMATION:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}. {col}")
        
        # Show first few rows
        print(f"\n📋 FIRST 5 ROWS:")
        print(df.head().to_string())
        
        # Clean data
        print(f"\n🧹 Cleaning data...")
        
        # Remove completely empty rows
        df_clean = df.dropna(how='all')
        print(f"📊 After removing empty rows: {df_clean.shape[0]} rows")
        
        # Remove rows where all important columns are NaN
        # Assume first few columns are important
        important_cols = df_clean.columns[:3]  # First 3 columns
        df_clean = df_clean.dropna(subset=important_cols, how='all')
        print(f"📊 After removing rows with empty key columns: {df_clean.shape[0]} rows")
        
        # Fill NaN values with empty strings for text columns
        df_clean = df_clean.fillna('')
        
        # Convert to CSV
        print(f"\n💾 Converting to CSV...")
        df_clean.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"✅ Saved to: {csv_file}")
        
        # Convert to JSON
        print(f"\n💾 Converting to JSON...")
        
        # Create structured JSON
        json_data = {
            "metadata": {
                "source_file": excel_file,
                "converted_at": datetime.now().isoformat(),
                "total_rows": len(df_clean),
                "total_columns": len(df_clean.columns),
                "columns": list(df_clean.columns),
                "description": "Dữ liệu vải tồn kho từ file anhhung.xlsx"
            },
            "data": df_clean.to_dict('records')
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Saved to: {json_file}")
        
        # Generate summary
        print(f"\n📊 CONVERSION SUMMARY:")
        print(f"  📄 Source: {excel_file} ({file_size:.1f} KB)")
        print(f"  📄 CSV: {csv_file} ({os.path.getsize(csv_file)/1024:.1f} KB)")
        print(f"  📄 JSON: {json_file} ({os.path.getsize(json_file)/1024:.1f} KB)")
        print(f"  📊 Rows: {len(df_clean)}")
        print(f"  📊 Columns: {len(df_clean.columns)}")
        
        # Show sample data
        print(f"\n📋 SAMPLE DATA (first 3 rows):")
        for i, row in df_clean.head(3).iterrows():
            print(f"  Row {i+1}:")
            for col in df_clean.columns[:5]:  # Show first 5 columns
                value = str(row[col])[:50]  # Limit length
                print(f"    {col}: {value}")
            print()
        
        # Detect fabric codes
        print(f"\n🔍 DETECTING FABRIC CODES:")
        potential_code_columns = []
        for col in df_clean.columns:
            col_lower = str(col).lower()
            if any(keyword in col_lower for keyword in ['mã', 'code', 'id', 'stt']):
                potential_code_columns.append(col)
        
        if potential_code_columns:
            print(f"  🎯 Potential code columns: {potential_code_columns}")
            main_code_col = potential_code_columns[0]
            unique_codes = df_clean[main_code_col].nunique()
            print(f"  📊 Unique values in '{main_code_col}': {unique_codes}")
        else:
            print(f"  ⚠️  No obvious code columns found")
        
        print(f"\n🎉 CONVERSION COMPLETE!")
        print(f"📁 Files created:")
        print(f"  • {csv_file} - For spreadsheet applications")
        print(f"  • {json_file} - For web applications")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        import traceback
        traceback.print_exc()
        return False

def install_requirements():
    """Install required packages"""
    try:
        import pandas
        import openpyxl
        print("✅ Required packages already installed")
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
            print("💡 Please run: pip install pandas openpyxl")
            return False

if __name__ == "__main__":
    print("🚀 Starting Excel to CSV/JSON conversion...")
    
    # Check and install requirements
    if not install_requirements():
        exit(1)
    
    # Run conversion
    success = convert_excel_to_csv_json()
    
    if success:
        print("\n✅ All done! You can now use the CSV or JSON files.")
    else:
        print("\n❌ Conversion failed. Please check the error messages above.")
