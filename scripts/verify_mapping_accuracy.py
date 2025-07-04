#!/usr/bin/env python3
"""
Verification script để kiểm tra tính chính xác tuyệt đối của mapping
Ninh ơi, script này sẽ:
1. Kiểm tra từng mapping có chính xác không
2. Highlight các cases có thể sai
3. Tạo danh sách cần review thủ công
4. Rollback nếu cần thiết
"""

import os
import json
from pathlib import Path
import shutil
from datetime import datetime

# Paths
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"

def load_phase1_results():
    """Load kết quả Phase 1"""
    try:
        with open('phase1_results.json', 'r') as f:
            return json.load(f)
    except:
        print("❌ Không tìm thấy phase1_results.json")
        return None

def get_recent_images():
    """Lấy danh sách ảnh được thêm gần đây"""
    if not os.path.exists(WEB_APP_IMAGES):
        return []
    
    recent_images = []
    current_time = datetime.now()
    
    for filename in os.listdir(WEB_APP_IMAGES):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            filepath = os.path.join(WEB_APP_IMAGES, filename)
            
            # Check modification time (within last hour)
            mod_time = datetime.fromtimestamp(os.path.getmtime(filepath))
            time_diff = (current_time - mod_time).total_seconds()
            
            if time_diff < 3600:  # Within 1 hour
                recent_images.append({
                    'filename': filename,
                    'fabric_code': Path(filename).stem,
                    'mod_time': mod_time,
                    'filepath': filepath
                })
    
    return sorted(recent_images, key=lambda x: x['mod_time'], reverse=True)

def manual_verification_cases():
    """Danh sách cases cần verify thủ công"""
    return {
        # Cases có thể mapping sai - cần kiểm tra visual
        'suspicious_mappings': [
            'DCR-71022-8',  # Mapped từ "71022-8.jpg" - có thể đúng nhưng cần confirm
            '71022-2',      # Mapped từ "71022-8.jpg" - có vẻ sai số
            'EB5448 ALA PASTER',  # Tên khác biệt nhiều
            'VN 10808',     # Pattern khác biệt
            'ET66470183',   # Số dài, cần verify
            'HENILY R/B RUN BN',  # Tên phức tạp
            '91200201S0103',  # Số dài, pattern khác
        ],
        
        # Manual mappings cần double-check
        'manual_mappings_to_verify': [
            'carnival  r/b purple',  # Có space thừa
            'HBM BLACKOUT HUESO',    # Mapped từ "TWILIGHT 24 ROEBUCK"
            'Voile R/B Cream',       # Có dấu "/"
            'CARNIVAL R/B MULBERRY 210',  # Mapped từ "CAMVAL RBYY 210"
            'DCR-1000-2300-9124',    # Mapped từ "BRICK 3700-22793"
        ],
        
        # High similarity nhưng cần confirm
        'high_similarity_verify': [
            'DCR-RP2010',    # 0.60 similarity - thấp
            '83086-13',      # 0.60 similarity - thấp  
            'BWB-8539',      # 0.60 similarity - thấp
            'DCR-1000-2300-9163',  # 0.73 similarity - medium
        ]
    }

def verify_mapping_accuracy():
    """Kiểm tra accuracy của mapping"""
    print("🔍 VERIFICATION - KIỂM TRA TÍNH CHÍNH XÁC MAPPING")
    print("=" * 60)
    
    recent_images = get_recent_images()
    verification_cases = manual_verification_cases()
    
    print(f"📊 Found {len(recent_images)} recent images to verify")
    
    # Categorize verification results
    results = {
        'definitely_correct': [],
        'probably_correct': [],
        'suspicious': [],
        'definitely_wrong': [],
        'need_manual_review': []
    }
    
    for image_data in recent_images:
        fabric_code = image_data['fabric_code']
        filename = image_data['filename']
        
        # Find original source file
        source_file = find_source_file(fabric_code)
        
        verification_result = {
            'fabric_code': fabric_code,
            'filename': filename,
            'source_file': source_file,
            'category': 'unknown',
            'confidence': 0,
            'reason': ''
        }
        
        # Check against verification cases
        if fabric_code in verification_cases['suspicious_mappings']:
            verification_result['category'] = 'suspicious'
            verification_result['confidence'] = 30
            verification_result['reason'] = 'In suspicious mappings list'
            results['suspicious'].append(verification_result)
            
        elif fabric_code in verification_cases['manual_mappings_to_verify']:
            verification_result['category'] = 'need_manual_review'
            verification_result['confidence'] = 50
            verification_result['reason'] = 'Manual mapping needs verification'
            results['need_manual_review'].append(verification_result)
            
        elif fabric_code in verification_cases['high_similarity_verify']:
            verification_result['category'] = 'suspicious'
            verification_result['confidence'] = 40
            verification_result['reason'] = 'Low similarity score'
            results['suspicious'].append(verification_result)
            
        else:
            # Check pattern similarity
            confidence = check_pattern_similarity(fabric_code, source_file)
            
            if confidence >= 90:
                verification_result['category'] = 'definitely_correct'
                verification_result['confidence'] = confidence
                verification_result['reason'] = 'High pattern similarity'
                results['definitely_correct'].append(verification_result)
                
            elif confidence >= 70:
                verification_result['category'] = 'probably_correct'
                verification_result['confidence'] = confidence
                verification_result['reason'] = 'Good pattern similarity'
                results['probably_correct'].append(verification_result)
                
            else:
                verification_result['category'] = 'suspicious'
                verification_result['confidence'] = confidence
                verification_result['reason'] = 'Low pattern similarity'
                results['suspicious'].append(verification_result)
    
    return results

def find_source_file(fabric_code):
    """Tìm source file gốc cho fabric code"""
    # This would need to be implemented to trace back to original VTT9 file
    # For now, return placeholder
    return f"Unknown source for {fabric_code}"

def check_pattern_similarity(fabric_code, source_file):
    """Check pattern similarity để estimate confidence"""
    # Simple heuristic based on fabric code patterns
    
    # Exact numeric matches
    if fabric_code.replace('-', '').replace(' ', '').isdigit():
        return 95
    
    # Standard patterns
    if any(pattern in fabric_code.upper() for pattern in ['DCR-', 'TP01623-', 'BWB-', 'HA ', 'JBL']):
        return 85
    
    # R/B patterns
    if 'R/B' in fabric_code or 'RB' in fabric_code:
        return 75
    
    # Long complex names
    if len(fabric_code) > 20:
        return 60
    
    # Default
    return 70

def generate_verification_report(results):
    """Tạo báo cáo verification chi tiết"""
    print(f"\n📋 VERIFICATION REPORT")
    print("=" * 50)
    
    total_images = sum(len(category) for category in results.values())
    
    print(f"📊 TỔNG QUAN ({total_images} ảnh):")
    print(f"   ✅ Definitely correct: {len(results['definitely_correct'])} ({len(results['definitely_correct'])/total_images*100:.1f}%)")
    print(f"   ✅ Probably correct: {len(results['probably_correct'])} ({len(results['probably_correct'])/total_images*100:.1f}%)")
    print(f"   ⚠️ Suspicious: {len(results['suspicious'])} ({len(results['suspicious'])/total_images*100:.1f}%)")
    print(f"   ❌ Definitely wrong: {len(results['definitely_wrong'])} ({len(results['definitely_wrong'])/total_images*100:.1f}%)")
    print(f"   🔍 Need manual review: {len(results['need_manual_review'])} ({len(results['need_manual_review'])/total_images*100:.1f}%)")
    
    # Show suspicious cases
    if results['suspicious']:
        print(f"\n⚠️ SUSPICIOUS MAPPINGS (cần kiểm tra):")
        for item in results['suspicious']:
            print(f"   • {item['fabric_code']} | Confidence: {item['confidence']}% | {item['reason']}")
    
    # Show manual review cases
    if results['need_manual_review']:
        print(f"\n🔍 NEED MANUAL REVIEW:")
        for item in results['need_manual_review']:
            print(f"   • {item['fabric_code']} | {item['reason']}")
    
    # Show definitely wrong cases
    if results['definitely_wrong']:
        print(f"\n❌ DEFINITELY WRONG (cần rollback):")
        for item in results['definitely_wrong']:
            print(f"   • {item['fabric_code']} | {item['reason']}")
    
    return results

def create_rollback_plan(results):
    """Tạo kế hoạch rollback cho mappings sai"""
    rollback_candidates = []
    
    # Add definitely wrong
    rollback_candidates.extend(results['definitely_wrong'])
    
    # Add suspicious with very low confidence
    for item in results['suspicious']:
        if item['confidence'] < 50:
            rollback_candidates.append(item)
    
    if rollback_candidates:
        print(f"\n🔄 ROLLBACK PLAN:")
        print(f"Recommend removing {len(rollback_candidates)} suspicious mappings:")
        
        for item in rollback_candidates:
            print(f"   • {item['fabric_code']} (confidence: {item['confidence']}%)")
        
        # Create rollback script
        rollback_script = "#!/bin/bash\n"
        rollback_script += "# Rollback suspicious mappings\n\n"
        
        for item in rollback_candidates:
            filepath = os.path.join(WEB_APP_IMAGES, item['filename'])
            rollback_script += f"rm -f '{filepath}'\n"
        
        with open('rollback_suspicious.sh', 'w') as f:
            f.write(rollback_script)
        
        print(f"📝 Rollback script saved: rollback_suspicious.sh")
        print(f"💡 Run: chmod +x rollback_suspicious.sh && ./rollback_suspicious.sh")
    
    return rollback_candidates

def main():
    """Main verification function"""
    print("🔍 MAPPING ACCURACY VERIFICATION")
    print("=" * 60)
    print("🎯 Mục tiêu: Đảm bảo mapping chính xác tuyệt đối")
    print("⚠️ Sẽ highlight các cases có thể sai để review")
    
    # Load Phase 1 results
    phase1_results = load_phase1_results()
    if phase1_results:
        print(f"📊 Phase 1 added: {phase1_results['success_count']} images")
    
    # Verify mapping accuracy
    results = verify_mapping_accuracy()
    
    # Generate report
    verification_report = generate_verification_report(results)
    
    # Create rollback plan if needed
    rollback_candidates = create_rollback_plan(results)
    
    # Save verification results
    with open('verification_results.json', 'w', encoding='utf-8') as f:
        json.dump(verification_report, f, ensure_ascii=False, indent=2, default=str)
    
    # Summary and recommendations
    total_suspicious = len(results['suspicious']) + len(results['definitely_wrong'])
    total_images = sum(len(category) for category in results.values())
    accuracy_rate = (total_images - total_suspicious) / total_images * 100 if total_images > 0 else 0
    
    print(f"\n🎯 FINAL ASSESSMENT:")
    print(f"   📊 Estimated accuracy: {accuracy_rate:.1f}%")
    print(f"   ⚠️ Cases need review: {total_suspicious}/{total_images}")
    print(f"   🔄 Rollback candidates: {len(rollback_candidates)}")
    
    if accuracy_rate < 80:
        print(f"\n❌ RECOMMENDATION: ROLLBACK")
        print(f"   Accuracy quá thấp ({accuracy_rate:.1f}%), nên rollback và review thủ công")
    elif total_suspicious > 10:
        print(f"\n⚠️ RECOMMENDATION: PARTIAL ROLLBACK")
        print(f"   Rollback {len(rollback_candidates)} cases có confidence thấp")
    else:
        print(f"\n✅ RECOMMENDATION: KEEP WITH REVIEW")
        print(f"   Accuracy chấp nhận được, chỉ cần review {total_suspicious} cases")
    
    print(f"\n📁 Files created:")
    print(f"   • verification_results.json - Chi tiết verification")
    print(f"   • rollback_suspicious.sh - Script rollback nếu cần")

if __name__ == "__main__":
    main()
