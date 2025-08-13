#!/usr/bin/env python3
"""
Script để kiểm tra và rà soát tất cả hình ảnh trong Cloudinary
Tìm các hình ảnh trùng khớp, tương đồng và lên kế hoạch mapping
Đặc biệt chú ý các file có "edited" trong tên
"""

import json
import urllib.request
import urllib.parse
import re
from datetime import datetime
from pathlib import Path
import difflib

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = 'dgaktc3fb'
CLOUDINARY_API_KEY = '917768158798778'
CLOUDINARY_API_SECRET = 'ZkCVC7alaaSgcnW5kVXYQbxL5uU'

# Supabase configuration
SUPABASE_URL = 'https://zgrfqkytbmahxcbgpkxx.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'

def cloudinary_request(endpoint, params=None):
    """Thực hiện request đến Cloudinary API"""
    import base64
    
    if params is None:
        params = {}
    
    # Add authentication
    auth_string = f"{CLOUDINARY_API_KEY}:{CLOUDINARY_API_SECRET}"
    auth_bytes = auth_string.encode('ascii')
    auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
    
    # Build URL
    base_url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}"
    url = f"{base_url}/{endpoint}"
    
    if params:
        query_string = urllib.parse.urlencode(params)
        url = f"{url}?{query_string}"
    
    headers = {
        'Authorization': f'Basic {auth_b64}',
        'Content-Type': 'application/json'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            return response.getcode(), response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def get_all_cloudinary_images():
    """Lấy tất cả hình ảnh từ Cloudinary"""
    print("📥 Đang lấy tất cả hình ảnh từ Cloudinary...")

    all_images = []
    next_cursor = None
    page = 1

    while True:
        print(f"   📄 Đang lấy trang {page}...")

        params = {
            'type': 'upload',
            'max_results': 500,
            'resource_type': 'image'
        }
        
        if next_cursor:
            params['next_cursor'] = next_cursor
        
        status_code, response = cloudinary_request('resources/image', params)
        
        if status_code != 200:
            print(f"❌ Lỗi lấy dữ liệu trang {page}: {status_code} - {response}")
            break
        
        try:
            data = json.loads(response)
            images = data.get('resources', [])
            all_images.extend(images)
            
            print(f"   ✅ Trang {page}: {len(images)} hình ảnh")
            
            next_cursor = data.get('next_cursor')
            if not next_cursor:
                break
                
            page += 1
            
        except Exception as e:
            print(f"❌ Lỗi parse response trang {page}: {e}")
            break
    
    print(f"✅ Đã lấy tổng cộng {len(all_images)} hình ảnh từ Cloudinary")
    return all_images

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

def get_all_fabric_codes():
    """Lấy tất cả mã vải từ database"""
    print("📥 Đang lấy tất cả mã vải từ database...")
    
    status_code, response = supabase_request('GET', 'fabrics?select=code,name,image')
    
    if status_code == 200:
        try:
            fabrics = json.loads(response)
            print(f"✅ Đã lấy {len(fabrics)} mã vải từ database")
            return fabrics
        except Exception as e:
            print(f"❌ Lỗi parse response: {e}")
            return []
    else:
        print(f"❌ Lỗi lấy dữ liệu: {status_code} - {response}")
        return []

def extract_fabric_code_from_filename(filename):
    """Trích xuất mã vải từ tên file"""
    # Loại bỏ extension và prefix
    name = filename.replace('fabric_images/', '').replace('.jpg', '').replace('.png', '').replace('.jpeg', '')
    
    # Loại bỏ các suffix như _edited, _copy, _v2, etc
    name = re.sub(r'_edited.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_copy.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_v\d+.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_\d+$', '', name)
    
    return name.strip()

def normalize_code(code):
    """Chuẩn hóa mã để so sánh"""
    if not code:
        return ""
    
    # Chuyển về uppercase và loại bỏ khoảng trắng
    normalized = str(code).upper().strip()
    
    # Loại bỏ các ký tự đặc biệt
    normalized = re.sub(r'[^\w\-]', '', normalized)
    
    return normalized

def find_similar_codes(code, all_codes, threshold=0.8):
    """Tìm các mã tương đồng"""
    similar = []
    normalized_code = normalize_code(code)
    
    for other_code in all_codes:
        normalized_other = normalize_code(other_code)
        
        if normalized_code == normalized_other:
            continue
        
        # Sử dụng difflib để tính độ tương đồng
        similarity = difflib.SequenceMatcher(None, normalized_code, normalized_other).ratio()
        
        if similarity >= threshold:
            similar.append({
                'code': other_code,
                'similarity': similarity
            })
    
    return sorted(similar, key=lambda x: x['similarity'], reverse=True)

def analyze_cloudinary_images(images, fabrics):
    """Phân tích hình ảnh Cloudinary"""
    print("🔍 Đang phân tích hình ảnh Cloudinary...")
    
    # Tạo danh sách mã vải từ database
    fabric_codes = [f['code'] for f in fabrics]
    fabric_dict = {normalize_code(f['code']): f for f in fabrics}
    
    analysis = {
        'total_images': len(images),
        'exact_matches': [],
        'similar_matches': [],
        'edited_images': [],
        'unmapped_images': [],
        'duplicate_codes': {},
        'fabric_without_images': []
    }
    
    # Phân tích từng hình ảnh
    for img in images:
        public_id = img.get('public_id', '')
        display_name = img.get('display_name', public_id)
        filename = public_id.split('/')[-1] if '/' in public_id else public_id
        
        # Trích xuất mã vải từ filename
        extracted_code = extract_fabric_code_from_filename(public_id)
        normalized_extracted = normalize_code(extracted_code)
        
        # Kiểm tra edited images
        if 'edited' in display_name.lower() or 'edited' in public_id.lower():
            analysis['edited_images'].append({
                'public_id': public_id,
                'display_name': display_name,
                'extracted_code': extracted_code,
                'url': img.get('secure_url', ''),
                'created_at': img.get('created_at', ''),
                'bytes': img.get('bytes', 0)
            })
        
        # Tìm exact match
        exact_match = None
        for fabric in fabrics:
            if normalize_code(fabric['code']) == normalized_extracted:
                exact_match = fabric
                break
        
        if exact_match:
            analysis['exact_matches'].append({
                'image': {
                    'public_id': public_id,
                    'display_name': display_name,
                    'url': img.get('secure_url', ''),
                    'extracted_code': extracted_code
                },
                'fabric': exact_match,
                'has_existing_image': bool(exact_match.get('image'))
            })
        else:
            # Tìm similar matches
            similar = find_similar_codes(extracted_code, fabric_codes, threshold=0.7)
            
            if similar:
                analysis['similar_matches'].append({
                    'image': {
                        'public_id': public_id,
                        'display_name': display_name,
                        'url': img.get('secure_url', ''),
                        'extracted_code': extracted_code
                    },
                    'similar_fabrics': similar[:5]  # Top 5 similar
                })
            else:
                analysis['unmapped_images'].append({
                    'public_id': public_id,
                    'display_name': display_name,
                    'url': img.get('secure_url', ''),
                    'extracted_code': extracted_code
                })
        
        # Kiểm tra duplicate codes
        if normalized_extracted in analysis['duplicate_codes']:
            analysis['duplicate_codes'][normalized_extracted].append({
                'public_id': public_id,
                'display_name': display_name,
                'url': img.get('secure_url', '')
            })
        else:
            analysis['duplicate_codes'][normalized_extracted] = [{
                'public_id': public_id,
                'display_name': display_name,
                'url': img.get('secure_url', '')
            }]
    
    # Loại bỏ codes không có duplicate
    analysis['duplicate_codes'] = {k: v for k, v in analysis['duplicate_codes'].items() if len(v) > 1}
    
    # Tìm fabrics không có hình ảnh
    mapped_codes = set()
    for match in analysis['exact_matches']:
        mapped_codes.add(normalize_code(match['fabric']['code']))
    
    for fabric in fabrics:
        normalized_code = normalize_code(fabric['code'])
        if normalized_code not in mapped_codes and not fabric.get('image'):
            analysis['fabric_without_images'].append(fabric)
    
    return analysis

def create_detailed_report(analysis, images, fabrics):
    """Tạo báo cáo chi tiết"""
    
    report_content = f"""# 📊 BÁO CÁO RÀ SOÁT HÌNH ẢNH CLOUDINARY

## 📈 Tổng quan:
- **Tổng hình ảnh trong Cloudinary:** {analysis['total_images']}
- **Tổng sản phẩm trong database:** {len(fabrics)}
- **Exact matches:** {len(analysis['exact_matches'])}
- **Similar matches:** {len(analysis['similar_matches'])}
- **Hình ảnh có "edited":** {len(analysis['edited_images'])}
- **Hình ảnh chưa map:** {len(analysis['unmapped_images'])}
- **Mã trùng lặp:** {len(analysis['duplicate_codes'])}
- **Sản phẩm chưa có hình:** {len(analysis['fabric_without_images'])}

## 🎯 EXACT MATCHES ({len(analysis['exact_matches'])})
Các hình ảnh khớp chính xác với mã sản phẩm:

"""
    
    for i, match in enumerate(analysis['exact_matches'][:20], 1):
        status = "✅ Đã có hình" if match['has_existing_image'] else "🆕 Chưa có hình"
        report_content += f"{i}. **{match['fabric']['code']}** - {match['fabric']['name'][:50]}...\n"
        report_content += f"   📷 {match['image']['display_name']} ({status})\n"
        report_content += f"   🔗 {match['image']['url']}\n\n"
    
    if len(analysis['exact_matches']) > 20:
        report_content += f"... và {len(analysis['exact_matches']) - 20} matches khác\n\n"
    
    # Edited images
    if analysis['edited_images']:
        report_content += f"""## ✏️ HÌNH ẢNH CÓ "EDITED" ({len(analysis['edited_images'])})
Các hình ảnh có từ "edited" trong tên - cần xem xét ưu tiên:

"""
        for i, img in enumerate(analysis['edited_images'][:15], 1):
            report_content += f"{i}. **{img['display_name']}**\n"
            report_content += f"   📝 Mã trích xuất: {img['extracted_code']}\n"
            report_content += f"   🔗 {img['url']}\n"
            report_content += f"   📅 {img['created_at']}\n\n"
        
        if len(analysis['edited_images']) > 15:
            report_content += f"... và {len(analysis['edited_images']) - 15} hình edited khác\n\n"
    
    # Similar matches
    if analysis['similar_matches']:
        report_content += f"""## 🔍 SIMILAR MATCHES ({len(analysis['similar_matches'])})
Các hình ảnh có mã tương đồng với sản phẩm:

"""
        for i, match in enumerate(analysis['similar_matches'][:10], 1):
            report_content += f"{i}. **{match['image']['extracted_code']}** ({match['image']['display_name']})\n"
            report_content += f"   🎯 Có thể khớp với:\n"
            for similar in match['similar_fabrics'][:3]:
                report_content += f"      • {similar['code']} (độ tương đồng: {similar['similarity']:.1%})\n"
            report_content += f"   🔗 {match['image']['url']}\n\n"
    
    # Duplicate codes
    if analysis['duplicate_codes']:
        report_content += f"""## 🔄 MÃ TRÙNG LẶP ({len(analysis['duplicate_codes'])})
Các mã có nhiều hình ảnh:

"""
        for code, images_list in list(analysis['duplicate_codes'].items())[:10]:
            report_content += f"**{code}** ({len(images_list)} hình ảnh):\n"
            for img in images_list:
                report_content += f"   • {img['display_name']}\n"
                report_content += f"     🔗 {img['url']}\n"
            report_content += "\n"
    
    # Unmapped images
    if analysis['unmapped_images']:
        report_content += f"""## ❓ HÌNH ẢNH CHƯA MAP ({len(analysis['unmapped_images'])})
Các hình ảnh không khớp với sản phẩm nào:

"""
        for i, img in enumerate(analysis['unmapped_images'][:15], 1):
            report_content += f"{i}. **{img['display_name']}**\n"
            report_content += f"   📝 Mã trích xuất: {img['extracted_code']}\n"
            report_content += f"   🔗 {img['url']}\n\n"
    
    # Fabrics without images
    report_content += f"""## 📷 SẢN PHẨM CHƯA CÓ HÌNH ({len(analysis['fabric_without_images'])})
Các sản phẩm trong database chưa có hình ảnh:

"""
    for i, fabric in enumerate(analysis['fabric_without_images'][:20], 1):
        report_content += f"{i}. **{fabric['code']}** - {fabric['name'][:50]}...\n"
    
    if len(analysis['fabric_without_images']) > 20:
        report_content += f"... và {len(analysis['fabric_without_images']) - 20} sản phẩm khác\n"
    
    report_content += f"""

## 📋 KẾ HOẠCH MAPPING

### 🎯 Ưu tiên 1: Exact Matches
- **{len([m for m in analysis['exact_matches'] if not m['has_existing_image']])} sản phẩm** có hình exact match nhưng chưa được map
- **Hành động:** Tự động map ngay lập tức

### ✏️ Ưu tiên 2: Hình ảnh Edited
- **{len(analysis['edited_images'])} hình ảnh** có "edited" trong tên
- **Hành động:** Xem xét thủ công, có thể là phiên bản cải tiến

### 🔍 Ưu tiên 3: Similar Matches
- **{len(analysis['similar_matches'])} hình ảnh** có mã tương đồng
- **Hành động:** Xem xét thủ công để xác nhận mapping

### 🔄 Ưu tiên 4: Duplicate Codes
- **{len(analysis['duplicate_codes'])} mã** có nhiều hình ảnh
- **Hành động:** Chọn hình ảnh tốt nhất (ưu tiên edited version)

### 📷 Ưu tiên 5: Upload mới
- **{len(analysis['fabric_without_images'])} sản phẩm** chưa có hình ảnh
- **Hành động:** Cần chụp/upload hình ảnh mới

## 📊 Thống kê mapping hiện tại:
- **Đã có hình:** {len([f for f in fabrics if f.get('image')])} sản phẩm
- **Chưa có hình:** {len([f for f in fabrics if not f.get('image')])} sản phẩm
- **Tỷ lệ có hình:** {len([f for f in fabrics if f.get('image')])/len(fabrics)*100:.1f}%

---
Tạo bởi: audit-cloudinary-images.py
Thời gian: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""
    
    return report_content

def save_detailed_data(analysis, images, fabrics):
    """Lưu dữ liệu chi tiết để xử lý sau"""
    
    # Lưu analysis data
    analysis_data = {
        'timestamp': datetime.now().isoformat(),
        'summary': {
            'total_images': analysis['total_images'],
            'total_fabrics': len(fabrics),
            'exact_matches': len(analysis['exact_matches']),
            'similar_matches': len(analysis['similar_matches']),
            'edited_images': len(analysis['edited_images']),
            'unmapped_images': len(analysis['unmapped_images']),
            'duplicate_codes': len(analysis['duplicate_codes']),
            'fabric_without_images': len(analysis['fabric_without_images'])
        },
        'analysis': analysis
    }
    
    with open('cloudinary-audit-analysis.json', 'w', encoding='utf-8') as f:
        json.dump(analysis_data, f, ensure_ascii=False, indent=2)
    
    print("💾 Đã lưu dữ liệu chi tiết: cloudinary-audit-analysis.json")

def main():
    print("🚀 BẮT ĐẦU RÀ SOÁT HÌNH ẢNH CLOUDINARY")
    print("="*60)
    
    # 1. Lấy tất cả hình ảnh từ Cloudinary
    images = get_all_cloudinary_images()
    if not images:
        print("❌ Không có hình ảnh để phân tích")
        return
    
    # 2. Lấy tất cả mã vải từ database
    fabrics = get_all_fabric_codes()
    if not fabrics:
        print("❌ Không có dữ liệu fabric để so sánh")
        return
    
    # 3. Phân tích hình ảnh
    analysis = analyze_cloudinary_images(images, fabrics)
    
    # 4. Tạo báo cáo
    report = create_detailed_report(analysis, images, fabrics)
    
    with open('BAO_CAO_RA_SOAT_CLOUDINARY.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 5. Lưu dữ liệu chi tiết
    save_detailed_data(analysis, images, fabrics)
    
    print(f"\n🎉 HOÀN TẤT RÀ SOÁT!")
    print(f"📊 Tổng kết:")
    print(f"   📷 Tổng hình ảnh: {analysis['total_images']}")
    print(f"   ✅ Exact matches: {len(analysis['exact_matches'])}")
    print(f"   ✏️ Hình edited: {len(analysis['edited_images'])}")
    print(f"   🔍 Similar matches: {len(analysis['similar_matches'])}")
    print(f"   🔄 Mã trùng lặp: {len(analysis['duplicate_codes'])}")
    print(f"   ❓ Chưa map: {len(analysis['unmapped_images'])}")
    print(f"   📷 Sản phẩm chưa có hình: {len(analysis['fabric_without_images'])}")
    
    print(f"\n📁 Files đã tạo:")
    print(f"   📋 BAO_CAO_RA_SOAT_CLOUDINARY.md - Báo cáo chi tiết")
    print(f"   💾 cloudinary-audit-analysis.json - Dữ liệu phân tích")

if __name__ == "__main__":
    main()
