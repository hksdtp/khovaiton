#!/usr/bin/env python3
"""
Script để cập nhật giá thanh lý từ file Excel vào Supabase
Thực hiện các bước:
1. Đọc dữ liệu Excel
2. Validate và xử lý dữ liệu
3. Cập nhật Supabase với transaction safety
4. Tạo báo cáo chi tiết
"""

import pandas as pd
import numpy as np
import os
import sys
import json
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'liquidation_price_update_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LiquidationPriceUpdater:
    def __init__(self):
        """Initialize the updater with Supabase connection"""
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials in environment variables")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        self.excel_file = 'giavonmoi.xlsx'
        self.report = {
            'start_time': datetime.now().isoformat(),
            'excel_records': 0,
            'valid_records': 0,
            'updated_records': 0,
            'failed_records': 0,
            'errors': [],
            'sample_updates': []
        }
    
    def read_excel_data(self) -> pd.DataFrame:
        """Đọc dữ liệu từ file Excel"""
        logger.info(f"Đọc dữ liệu từ file: {self.excel_file}")

        try:
            # Đọc file Excel, bỏ qua dòng đầu tiên (header)
            df = pd.read_excel(self.excel_file, skiprows=1)
            logger.info(f"Đọc thành công {len(df)} records từ Excel")

            # Log các cột có sẵn
            logger.info(f"Các cột trong Excel: {list(df.columns)}")

            # Hiển thị một vài dòng đầu để hiểu cấu trúc
            logger.info("Một vài dòng đầu của Excel:")
            logger.info(df.head().to_string())

            # Dựa vào cấu trúc đã thấy, đặt tên cột đúng
            expected_columns = [
                'STT', 'Mã hàng', 'Tên hàng', 'ĐVT', 'Số lượng',
                'Vị trí', 'Loại Vải', 'Tính trạng', 'Giá vốn', 'Giá thanh lý',
                'Ghi chú', 'Giá vải', 'ĐV giá'
            ]

            # Gán tên cột mới
            if len(df.columns) >= len(expected_columns):
                df.columns = expected_columns[:len(df.columns)]
                logger.info(f"Đã đặt tên cột: {list(df.columns)}")
            else:
                logger.warning(f"Số cột không khớp. Expected: {len(expected_columns)}, Got: {len(df.columns)}")

            # Kiểm tra cột giá thanh lý
            if 'Giá thanh lý' not in df.columns:
                raise ValueError("Không tìm thấy cột 'Giá thanh lý' sau khi đặt tên cột")

            # Tìm các cột khóa để mapping
            key_columns = []
            for col in df.columns:
                col_lower = col.lower()
                if any(keyword in col_lower for keyword in ['mã', 'code', 'id', 'tên', 'name']):
                    key_columns.append(col)

            logger.info(f"Các cột khóa để mapping: {key_columns}")

            # Lọc bỏ các dòng trống hoặc không hợp lệ
            df = df.dropna(subset=['Mã hàng'])  # Bỏ dòng không có mã hàng
            df = df[df['Mã hàng'].astype(str).str.strip() != '']  # Bỏ dòng mã hàng trống

            logger.info(f"Sau khi lọc: {len(df)} records hợp lệ")

            self.report['excel_records'] = len(df)
            return df

        except Exception as e:
            logger.error(f"Lỗi khi đọc file Excel: {str(e)}")
            raise
    
    def validate_and_process_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Validate và xử lý dữ liệu"""
        logger.info("Bắt đầu validate và xử lý dữ liệu")

        # Sử dụng cột 'Giá thanh lý' đã được đặt tên
        liquidation_col = 'Giá thanh lý'

        if liquidation_col not in df.columns:
            raise ValueError("Không tìm thấy cột 'Giá thanh lý'")

        # Tạo bản sao để xử lý
        processed_df = df.copy()

        # Xử lý cột giá thanh lý
        logger.info(f"Xử lý cột giá thanh lý: {liquidation_col}")

        # Chuyển đổi sang numeric, xử lý lỗi
        def clean_price(value):
            if pd.isna(value) or value == '' or value is None:
                return None

            # Nếu là string, loại bỏ ký tự đặc biệt
            if isinstance(value, str):
                # Loại bỏ dấu phẩy, khoảng trắng, ký tự tiền tệ
                cleaned = value.replace(',', '').replace(' ', '').replace('₫', '').replace('VND', '').replace('đ', '')
                try:
                    return float(cleaned)
                except:
                    return None

            # Nếu đã là số
            try:
                price = float(value)
                return price if price >= 0 else None  # Loại bỏ giá âm
            except:
                return None

        processed_df['liquidation_price_cleaned'] = processed_df[liquidation_col].apply(clean_price)

        # Thống kê validation
        total_records = len(processed_df)
        valid_records = processed_df['liquidation_price_cleaned'].notna().sum()
        invalid_records = total_records - valid_records

        logger.info(f"Validation kết quả:")
        logger.info(f"  - Tổng records: {total_records}")
        logger.info(f"  - Records hợp lệ: {valid_records}")
        logger.info(f"  - Records không hợp lệ: {invalid_records}")

        # Lọc chỉ lấy records có giá hợp lệ
        valid_df = processed_df[processed_df['liquidation_price_cleaned'].notna()].copy()

        self.report['valid_records'] = len(valid_df)

        # Hiển thị một vài mẫu
        if len(valid_df) > 0:
            logger.info("Một vài records hợp lệ:")
            sample_cols = ['Mã hàng', 'Tên hàng', 'liquidation_price_cleaned']
            logger.info(valid_df[sample_cols].head().to_string())

        return valid_df
    
    def get_fabric_mapping_key(self, df: pd.DataFrame) -> str:
        """Xác định cột khóa để mapping với database"""
        # Sử dụng cột 'Mã hàng' làm khóa chính
        if 'Mã hàng' in df.columns:
            return 'Mã hàng'

        # Thứ tự ưu tiên các cột khóa khác
        priority_keys = [
            'mã vải', 'ma_vai', 'fabric_code', 'code',
            'mã', 'ma', 'id', 'fabric_id',
            'tên', 'ten', 'name', 'fabric_name'
        ]

        for key in priority_keys:
            # Tìm cột có tên chính xác
            if key in df.columns:
                return key

            # Tìm cột có chứa từ khóa
            for col in df.columns:
                if key.lower() in col.lower():
                    return col

        # Nếu không tìm thấy, sử dụng cột đầu tiên
        logger.warning("Không tìm thấy cột khóa phù hợp, sử dụng cột đầu tiên")
        return df.columns[0]
    
    def backup_current_data(self) -> bool:
        """Backup dữ liệu hiện tại trước khi cập nhật"""
        try:
            logger.info("Tạo backup dữ liệu hiện tại...")
            
            # Lấy tất cả records có liquidation_price
            response = self.supabase.table('fabrics').select('*').not_.is_('liquidation_price', 'null').execute()
            
            if response.data:
                backup_file = f'backup_liquidation_prices_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
                with open(backup_file, 'w', encoding='utf-8') as f:
                    json.dump(response.data, f, ensure_ascii=False, indent=2)
                
                logger.info(f"Backup thành công {len(response.data)} records vào file: {backup_file}")
                return True
            else:
                logger.info("Không có dữ liệu liquidation_price để backup")
                return True
                
        except Exception as e:
            logger.error(f"Lỗi khi backup dữ liệu: {str(e)}")
            return False
    
    def update_supabase_data(self, df: pd.DataFrame) -> Dict:
        """Cập nhật dữ liệu vào Supabase"""
        logger.info("Bắt đầu cập nhật dữ liệu vào Supabase")
        
        # Xác định cột khóa
        mapping_key = self.get_fabric_mapping_key(df)
        logger.info(f"Sử dụng cột khóa để mapping: {mapping_key}")
        
        updated_count = 0
        failed_count = 0
        errors = []
        
        # Cập nhật từng record
        for index, row in df.iterrows():
            try:
                key_value = row[mapping_key]
                liquidation_price = row['liquidation_price_cleaned']
                
                if pd.isna(key_value) or key_value == '':
                    logger.warning(f"Bỏ qua record {index}: key_value trống")
                    failed_count += 1
                    continue
                
                # Tìm record trong database
                # Thử nhiều cách mapping khác nhau
                fabric_record = None

                # Thử mapping với code (cột chính trong database)
                response = self.supabase.table('fabrics').select('*').eq('code', str(key_value)).execute()
                if response.data:
                    fabric_record = response.data[0]
                else:
                    # Thử mapping với name
                    response = self.supabase.table('fabrics').select('*').eq('name', str(key_value)).execute()
                    if response.data:
                        fabric_record = response.data[0]
                    else:
                        # Thử mapping với id
                        try:
                            response = self.supabase.table('fabrics').select('*').eq('id', int(key_value)).execute()
                            if response.data:
                                fabric_record = response.data[0]
                        except:
                            pass
                
                if fabric_record:
                    # Cập nhật liquidation_price
                    update_response = self.supabase.table('fabrics').update({
                        'liquidation_price': liquidation_price,
                        'updated_at': datetime.now().isoformat()
                    }).eq('id', fabric_record['id']).execute()
                    
                    if update_response.data:
                        updated_count += 1
                        
                        # Lưu mẫu để báo cáo
                        if len(self.report['sample_updates']) < 5:
                            self.report['sample_updates'].append({
                                'code': fabric_record.get('code'),
                                'name': fabric_record.get('name'),
                                'old_liquidation_price': fabric_record.get('liquidation_price'),
                                'new_liquidation_price': liquidation_price
                            })
                        
                        if updated_count % 100 == 0:
                            logger.info(f"Đã cập nhật {updated_count} records...")
                    else:
                        failed_count += 1
                        error_msg = f"Không thể cập nhật record ID {fabric_record['id']}"
                        errors.append(error_msg)
                        logger.warning(error_msg)
                else:
                    failed_count += 1
                    error_msg = f"Không tìm thấy fabric với key: {key_value}"
                    errors.append(error_msg)
                    if failed_count <= 10:  # Chỉ log 10 lỗi đầu tiên
                        logger.warning(error_msg)
                
            except Exception as e:
                failed_count += 1
                error_msg = f"Lỗi khi xử lý record {index}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        self.report['updated_records'] = updated_count
        self.report['failed_records'] = failed_count
        self.report['errors'] = errors[:50]  # Giới hạn 50 lỗi đầu tiên
        
        logger.info(f"Hoàn thành cập nhật:")
        logger.info(f"  - Thành công: {updated_count} records")
        logger.info(f"  - Thất bại: {failed_count} records")
        
        return {
            'updated': updated_count,
            'failed': failed_count,
            'errors': errors
        }
    
    def verify_updates(self) -> Dict:
        """Kiểm tra một vài records ngẫu nhiên để verify"""
        logger.info("Kiểm tra verification...")
        
        try:
            # Lấy một vài records có liquidation_price mới nhất
            response = self.supabase.table('fabrics').select('*').not_.is_('liquidation_price', 'null').order('updated_at', desc=True).limit(5).execute()
            
            verification_samples = []
            if response.data:
                for record in response.data:
                    verification_samples.append({
                        'id': record['id'],
                        'code': record.get('code'),
                        'name': record.get('name'),
                        'liquidation_price': record.get('liquidation_price'),
                        'updated_at': record.get('updated_at')
                    })
            
            logger.info("Verification samples:")
            for sample in verification_samples:
                logger.info(f"  - {sample}")
            
            return {'verification_samples': verification_samples}
            
        except Exception as e:
            logger.error(f"Lỗi khi verification: {str(e)}")
            return {'error': str(e)}
    
    def generate_report(self) -> str:
        """Tạo báo cáo tổng hợp"""
        self.report['end_time'] = datetime.now().isoformat()
        
        report_file = f'liquidation_price_update_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, ensure_ascii=False, indent=2)
        
        # Tạo báo cáo text
        text_report = f"""
=== BÁO CÁO CẬP NHẬT GIÁ THANH LÝ ===
Thời gian: {self.report['start_time']} - {self.report['end_time']}

THỐNG KÊ:
- Records từ Excel: {self.report['excel_records']}
- Records hợp lệ: {self.report['valid_records']}
- Records cập nhật thành công: {self.report['updated_records']}
- Records thất bại: {self.report['failed_records']}

MẪU CẬP NHẬT:
"""
        for sample in self.report['sample_updates']:
            text_report += f"- {sample['code']} ({sample['name']}): {sample['old_liquidation_price']} → {sample['new_liquidation_price']}\n"
        
        if self.report['errors']:
            text_report += f"\nLỖI (hiển thị 10 đầu tiên):\n"
            for error in self.report['errors'][:10]:
                text_report += f"- {error}\n"
        
        logger.info(text_report)
        
        return report_file
    
    def run(self) -> bool:
        """Chạy toàn bộ quy trình cập nhật"""
        try:
            logger.info("=== BẮT ĐẦU QUY TRÌNH CẬP NHẬT GIÁ THANH LÝ ===")
            
            # 1. Đọc dữ liệu Excel
            df = self.read_excel_data()
            
            # 2. Validate và xử lý dữ liệu
            valid_df = self.validate_and_process_data(df)
            
            if len(valid_df) == 0:
                logger.error("Không có dữ liệu hợp lệ để cập nhật")
                return False
            
            # 3. Backup dữ liệu hiện tại
            if not self.backup_current_data():
                logger.error("Backup thất bại, dừng quy trình")
                return False
            
            # 4. Cập nhật Supabase
            update_result = self.update_supabase_data(valid_df)
            
            # 5. Verification
            verification_result = self.verify_updates()
            
            # 6. Tạo báo cáo
            report_file = self.generate_report()
            
            logger.info(f"=== HOÀN THÀNH QUY TRÌNH ===")
            logger.info(f"Báo cáo chi tiết: {report_file}")
            
            return update_result['updated'] > 0
            
        except Exception as e:
            logger.error(f"Lỗi trong quy trình cập nhật: {str(e)}")
            self.report['errors'].append(f"Critical error: {str(e)}")
            self.generate_report()
            return False

if __name__ == "__main__":
    updater = LiquidationPriceUpdater()
    success = updater.run()
    
    if success:
        print("✅ Cập nhật giá thanh lý thành công!")
        sys.exit(0)
    else:
        print("❌ Cập nhật giá thanh lý thất bại!")
        sys.exit(1)
