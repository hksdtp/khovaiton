#!/usr/bin/env python3
"""
Script phân tích toàn diện để mapping hình ảnh Cloudinary với sản phẩm
Mục tiêu: Tăng tỷ lệ có hình từ 36.1% lên 60%+
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
        'Content-Type': 'application/json'
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

def get_products_without_images():
    """Lấy danh sách sản phẩm chưa có hình ảnh"""
    print("📥 Đang lấy danh sách sản phẩm chưa có hình ảnh...")
    
    status_code, response = supabase_request('GET', 'fabrics?select=id,code,name,image&or=(image.is.null,image.eq.)')
    
    if status_code == 200:
        try:
            products = json.loads(response)
            print(f"✅ Tìm thấy {len(products)} sản phẩm chưa có hình ảnh")
            return products
        except Exception as e:
            print(f"❌ Lỗi parse response: {e}")
            return []
    else:
        print(f"❌ Lỗi lấy dữ liệu: {status_code} - {response}")
        return []

def load_cloudinary_analysis():
    """Load dữ liệu phân tích Cloudinary"""
    try:
        with open('cloudinary-audit-analysis.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ Đã load dữ liệu Cloudinary: {data['summary']['total_images']} hình ảnh")
        return data
        
    except Exception as e:
        print(f"❌ Lỗi load dữ liệu Cloudinary: {e}")
        return None

def normalize_code_for_comparison(code):
    """Chuẩn hóa mã để so sánh"""
    if not code:
        return ""
    
    # Chuyển về uppercase
    normalized = str(code).upper().strip()
    
    # Loại bỏ các ký tự đặc biệt
    normalized = re.sub(r'[^\w\-]', '', normalized)
    
    # Loại bỏ prefix fabrics/
    if normalized.startswith('FABRICS'):
        normalized = normalized[7:]
    
    return normalized

def extract_fabric_code_from_cloudinary_name(name):
    """Trích xuất mã vải từ tên file Cloudinary"""
    # Loại bỏ extension
    name = re.sub(r'\.(jpg|jpeg|png|gif|webp)$', '', name, flags=re.IGNORECASE)
    
    # Loại bỏ prefix fabrics/
    name = re.sub(r'^fabrics/', '', name, flags=re.IGNORECASE)
    
    # Loại bỏ suffix _edited và các suffix khác
    name = re.sub(r'_edited.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_copy.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_v\d+.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_[a-z0-9]{6,}$', '', name, flags=re.IGNORECASE)  # Random suffix
    
    return name.strip()

def calculate_similarity_score(product_code, image_name):
    """Tính điểm tương đồng giữa mã sản phẩm và tên hình ảnh"""
    product_normalized = normalize_code_for_comparison(product_code)
    image_normalized = normalize_code_for_comparison(extract_fabric_code_from_cloudinary_name(image_name))
    
    if not product_normalized or not image_normalized:
        return 0
    
    # Exact match
    if product_normalized == image_normalized:
        return 1.0
    
    # Substring match
    if product_normalized in image_normalized or image_normalized in product_normalized:
        return 0.9
    
    # Sequence similarity
    similarity = difflib.SequenceMatcher(None, product_normalized, image_normalized).ratio()
    
    return similarity

def find_matching_images_for_product(product, cloudinary_data):
    """Tìm hình ảnh phù hợp cho sản phẩm"""
    product_code = product['code']
    matches = []
    
    # Lấy tất cả hình ảnh từ analysis
    all_images = []
    
    # Thêm exact matches
    for match in cloudinary_data['analysis']['exact_matches']:
        all_images.append({
            'type': 'exact_match',
            'image': match['image'],
            'confidence': 1.0,
            'priority': 1
        })
    
    # Thêm similar matches
    for match in cloudinary_data['analysis']['similar_matches']:
        all_images.append({
            'type': 'similar_match',
            'image': match['image'],
            'confidence': 0.8,
            'priority': 2
        })
    
    # Thêm edited images
    for img in cloudinary_data['analysis']['edited_images']:
        all_images.append({
            'type': 'edited_image',
            'image': {
                'public_id': img['public_id'],
                'display_name': img['display_name'],
                'url': img['url'],
                'extracted_code': img['extracted_code']
            },
            'confidence': 0.85,
            'priority': 1  # Ưu tiên cao cho edited
        })
    
    # Thêm unmapped images
    for img in cloudinary_data['analysis']['unmapped_images']:
        all_images.append({
            'type': 'unmapped_image',
            'image': {
                'public_id': img['public_id'],
                'display_name': img['display_name'],
                'url': img['url'],
                'extracted_code': img['extracted_code']
            },
            'confidence': 0.5,
            'priority': 3
        })
    
    # Tính similarity cho từng hình ảnh
    for img_data in all_images:
        img = img_data['image']
        
        # Tính similarity với display_name
        similarity_display = calculate_similarity_score(product_code, img['display_name'])
        
        # Tính similarity với extracted_code
        similarity_extracted = calculate_similarity_score(product_code, img.get('extracted_code', ''))
        
        # Tính similarity với public_id
        similarity_public_id = calculate_similarity_score(product_code, img['public_id'])
        
        # Lấy similarity cao nhất
        max_similarity = max(similarity_display, similarity_extracted, similarity_public_id)
        
        # Điều chỉnh confidence dựa trên type
        if img_data['type'] == 'edited_image' and max_similarity >= 0.7:
            final_confidence = min(0.95, max_similarity + 0.1)  # Bonus cho edited
        elif img_data['type'] == 'exact_match':
            final_confidence = max_similarity
        else:
            final_confidence = max_similarity * img_data['confidence']
        
        # Chỉ thêm nếu similarity >= 0.6
        if max_similarity >= 0.6:
            matches.append({
                'image': img,
                'type': img_data['type'],
                'similarity': max_similarity,
                'confidence': final_confidence,
                'priority': img_data['priority'],
                'similarity_breakdown': {
                    'display_name': similarity_display,
                    'extracted_code': similarity_extracted,
                    'public_id': similarity_public_id
                }
            })
    
    # Sắp xếp theo priority, confidence, similarity
    matches.sort(key=lambda x: (-x['priority'], -x['confidence'], -x['similarity']))
    
    return matches[:10]  # Top 10 matches

def categorize_mapping_confidence(confidence):
    """Phân loại độ tin cậy mapping"""
    if confidence >= 0.9:
        return 'HIGH'
    elif confidence >= 0.75:
        return 'MEDIUM'
    elif confidence >= 0.6:
        return 'LOW'
    else:
        return 'VERY_LOW'

def analyze_all_products(products_without_images, cloudinary_data):
    """Phân tích tất cả sản phẩm chưa có hình"""
    print(f"🔍 Đang phân tích {len(products_without_images)} sản phẩm...")
    
    analysis_results = {
        'high_confidence': [],
        'medium_confidence': [],
        'low_confidence': [],
        'no_matches': [],
        'statistics': {
            'total_products': len(products_without_images),
            'with_matches': 0,
            'without_matches': 0,
            'high_confidence_count': 0,
            'medium_confidence_count': 0,
            'low_confidence_count': 0
        }
    }
    
    for i, product in enumerate(products_without_images):
        if (i + 1) % 50 == 0:
            print(f"   📊 Đã xử lý {i + 1}/{len(products_without_images)} sản phẩm...")
        
        matches = find_matching_images_for_product(product, cloudinary_data)
        
        if matches:
            best_match = matches[0]
            confidence_level = categorize_mapping_confidence(best_match['confidence'])
            
            product_analysis = {
                'product': product,
                'best_match': best_match,
                'all_matches': matches,
                'confidence_level': confidence_level,
                'recommendation': 'auto' if confidence_level == 'HIGH' else 'manual'
            }
            
            if confidence_level == 'HIGH':
                analysis_results['high_confidence'].append(product_analysis)
                analysis_results['statistics']['high_confidence_count'] += 1
            elif confidence_level == 'MEDIUM':
                analysis_results['medium_confidence'].append(product_analysis)
                analysis_results['statistics']['medium_confidence_count'] += 1
            else:
                analysis_results['low_confidence'].append(product_analysis)
                analysis_results['statistics']['low_confidence_count'] += 1
            
            analysis_results['statistics']['with_matches'] += 1
        else:
            analysis_results['no_matches'].append(product)
            analysis_results['statistics']['without_matches'] += 1
    
    return analysis_results

def create_comprehensive_report(analysis_results):
    """Tạo báo cáo toàn diện"""
    stats = analysis_results['statistics']
    
    # Tính toán potential coverage
    potential_mappings = stats['high_confidence_count'] + stats['medium_confidence_count']
    current_with_images = 120  # Hiện tại
    total_products = 332
    
    current_coverage = (current_with_images / total_products) * 100
    potential_coverage = ((current_with_images + potential_mappings) / total_products) * 100
    
    report_content = f"""# 📊 BÁO CÁO PHÂN TÍCH MAPPING TOÀN DIỆN

## 📈 Tổng quan:
- **Sản phẩm chưa có hình:** {stats['total_products']}
- **Tìm thấy matches:** {stats['with_matches']} ({stats['with_matches']/stats['total_products']*100:.1f}%)
- **Không có matches:** {stats['without_matches']} ({stats['without_matches']/stats['total_products']*100:.1f}%)

## 🎯 Phân loại theo độ tin cậy:
- **HIGH (≥90%):** {stats['high_confidence_count']} sản phẩm - **TỰ ĐỘNG MAPPING**
- **MEDIUM (75-89%):** {stats['medium_confidence_count']} sản phẩm - **XEM XÉT THỦ CÔNG**
- **LOW (60-74%):** {stats['low_confidence_count']} sản phẩm - **CẦN KIỂM TRA KỸ**

## 📊 Dự báo coverage:
- **Hiện tại:** {current_coverage:.1f}% ({current_with_images}/{total_products})
- **Sau HIGH mapping:** {((current_with_images + stats['high_confidence_count'])/total_products)*100:.1f}% (+{stats['high_confidence_count']})
- **Sau MEDIUM mapping:** {potential_coverage:.1f}% (+{potential_mappings})
- **Mục tiêu 60%:** {'✅ ĐẠT ĐƯỢC' if potential_coverage >= 60 else '❌ CẦN THÊM'}

## 🎯 HIGH CONFIDENCE MAPPINGS ({stats['high_confidence_count']})
**Khuyến nghị: TỰ ĐỘNG MAPPING**

"""
    
    for i, item in enumerate(analysis_results['high_confidence'][:20], 1):
        product = item['product']
        match = item['best_match']
        
        report_content += f"{i}. **{product['code']}** - {product['name'][:50]}...\n"
        report_content += f"   🖼️ {match['image']['display_name']}\n"
        report_content += f"   📊 Confidence: {match['confidence']:.1%} | Type: {match['type']}\n"
        report_content += f"   🔗 {match['image']['url']}\n\n"
    
    if len(analysis_results['high_confidence']) > 20:
        report_content += f"... và {len(analysis_results['high_confidence']) - 20} sản phẩm khác\n\n"
    
    # Medium confidence
    report_content += f"""## 🔍 MEDIUM CONFIDENCE MAPPINGS ({stats['medium_confidence_count']})
**Khuyến nghị: XEM XÉT THỦ CÔNG**

"""
    
    for i, item in enumerate(analysis_results['medium_confidence'][:15], 1):
        product = item['product']
        match = item['best_match']
        
        report_content += f"{i}. **{product['code']}** - {product['name'][:50]}...\n"
        report_content += f"   🖼️ {match['image']['display_name']}\n"
        report_content += f"   📊 Confidence: {match['confidence']:.1%} | Type: {match['type']}\n"
        report_content += f"   🔗 {match['image']['url']}\n\n"
    
    if len(analysis_results['medium_confidence']) > 15:
        report_content += f"... và {len(analysis_results['medium_confidence']) - 15} sản phẩm khác\n\n"
    
    # Low confidence
    report_content += f"""## ⚠️ LOW CONFIDENCE MAPPINGS ({stats['low_confidence_count']})
**Khuyến nghị: CẦN KIỂM TRA KỸ**

"""
    
    for i, item in enumerate(analysis_results['low_confidence'][:10], 1):
        product = item['product']
        match = item['best_match']
        
        report_content += f"{i}. **{product['code']}** - {product['name'][:50]}...\n"
        report_content += f"   🖼️ {match['image']['display_name']}\n"
        report_content += f"   📊 Confidence: {match['confidence']:.1%} | Type: {match['type']}\n"
        report_content += f"   🔗 {match['image']['url']}\n\n"
    
    # No matches
    report_content += f"""## ❌ KHÔNG TÌM THẤY MATCHES ({stats['without_matches']})
**Khuyến nghị: CẦN UPLOAD HÌNH MỚI**

"""
    
    for i, product in enumerate(analysis_results['no_matches'][:15], 1):
        report_content += f"{i}. **{product['code']}** - {product['name'][:50]}...\n"
    
    if len(analysis_results['no_matches']) > 15:
        report_content += f"... và {len(analysis_results['no_matches']) - 15} sản phẩm khác\n"
    
    report_content += f"""

## 📋 KẾ HOẠCH THỰC HIỆN

### 🎯 Bước 1: Auto Mapping (HIGH Confidence)
- **Số lượng:** {stats['high_confidence_count']} sản phẩm
- **Phương pháp:** Tự động mapping qua script
- **Kết quả dự kiến:** Tăng coverage lên {((current_with_images + stats['high_confidence_count'])/total_products)*100:.1f}%

### 🔍 Bước 2: Manual Review (MEDIUM Confidence)
- **Số lượng:** {stats['medium_confidence_count']} sản phẩm
- **Phương pháp:** Xem xét thủ công từng trường hợp
- **Kết quả dự kiến:** Tăng coverage lên {potential_coverage:.1f}%

### ⚠️ Bước 3: Detailed Check (LOW Confidence)
- **Số lượng:** {stats['low_confidence_count']} sản phẩm
- **Phương pháp:** Kiểm tra kỹ lưỡng, có thể cần chỉnh sửa
- **Kết quả dự kiến:** Thêm 20-50% số sản phẩm này

### 📷 Bước 4: Upload New Images
- **Số lượng:** {stats['without_matches']} sản phẩm
- **Phương pháp:** Chụp/upload hình ảnh mới
- **Ưu tiên:** Sản phẩm có số lượng lớn, vị trí dễ tiếp cận

## 🎯 Mục tiêu 60% Coverage:
- **Cần mapping thêm:** {max(0, int(total_products * 0.6) - current_with_images)} sản phẩm
- **Có thể đạt được:** {potential_mappings} sản phẩm (HIGH + MEDIUM)
- **Kết luận:** {'✅ CÓ THỂ ĐẠT MỤC TIÊU' if potential_mappings >= (total_products * 0.6 - current_with_images) else '❌ CẦN THÊM HÌNH ẢNH MỚI'}

---
Tạo bởi: comprehensive-mapping-analysis.py
Thời gian: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
    
    return report_content

def save_analysis_data(analysis_results):
    """Lưu dữ liệu phân tích chi tiết"""
    with open('comprehensive-mapping-analysis.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'analysis_results': analysis_results
        }, f, ensure_ascii=False, indent=2)
    
    print("💾 Đã lưu dữ liệu phân tích: comprehensive-mapping-analysis.json")

def main():
    print("🚀 BẮT ĐẦU PHÂN TÍCH MAPPING TOÀN DIỆN")
    print("="*60)
    print("🎯 Mục tiêu: Tăng coverage từ 36.1% lên 60%+")
    
    # 1. Lấy sản phẩm chưa có hình
    products_without_images = get_products_without_images()
    if not products_without_images:
        print("❌ Không có sản phẩm nào cần mapping")
        return
    
    # 2. Load dữ liệu Cloudinary
    cloudinary_data = load_cloudinary_analysis()
    if not cloudinary_data:
        print("❌ Không có dữ liệu Cloudinary")
        return
    
    # 3. Phân tích tất cả sản phẩm
    analysis_results = analyze_all_products(products_without_images, cloudinary_data)
    
    # 4. Tạo báo cáo
    report = create_comprehensive_report(analysis_results)
    
    with open('BAO_CAO_MAPPING_TOAN_DIEN.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 5. Lưu dữ liệu chi tiết
    save_analysis_data(analysis_results)
    
    # 6. Tóm tắt kết quả
    stats = analysis_results['statistics']
    print(f"\n🎉 HOÀN TẤT PHÂN TÍCH!")
    print(f"📊 Kết quả:")
    print(f"   🎯 HIGH confidence: {stats['high_confidence_count']} (auto mapping)")
    print(f"   🔍 MEDIUM confidence: {stats['medium_confidence_count']} (manual review)")
    print(f"   ⚠️  LOW confidence: {stats['low_confidence_count']} (detailed check)")
    print(f"   ❌ No matches: {stats['without_matches']} (need new images)")
    
    potential_new = stats['high_confidence_count'] + stats['medium_confidence_count']
    new_coverage = ((120 + potential_new) / 332) * 100
    
    print(f"\n🎯 Dự báo coverage:")
    print(f"   📈 Hiện tại: 36.1% (120/332)")
    print(f"   📈 Sau mapping: {new_coverage:.1f}% (+{potential_new})")
    print(f"   🎯 Mục tiêu 60%: {'✅ ĐẠT ĐƯỢC' if new_coverage >= 60 else '❌ CẦN THÊM'}")
    
    print(f"\n📁 Files đã tạo:")
    print(f"   📋 BAO_CAO_MAPPING_TOAN_DIEN.md")
    print(f"   💾 comprehensive-mapping-analysis.json")

if __name__ == "__main__":
    main()
