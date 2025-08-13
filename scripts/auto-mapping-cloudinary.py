#!/usr/bin/env python3
"""
Script để thực hiện mapping tự động dựa trên kết quả phân tích Cloudinary
Ưu tiên các hình ảnh "edited" và similar matches
"""

import json
import urllib.request
import urllib.parse
from datetime import datetime
from pathlib import Path

# Supabase configuration
SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

def load_analysis_data():
    """Load dữ liệu phân tích từ file JSON"""
    try:
        with open('cloudinary-audit-analysis.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ Đã load dữ liệu phân tích: {data['summary']['total_images']} hình ảnh")
        return data
        
    except Exception as e:
        print(f"❌ Lỗi load dữ liệu phân tích: {e}")
        return None

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

def get_fabric_by_code(code):
    """Lấy fabric theo mã"""
    status_code, response = supabase_request('GET', f'fabrics?code=eq.{urllib.parse.quote(code)}&select=id,code,name,image')
    
    if status_code == 200:
        try:
            fabrics = json.loads(response)
            return fabrics[0] if fabrics else None
        except Exception as e:
            print(f"❌ Lỗi parse fabric {code}: {e}")
            return None
    else:
        return None

def update_fabric_image(fabric_id, image_url):
    """Cập nhật hình ảnh cho fabric"""
    update_data = {
        'image': image_url,
        'updated_at': datetime.now().isoformat()
    }
    
    status_code, response = supabase_request('PATCH', f'fabrics?id=eq.{fabric_id}', update_data)
    
    return status_code in [200, 204]

def normalize_code_for_matching(code):
    """Chuẩn hóa mã để matching"""
    if not code:
        return ""
    
    # Loại bỏ prefix fabrics/
    if code.startswith('fabrics/'):
        code = code[8:]
    
    # Loại bỏ các suffix random
    import re
    code = re.sub(r'_[a-z0-9]{6,}$', '', code)
    
    return code.strip()

def find_fabric_for_edited_image(edited_image, all_fabrics):
    """Tìm fabric phù hợp cho hình ảnh edited"""
    extracted_code = normalize_code_for_matching(edited_image['extracted_code'])
    
    # Thử tìm exact match trước
    for fabric in all_fabrics:
        if fabric['code'].upper() == extracted_code.upper():
            return fabric
    
    # Thử tìm similar match
    for fabric in all_fabrics:
        fabric_code = fabric['code'].upper()
        extracted_upper = extracted_code.upper()
        
        # Kiểm tra substring
        if extracted_upper in fabric_code or fabric_code in extracted_upper:
            return fabric
        
        # Kiểm tra similarity với threshold thấp hơn
        import difflib
        similarity = difflib.SequenceMatcher(None, fabric_code, extracted_upper).ratio()
        if similarity >= 0.8:
            return fabric
    
    return None

def process_edited_images(analysis, all_fabrics):
    """Xử lý các hình ảnh edited"""
    print("✏️ Đang xử lý hình ảnh edited...")
    
    edited_images = analysis['analysis']['edited_images']
    mapped_count = 0
    skipped_count = 0
    error_count = 0
    
    mapping_results = []
    
    for i, edited_img in enumerate(edited_images):
        print(f"   📝 {i+1}/{len(edited_images)}: {edited_img['display_name']}")
        
        # Tìm fabric phù hợp
        fabric = find_fabric_for_edited_image(edited_img, all_fabrics)
        
        if not fabric:
            skipped_count += 1
            print(f"      ⚠️  Không tìm thấy fabric cho {edited_img['extracted_code']}")
            continue
        
        # Kiểm tra xem fabric đã có hình chưa
        if fabric.get('image'):
            print(f"      ℹ️  {fabric['code']} đã có hình, bỏ qua")
            skipped_count += 1
            continue
        
        # Cập nhật hình ảnh
        if update_fabric_image(fabric['id'], edited_img['url']):
            mapped_count += 1
            print(f"      ✅ Mapped {fabric['code']} → {edited_img['display_name']}")
            
            mapping_results.append({
                'fabric_code': fabric['code'],
                'fabric_name': fabric['name'],
                'image_url': edited_img['url'],
                'image_display_name': edited_img['display_name'],
                'type': 'edited_image'
            })
        else:
            error_count += 1
            print(f"      ❌ Lỗi cập nhật {fabric['code']}")
    
    print(f"\n📊 Kết quả xử lý edited images:")
    print(f"   ✅ Mapped: {mapped_count}")
    print(f"   ⚠️  Bỏ qua: {skipped_count}")
    print(f"   ❌ Lỗi: {error_count}")
    
    return mapping_results

def process_similar_matches(analysis, all_fabrics):
    """Xử lý các similar matches với confidence cao"""
    print("\n🔍 Đang xử lý similar matches...")
    
    similar_matches = analysis['analysis']['similar_matches']
    mapped_count = 0
    skipped_count = 0
    error_count = 0
    
    mapping_results = []
    
    for i, match in enumerate(similar_matches):
        if not match['similar_fabrics']:
            continue
        
        # Chỉ xử lý những match có confidence >= 85%
        best_match = match['similar_fabrics'][0]
        if best_match['similarity'] < 0.85:
            skipped_count += 1
            continue
        
        print(f"   🎯 {i+1}/{len(similar_matches)}: {match['image']['extracted_code']} → {best_match['code']} ({best_match['similarity']:.1%})")
        
        # Tìm fabric
        fabric = None
        for f in all_fabrics:
            if f['code'] == best_match['code']:
                fabric = f
                break
        
        if not fabric:
            skipped_count += 1
            print(f"      ⚠️  Không tìm thấy fabric {best_match['code']}")
            continue
        
        # Kiểm tra xem fabric đã có hình chưa
        if fabric.get('image'):
            print(f"      ℹ️  {fabric['code']} đã có hình, bỏ qua")
            skipped_count += 1
            continue
        
        # Cập nhật hình ảnh
        if update_fabric_image(fabric['id'], match['image']['url']):
            mapped_count += 1
            print(f"      ✅ Mapped {fabric['code']} → {match['image']['display_name']}")
            
            mapping_results.append({
                'fabric_code': fabric['code'],
                'fabric_name': fabric['name'],
                'image_url': match['image']['url'],
                'image_display_name': match['image']['display_name'],
                'type': 'similar_match',
                'confidence': best_match['similarity']
            })
        else:
            error_count += 1
            print(f"      ❌ Lỗi cập nhật {fabric['code']}")
    
    print(f"\n📊 Kết quả xử lý similar matches:")
    print(f"   ✅ Mapped: {mapped_count}")
    print(f"   ⚠️  Bỏ qua: {skipped_count}")
    print(f"   ❌ Lỗi: {error_count}")
    
    return mapping_results

def process_exact_matches(analysis, all_fabrics):
    """Xử lý các exact matches chưa được map"""
    print("\n🎯 Đang xử lý exact matches...")
    
    exact_matches = analysis['analysis']['exact_matches']
    mapped_count = 0
    skipped_count = 0
    error_count = 0
    
    mapping_results = []
    
    for i, match in enumerate(exact_matches):
        if match['has_existing_image']:
            skipped_count += 1
            continue
        
        print(f"   ✅ {i+1}/{len(exact_matches)}: {match['fabric']['code']}")
        
        # Cập nhật hình ảnh
        if update_fabric_image(match['fabric']['id'], match['image']['url']):
            mapped_count += 1
            print(f"      ✅ Mapped {match['fabric']['code']} → {match['image']['display_name']}")
            
            mapping_results.append({
                'fabric_code': match['fabric']['code'],
                'fabric_name': match['fabric']['name'],
                'image_url': match['image']['url'],
                'image_display_name': match['image']['display_name'],
                'type': 'exact_match'
            })
        else:
            error_count += 1
            print(f"      ❌ Lỗi cập nhật {match['fabric']['code']}")
    
    print(f"\n📊 Kết quả xử lý exact matches:")
    print(f"   ✅ Mapped: {mapped_count}")
    print(f"   ⚠️  Bỏ qua: {skipped_count}")
    print(f"   ❌ Lỗi: {error_count}")
    
    return mapping_results

def get_all_fabrics():
    """Lấy tất cả fabrics từ database"""
    print("📥 Đang lấy tất cả fabrics từ database...")
    
    status_code, response = supabase_request('GET', 'fabrics?select=id,code,name,image')
    
    if status_code == 200:
        try:
            fabrics = json.loads(response)
            print(f"✅ Đã lấy {len(fabrics)} fabrics")
            return fabrics
        except Exception as e:
            print(f"❌ Lỗi parse fabrics: {e}")
            return []
    else:
        print(f"❌ Lỗi lấy fabrics: {status_code}")
        return []

def create_mapping_report(all_results):
    """Tạo báo cáo mapping"""
    
    total_mapped = len(all_results)
    
    # Thống kê theo type
    type_stats = {}
    for result in all_results:
        result_type = result['type']
        if result_type not in type_stats:
            type_stats[result_type] = 0
        type_stats[result_type] += 1
    
    report_content = f"""# 📊 BÁO CÁO AUTO MAPPING CLOUDINARY

## 📈 Tổng quan:
- **Tổng số mapping thành công:** {total_mapped}
- **Exact matches:** {type_stats.get('exact_match', 0)}
- **Edited images:** {type_stats.get('edited_image', 0)}
- **Similar matches:** {type_stats.get('similar_match', 0)}

## ✅ CHI TIẾT MAPPING

"""
    
    # Group by type
    for result_type, count in type_stats.items():
        type_name = {
            'exact_match': 'Exact Matches',
            'edited_image': 'Hình ảnh Edited',
            'similar_match': 'Similar Matches'
        }.get(result_type, result_type)
        
        report_content += f"### {type_name} ({count})\n\n"
        
        type_results = [r for r in all_results if r['type'] == result_type]
        
        for i, result in enumerate(type_results, 1):
            report_content += f"{i}. **{result['fabric_code']}** - {result['fabric_name'][:50]}...\n"
            report_content += f"   🖼️ {result['image_display_name']}\n"
            report_content += f"   🔗 {result['image_url']}\n"
            
            if 'confidence' in result:
                report_content += f"   📊 Confidence: {result['confidence']:.1%}\n"
            
            report_content += "\n"
    
    report_content += f"""
## 📊 Thống kê sau mapping:
- **Đã mapping:** {total_mapped} sản phẩm mới
- **Tổng có hình:** {118 + total_mapped} sản phẩm (ước tính)
- **Tỷ lệ có hình mới:** {(118 + total_mapped)/332*100:.1f}%

## 💡 Bước tiếp theo:
1. Restart web app để load hình ảnh mới
2. Kiểm tra chất lượng mapping
3. Xử lý các similar matches có confidence thấp hơn
4. Upload hình ảnh cho sản phẩm còn lại

---
Tạo bởi: auto-mapping-cloudinary.py
Thời gian: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
    
    return report_content

def main():
    print("🚀 BẮT ĐẦU AUTO MAPPING CLOUDINARY")
    print("="*60)
    
    # 1. Load dữ liệu phân tích
    analysis = load_analysis_data()
    if not analysis:
        print("❌ Không có dữ liệu phân tích")
        return
    
    # 2. Lấy tất cả fabrics
    all_fabrics = get_all_fabrics()
    if not all_fabrics:
        print("❌ Không có dữ liệu fabrics")
        return
    
    print(f"\n📊 Sẽ xử lý:")
    print(f"   ✅ {len(analysis['analysis']['exact_matches'])} exact matches")
    print(f"   ✏️ {len(analysis['analysis']['edited_images'])} hình edited")
    print(f"   🔍 {len(analysis['analysis']['similar_matches'])} similar matches")
    
    # Xác nhận từ user
    confirm = input("\n🔄 Bạn có muốn thực hiện auto mapping? (y/N): ")
    
    if confirm.lower() != 'y':
        print("❌ Đã hủy auto mapping")
        return
    
    all_results = []
    
    # 3. Xử lý exact matches
    exact_results = process_exact_matches(analysis, all_fabrics)
    all_results.extend(exact_results)
    
    # 4. Xử lý edited images
    edited_results = process_edited_images(analysis, all_fabrics)
    all_results.extend(edited_results)
    
    # 5. Xử lý similar matches
    similar_results = process_similar_matches(analysis, all_fabrics)
    all_results.extend(similar_results)
    
    # 6. Tạo báo cáo
    report = create_mapping_report(all_results)
    
    with open('BAO_CAO_AUTO_MAPPING.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 7. Lưu kết quả chi tiết
    with open('auto-mapping-results.json', 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_mapped': len(all_results),
            'results': all_results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n🎉 HOÀN TẤT AUTO MAPPING!")
    print(f"   ✅ Đã mapping {len(all_results)} sản phẩm")
    print(f"   📋 Báo cáo: BAO_CAO_AUTO_MAPPING.md")
    print(f"   💾 Chi tiết: auto-mapping-results.json")
    print("\n💡 Bước tiếp theo: Restart web app để thấy hình ảnh mới!")

if __name__ == "__main__":
    main()
