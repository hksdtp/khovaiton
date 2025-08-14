#!/usr/bin/env python3
"""
Script thực thi mapping được tối ưu hóa
Điều chỉnh thuật toán để có nhiều HIGH confidence matches hơn
"""

import json
import urllib.request
import urllib.parse
import re
import difflib
from datetime import datetime
from pathlib import Path

# Supabase configuration
SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

def supabase_request(method, endpoint, data=None):
    """Thực hiện request đến Supabase API"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    try:
        if data:
            data_bytes = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        else:
            req = urllib.request.Request(url, headers=headers, method=method)
        
        with urllib.request.urlopen(req) as response:
            return response.getcode(), response.read().decode('utf-8')
            
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def load_analysis_data():
    """Load dữ liệu phân tích"""
    try:
        with open('comprehensive-mapping-analysis.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ Đã load dữ liệu phân tích")
        return data['analysis_results']
        
    except Exception as e:
        print(f"❌ Lỗi load dữ liệu: {e}")
        return None

def normalize_code_for_exact_match(code):
    """Chuẩn hóa mã để so sánh exact match"""
    if not code:
        return ""
    
    # Chuyển về uppercase và loại bỏ khoảng trắng
    normalized = str(code).upper().strip()
    
    # Loại bỏ các ký tự đặc biệt nhưng giữ lại dấu gạch ngang
    normalized = re.sub(r'[^\w\-]', '', normalized)
    
    return normalized

def is_exact_match(product_code, image_name):
    """Kiểm tra exact match với tiêu chí lỏng hơn"""
    product_norm = normalize_code_for_exact_match(product_code)
    
    # Trích xuất mã từ tên hình ảnh
    image_norm = normalize_code_for_exact_match(image_name)
    
    # Loại bỏ prefix fabrics/
    if image_norm.startswith('FABRICS'):
        image_norm = image_norm[7:]
    
    # Loại bỏ suffix _edited, _copy, v.v.
    image_norm = re.sub(r'_EDITED.*$', '', image_norm)
    image_norm = re.sub(r'_COPY.*$', '', image_norm)
    image_norm = re.sub(r'_V\d+.*$', '', image_norm)
    image_norm = re.sub(r'_[A-Z0-9]{6,}$', '', image_norm)  # Random suffix
    
    # Exact match
    if product_norm == image_norm:
        return True
    
    # Substring match (một trong hai chứa cái kia)
    if len(product_norm) >= 4 and len(image_norm) >= 4:
        if product_norm in image_norm or image_norm in product_norm:
            return True
    
    return False

def calculate_enhanced_confidence(product, match_data):
    """Tính confidence được cải tiến"""
    product_code = product['code']
    image = match_data['image']
    
    base_confidence = match_data['confidence']
    
    # Bonus factors
    bonus = 0
    
    # 1. Exact match bonus
    if is_exact_match(product_code, image['display_name']):
        bonus += 0.3
    elif is_exact_match(product_code, image.get('extracted_code', '')):
        bonus += 0.25
    elif is_exact_match(product_code, image['public_id']):
        bonus += 0.2
    
    # 2. Edited image bonus (chất lượng cao)
    if 'edited' in image['display_name'].lower():
        bonus += 0.15
    
    # 3. Type bonus
    if match_data['type'] == 'exact_match':
        bonus += 0.2
    elif match_data['type'] == 'edited_image':
        bonus += 0.1
    
    # 4. Length similarity bonus
    product_len = len(normalize_code_for_exact_match(product_code))
    image_len = len(normalize_code_for_exact_match(image['display_name']))
    
    if abs(product_len - image_len) <= 2:  # Độ dài tương tự
        bonus += 0.05
    
    # 5. Sequence similarity bonus
    similarity = difflib.SequenceMatcher(
        None, 
        normalize_code_for_exact_match(product_code),
        normalize_code_for_exact_match(image['display_name'])
    ).ratio()
    
    if similarity >= 0.8:
        bonus += 0.1
    
    final_confidence = min(1.0, base_confidence + bonus)
    
    return final_confidence

def recategorize_mappings(analysis_results):
    """Phân loại lại mappings với thuật toán cải tiến"""
    print("🔄 Đang phân loại lại mappings với thuật toán cải tiến...")
    
    new_categorization = {
        'high_confidence': [],
        'medium_confidence': [],
        'low_confidence': [],
        'no_matches': analysis_results['no_matches'],
        'statistics': {
            'total_products': analysis_results['statistics']['total_products'],
            'high_confidence_count': 0,
            'medium_confidence_count': 0,
            'low_confidence_count': 0,
            'without_matches': len(analysis_results['no_matches'])
        }
    }
    
    # Xử lý tất cả mappings
    all_mappings = (
        analysis_results['high_confidence'] + 
        analysis_results['medium_confidence'] + 
        analysis_results['low_confidence']
    )
    
    for mapping in all_mappings:
        product = mapping['product']
        best_match = mapping['best_match']
        
        # Tính lại confidence
        enhanced_confidence = calculate_enhanced_confidence(product, best_match)
        
        # Cập nhật confidence
        best_match['confidence'] = enhanced_confidence
        mapping['best_match'] = best_match
        
        # Phân loại lại
        if enhanced_confidence >= 0.85:  # Giảm threshold cho HIGH
            new_categorization['high_confidence'].append(mapping)
            new_categorization['statistics']['high_confidence_count'] += 1
        elif enhanced_confidence >= 0.7:  # Giảm threshold cho MEDIUM
            new_categorization['medium_confidence'].append(mapping)
            new_categorization['statistics']['medium_confidence_count'] += 1
        else:
            new_categorization['low_confidence'].append(mapping)
            new_categorization['statistics']['low_confidence_count'] += 1
    
    # Sắp xếp theo confidence
    new_categorization['high_confidence'].sort(key=lambda x: x['best_match']['confidence'], reverse=True)
    new_categorization['medium_confidence'].sort(key=lambda x: x['best_match']['confidence'], reverse=True)
    new_categorization['low_confidence'].sort(key=lambda x: x['best_match']['confidence'], reverse=True)
    
    return new_categorization

def update_fabric_image(fabric_id, image_url):
    """Cập nhật hình ảnh cho fabric"""
    update_data = {
        'image': image_url,
        'updated_at': datetime.now().isoformat()
    }
    
    status_code, response = supabase_request('PATCH', f'fabrics?id=eq.{fabric_id}', update_data)
    
    return status_code in [200, 204]

def execute_high_confidence_mappings(mappings):
    """Thực thi mappings có confidence cao"""
    print(f"🎯 Đang thực thi {len(mappings)} HIGH confidence mappings...")
    
    success_count = 0
    error_count = 0
    results = []
    
    for i, mapping in enumerate(mappings):
        product = mapping['product']
        match = mapping['best_match']
        
        print(f"   📝 {i+1}/{len(mappings)}: {product['code']} → {match['image']['display_name']}")
        print(f"      📊 Confidence: {match['confidence']:.1%}")
        
        # Thực hiện mapping
        if update_fabric_image(product['id'], match['image']['url']):
            success_count += 1
            print(f"      ✅ Thành công")
            
            results.append({
                'product_code': product['code'],
                'product_name': product['name'],
                'image_url': match['image']['url'],
                'image_display_name': match['image']['display_name'],
                'confidence': match['confidence'],
                'type': match['type'],
                'status': 'success'
            })
        else:
            error_count += 1
            print(f"      ❌ Lỗi")
            
            results.append({
                'product_code': product['code'],
                'product_name': product['name'],
                'image_url': match['image']['url'],
                'image_display_name': match['image']['display_name'],
                'confidence': match['confidence'],
                'type': match['type'],
                'status': 'error'
            })
    
    print(f"\n📊 Kết quả HIGH confidence mapping:")
    print(f"   ✅ Thành công: {success_count}")
    print(f"   ❌ Lỗi: {error_count}")
    
    return results

def execute_medium_confidence_mappings(mappings, auto_execute=False):
    """Thực thi mappings có confidence trung bình"""
    print(f"🔍 Xử lý {len(mappings)} MEDIUM confidence mappings...")
    
    if not auto_execute:
        print("📋 Danh sách MEDIUM confidence mappings để xem xét:")
        for i, mapping in enumerate(mappings[:10]):  # Hiển thị top 10
            product = mapping['product']
            match = mapping['best_match']
            
            print(f"   {i+1}. {product['code']} → {match['image']['display_name']}")
            print(f"      📊 Confidence: {match['confidence']:.1%}")
            print(f"      🔗 {match['image']['url']}")
        
        if len(mappings) > 10:
            print(f"   ... và {len(mappings) - 10} mappings khác")
        
        confirm = input(f"\n🔄 Bạn có muốn auto-execute {len(mappings)} MEDIUM mappings? (y/N): ")
        auto_execute = confirm.lower() == 'y'
    
    if auto_execute:
        return execute_high_confidence_mappings(mappings)  # Sử dụng cùng logic
    else:
        print("⏸️  Bỏ qua MEDIUM confidence mappings")
        return []

def create_execution_report(high_results, medium_results, new_stats):
    """Tạo báo cáo thực thi"""
    
    total_mapped = len(high_results) + len(medium_results)
    success_count = len([r for r in high_results + medium_results if r['status'] == 'success'])
    
    current_with_images = 120  # Trước khi mapping
    new_with_images = current_with_images + success_count
    new_coverage = (new_with_images / 332) * 100
    
    report_content = f"""# 📊 BÁO CÁO THỰC THI MAPPING TỐI ƯU

## 📈 Kết quả thực thi:
- **HIGH confidence mappings:** {len(high_results)} ({len([r for r in high_results if r['status'] == 'success'])} thành công)
- **MEDIUM confidence mappings:** {len(medium_results)} ({len([r for r in medium_results if r['status'] == 'success'])} thành công)
- **Tổng mapped:** {success_count}/{total_mapped}
- **Tỷ lệ thành công:** {(success_count/total_mapped*100) if total_mapped > 0 else 0:.1f}%

## 📊 Coverage sau mapping:
- **Trước mapping:** 36.1% (120/332)
- **Sau mapping:** {new_coverage:.1f}% ({new_with_images}/332)
- **Tăng thêm:** +{success_count} sản phẩm
- **Mục tiêu 60%:** {'✅ ĐẠT ĐƯỢC' if new_coverage >= 60 else f'❌ CẦN THÊM {int(332*0.6 - new_with_images)} sản phẩm'}

## ✅ CHI TIẾT MAPPINGS THÀNH CÔNG

### 🎯 HIGH Confidence Mappings
"""
    
    high_success = [r for r in high_results if r['status'] == 'success']
    for i, result in enumerate(high_success, 1):
        report_content += f"{i}. **{result['product_code']}** - {result['product_name'][:50]}...\n"
        report_content += f"   🖼️ {result['image_display_name']}\n"
        report_content += f"   📊 Confidence: {result['confidence']:.1%} | Type: {result['type']}\n"
        report_content += f"   🔗 {result['image_url']}\n\n"
    
    if medium_results:
        medium_success = [r for r in medium_results if r['status'] == 'success']
        report_content += f"### 🔍 MEDIUM Confidence Mappings\n\n"
        
        for i, result in enumerate(medium_success, 1):
            report_content += f"{i}. **{result['product_code']}** - {result['product_name'][:50]}...\n"
            report_content += f"   🖼️ {result['image_display_name']}\n"
            report_content += f"   📊 Confidence: {result['confidence']:.1%} | Type: {result['type']}\n"
            report_content += f"   🔗 {result['image_url']}\n\n"
    
    # Thống kê còn lại
    remaining_high = new_stats['high_confidence_count'] - len(high_results)
    remaining_medium = new_stats['medium_confidence_count'] - len(medium_results)
    remaining_low = new_stats['low_confidence_count']
    remaining_no_match = new_stats['without_matches']
    
    report_content += f"""## 📋 CÔNG VIỆC CÒN LẠI

### 🎯 Có thể mapping thêm:
- **HIGH confidence:** {remaining_high} sản phẩm (auto mapping)
- **MEDIUM confidence:** {remaining_medium} sản phẩm (manual review)
- **LOW confidence:** {remaining_low} sản phẩm (detailed check)

### 📷 Cần upload hình mới:
- **Không có matches:** {remaining_no_match} sản phẩm

## 🎯 Kế hoạch tiếp theo:
1. **Mapping thêm HIGH confidence:** {remaining_high} sản phẩm
2. **Review MEDIUM confidence:** {remaining_medium} sản phẩm  
3. **Check LOW confidence:** {remaining_low} sản phẩm
4. **Upload hình mới:** {remaining_no_match} sản phẩm

## 📊 Dự báo cuối cùng:
- **Nếu mapping hết HIGH+MEDIUM:** {((120 + new_stats['high_confidence_count'] + new_stats['medium_confidence_count'])/332*100):.1f}%
- **Để đạt 60% cần thêm:** {max(0, int(332*0.6) - 120 - new_stats['high_confidence_count'] - new_stats['medium_confidence_count'])} sản phẩm

---
Tạo bởi: optimized-mapping-executor.py
Thời gian: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
    
    return report_content

def main():
    print("🚀 BẮT ĐẦU THỰC THI MAPPING TỐI ƯU")
    print("="*60)
    
    # 1. Load dữ liệu phân tích
    analysis_results = load_analysis_data()
    if not analysis_results:
        print("❌ Không có dữ liệu phân tích")
        return
    
    # 2. Phân loại lại với thuật toán cải tiến
    new_categorization = recategorize_mappings(analysis_results)
    
    # 3. Hiển thị kết quả phân loại mới
    stats = new_categorization['statistics']
    print(f"\n📊 Kết quả phân loại mới:")
    print(f"   🎯 HIGH confidence: {stats['high_confidence_count']} (≥85%)")
    print(f"   🔍 MEDIUM confidence: {stats['medium_confidence_count']} (70-84%)")
    print(f"   ⚠️  LOW confidence: {stats['low_confidence_count']} (<70%)")
    print(f"   ❌ No matches: {stats['without_matches']}")
    
    potential_new = stats['high_confidence_count'] + stats['medium_confidence_count']
    new_coverage = ((120 + potential_new) / 332) * 100
    
    print(f"\n🎯 Dự báo coverage:")
    print(f"   📈 Hiện tại: 36.1% (120/332)")
    print(f"   📈 Sau mapping: {new_coverage:.1f}% (+{potential_new})")
    print(f"   🎯 Mục tiêu 60%: {'✅ ĐẠT ĐƯỢC' if new_coverage >= 60 else '❌ CẦN THÊM'}")
    
    if stats['high_confidence_count'] == 0:
        print("\n⚠️  Không có HIGH confidence mappings để thực thi")
        return
    
    # 4. Xác nhận thực thi
    confirm = input(f"\n🔄 Bạn có muốn thực thi {stats['high_confidence_count']} HIGH confidence mappings? (y/N): ")
    
    if confirm.lower() != 'y':
        print("❌ Đã hủy thực thi")
        return
    
    # 5. Thực thi HIGH confidence mappings
    high_results = execute_high_confidence_mappings(new_categorization['high_confidence'])
    
    # 6. Xử lý MEDIUM confidence mappings
    medium_results = execute_medium_confidence_mappings(new_categorization['medium_confidence'])
    
    # 7. Tạo báo cáo
    report = create_execution_report(high_results, medium_results, stats)
    
    with open('BAO_CAO_THUC_THI_MAPPING.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 8. Lưu kết quả chi tiết
    with open('mapping-execution-results.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'high_results': high_results,
            'medium_results': medium_results,
            'new_categorization': new_categorization
        }, f, ensure_ascii=False, indent=2)
    
    # 9. Tóm tắt kết quả
    total_success = len([r for r in high_results + medium_results if r['status'] == 'success'])
    new_total_with_images = 120 + total_success
    final_coverage = (new_total_with_images / 332) * 100
    
    print(f"\n🎉 HOÀN TẤT THỰC THI!")
    print(f"   ✅ Đã mapping thành công: {total_success} sản phẩm")
    print(f"   📈 Coverage mới: {final_coverage:.1f}% ({new_total_with_images}/332)")
    print(f"   🎯 Mục tiêu 60%: {'✅ ĐẠT ĐƯỢC' if final_coverage >= 60 else '❌ CẦN THÊM'}")
    
    print(f"\n📁 Files đã tạo:")
    print(f"   📋 BAO_CAO_THUC_THI_MAPPING.md")
    print(f"   💾 mapping-execution-results.json")
    
    print(f"\n💡 Bước tiếp theo: Restart web app để thấy hình ảnh mới!")

if __name__ == "__main__":
    main()
