#!/usr/bin/env python3
"""
Quick fixes Phase 1 - Tăng coverage nhanh trong 1-2 giờ
Ninh ơi, script này implement:
1. Fix filename sanitization
2. Manual mapping dictionary  
3. Lower threshold to 60%
4. Better normalization
"""

import os
import re
import shutil
import subprocess
from pathlib import Path
import json

# Import functions
import sys
sys.path.append(os.path.dirname(__file__))
from analyze_vtt9_images import get_existing_fabric_codes, IMAGE_EXTENSIONS

# Paths
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"

def sanitize_filename(filename):
    """Sanitize filename để tránh lỗi copy"""
    # Replace problematic characters
    sanitized = filename.replace('/', '_')
    sanitized = sanitized.replace('\\', '_')
    sanitized = sanitized.replace(':', '_')
    sanitized = sanitized.replace('*', '_')
    sanitized = sanitized.replace('?', '_')
    sanitized = sanitized.replace('"', '_')
    sanitized = sanitized.replace('<', '_')
    sanitized = sanitized.replace('>', '_')
    sanitized = sanitized.replace('|', '_')
    
    # Remove multiple underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    sanitized = sanitized.strip('_')
    
    return sanitized

def create_comprehensive_manual_mappings():
    """Comprehensive manual mapping dictionary"""
    return {
        # High confidence matches from analysis
        'CAPRI 2796': 'CAPRI2769',
        'HEIO 3579': 'HEIO3579', 
        'HERMITAGE 27466 31': 'HERMITAGE27466-31',
        'CADIZ FLE SURF 01': 'CADIZFLESURF01',
        'Safari AC 1096': 'SAFARIIAC1096',
        'TWILIGHT 24 ROEBUCK': 'HBM BLACKOUT HUESO',
        'Sparkle plain': 'carnival  r/b purple',
        'Southface 23 plaza': 'HBM BLACKOUT HUESO',
        'PIOLA 41801.16': 'PIOLA4180116',
        'DUBLIN': 'DUBLIN',
        'MORVIS 02': 'MORVIS02',
        
        # Space normalization
        '130 479': '83100-13',
        '130 353': '130353',
        '120298': '120298',
        'BWB-8076': 'BWB8076',
        'STEP-06 BISCUIT': 'STEP06BISCUIT',
        
        # R/B pattern fixes
        'CAMVAL RBYY 210': 'CARNIVAL R/B MULBERRY 210',
        'carnival r/b purple': 'carnival  r/b purple',
        'carnival r/b slate 210': 'carnival r/b slate 210',
        'CARNIVAL R/B TEAL 210': 'CARNIVAL R/B TEAL 210',
        'CARNIVAL R/B MULBERRY 210': 'CARNIVAL R/B MULBERRY 210',
        'carnival r/b hot pink 210': 'carnival r/b hot pink 210',
        'carnival r/b mauve 210': 'Carnival r/b mauve 210',
        
        # Voile patterns  
        'Voile R/B Cream': 'Voile R/B Cream',
        'Voile R/B White': 'Voile R/B White',
        
        # Prefix removal
        'MO RONG VAI_BWB-8076': 'BWB-8076',
        'MO RONG VAI_130 353': '130353',
        'MO RONG VAI_120298': '120298',
        'MO RONG VAI_STEP-06 BISCUIT': 'STEP06BISCUIT',
        
        # High potential from analysis
        'YBTJS0647-81': '100054-0081',
        'BRICK 3700-22793': 'DCR-1000-2300-9124',
        'AS 225791': 'FB15151A2',
        'TAOS 94624.01': 'TP01623-00229',
        'Cadiz-01': '3c-40-11',
        'DC43901': '3c-40-11',
        '1080.05 DUBLIN': '100054-0081',
        
        # Additional patterns
        'Dixon': 'DIXON',
        'CAPRI2769': 'CAPRI2769',
        '8607': '8607',
        'Bản sao MORVIS 02': 'MORVIS02',
    }

def enhanced_normalize_for_comparison(text):
    """Enhanced normalization"""
    if not text:
        return ""
    
    text = text.upper()
    
    # Handle R/B patterns
    text = re.sub(r'R/B', 'RB', text)
    text = re.sub(r'B/R', 'BR', text)
    
    # Remove spaces and special chars
    text = re.sub(r'\s+', '', text)
    text = re.sub(r'[^\w\-]', '', text)
    text = re.sub(r'\-+', '-', text)
    text = text.strip('-')
    
    # Handle leading zeros
    text = re.sub(r'\b0+(\d+)', r'\1', text)
    
    return text

def enhanced_extract_fabric_code(filename):
    """Enhanced extraction với prefix/suffix removal"""
    name = Path(filename).stem
    
    # Remove prefixes
    prefixes = ['MO RONG VAI_', 'MỞ RỘNG VẢI_', 'MORONG_', 'VAI_', 'FABRIC_']
    for prefix in prefixes:
        if name.upper().startswith(prefix.upper()):
            name = name[len(prefix):]
            break
    
    # Remove suffixes
    suffixes = [' cankhoto', ' CANKHOTO', ' copy', ' COPY', ' (1)', ' (2)', ' (3)']
    for suffix in suffixes:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
            break
    
    # Clean up
    name = re.sub(r'\s*\d{8}\s*$', '', name)  # Remove dates
    name = re.sub(r'\s*\([^)]*\)\s*', ' ', name)  # Remove parentheses
    name = re.sub(r'\s+', ' ', name).strip()
    
    return name

def enhanced_calculate_similarity(str1, str2):
    """Enhanced similarity với multiple strategies"""
    if not str1 or not str2:
        return 0.0
    
    # Exact match
    if str1 == str2:
        return 1.0
    
    # Normalized match
    norm1 = enhanced_normalize_for_comparison(str1)
    norm2 = enhanced_normalize_for_comparison(str2)
    
    if norm1 == norm2:
        return 0.95
    
    # Substring match
    if norm1 in norm2 or norm2 in norm1:
        return 0.85
    
    # Token-based matching
    tokens1 = set(re.findall(r'\w+', norm1))
    tokens2 = set(re.findall(r'\w+', norm2))
    
    if tokens1 and tokens2:
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        if union:
            token_similarity = len(intersection) / len(union)
            if token_similarity > 0.5:
                return 0.7 + (token_similarity - 0.5) * 0.3
    
    # Character similarity
    common_chars = sum(1 for c in norm1 if c in norm2)
    max_len = max(len(norm1), len(norm2))
    
    if max_len > 0:
        return (common_chars / max_len) * 0.6
    
    return 0.0

def quick_fix_mapping():
    """Quick fix mapping với all improvements"""
    print("🚀 QUICK FIX MAPPING - PHASE 1")
    print("=" * 50)
    
    fabric_codes = get_existing_fabric_codes()
    manual_mappings = create_comprehensive_manual_mappings()
    
    print(f"📊 Fabric codes: {len(fabric_codes)}")
    print(f"📋 Manual mappings: {len(manual_mappings)}")
    
    # Get currently matched codes
    current_images = set()
    if os.path.exists(WEB_APP_IMAGES):
        for f in os.listdir(WEB_APP_IMAGES):
            if Path(f).suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}:
                current_images.add(Path(f).stem)
    
    print(f"✅ Currently matched: {len(current_images)}")
    
    # Find new matches
    new_matches = {}
    
    for root, dirs, files in os.walk(VTT9_FOLDER):
        for file in files:
            ext = Path(file).suffix.lower()
            if ext not in IMAGE_EXTENSIONS:
                continue
            
            extracted_code = enhanced_extract_fabric_code(file)
            
            # Check manual mappings first
            manual_match = None
            for manual_key, manual_value in manual_mappings.items():
                if enhanced_normalize_for_comparison(extracted_code) == enhanced_normalize_for_comparison(manual_key):
                    if manual_value in fabric_codes and manual_value not in current_images:
                        manual_match = manual_value
                        break
            
            if manual_match:
                new_matches[manual_match] = {
                    'file': file,
                    'path': os.path.join(root, file),
                    'extracted_code': extracted_code,
                    'similarity': 1.0,
                    'method': 'manual'
                }
                continue
            
            # Enhanced similarity matching với threshold 60%
            best_match = None
            best_score = 0.0
            
            for fabric_code in fabric_codes:
                if fabric_code in current_images:
                    continue  # Skip already matched
                
                score = enhanced_calculate_similarity(extracted_code, fabric_code)
                
                if score > best_score and score >= 0.6:  # Lowered threshold
                    best_score = score
                    best_match = fabric_code
            
            if best_match and best_match not in new_matches:
                new_matches[best_match] = {
                    'file': file,
                    'path': os.path.join(root, file),
                    'extracted_code': extracted_code,
                    'similarity': best_score,
                    'method': 'enhanced'
                }
    
    print(f"🎯 New matches found: {len(new_matches)}")
    
    return new_matches

def copy_new_matches(new_matches):
    """Copy new matches với sanitized filenames"""
    print(f"\n📋 COPYING {len(new_matches)} NEW MATCHES")
    print("=" * 50)
    
    success_count = 0
    error_count = 0
    
    for fabric_code, data in new_matches.items():
        try:
            source_path = data['path']
            source_ext = Path(source_path).suffix.lower()
            
            # Sanitize fabric code for filename
            sanitized_code = sanitize_filename(fabric_code)
            target_filename = f"{sanitized_code}.jpg"
            target_path = os.path.join(WEB_APP_IMAGES, target_filename)
            
            # Handle HEIC conversion
            if source_ext == '.heic':
                print(f"🔄 Converting HEIC: {fabric_code}")
                result = subprocess.run([
                    'sips', '-s', 'format', 'jpeg', source_path, '--out', target_path
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    success_count += 1
                    print(f"✅ Converted: {fabric_code} ({data['method']}, {data['similarity']:.2f})")
                else:
                    error_count += 1
                    print(f"❌ HEIC conversion failed: {fabric_code}")
            else:
                # Direct copy
                shutil.copy2(source_path, target_path)
                success_count += 1
                print(f"✅ Copied: {fabric_code} ({data['method']}, {data['similarity']:.2f})")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Error copying {fabric_code}: {e}")
    
    print(f"\n📊 COPY RESULTS:")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")
    
    return success_count, error_count

def calculate_new_coverage():
    """Calculate new coverage after fixes"""
    fabric_codes = get_existing_fabric_codes()
    
    if not os.path.exists(WEB_APP_IMAGES):
        return 0, 0
    
    image_files = [f for f in os.listdir(WEB_APP_IMAGES) 
                   if Path(f).suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'}]
    
    matched_codes = set()
    for image_file in image_files:
        # Handle sanitized filenames
        fabric_code = Path(image_file).stem
        # Try to find original fabric code
        for original_code in fabric_codes:
            if sanitize_filename(original_code) == fabric_code or original_code == fabric_code:
                matched_codes.add(original_code)
                break
    
    coverage = len(matched_codes) / len(fabric_codes) * 100
    return len(matched_codes), coverage

def main():
    """Main quick fix function"""
    print("🚀 QUICK FIXES PHASE 1 - TĂNG COVERAGE NHANH")
    print("=" * 60)
    
    # Step 1: Find new matches
    new_matches = quick_fix_mapping()
    
    if not new_matches:
        print("❌ Không tìm thấy matches mới")
        return
    
    # Step 2: Copy new matches
    success_count, error_count = copy_new_matches(new_matches)
    
    # Step 3: Calculate new coverage
    matched_count, coverage = calculate_new_coverage()
    
    print(f"\n🎉 PHASE 1 RESULTS:")
    print(f"   📈 New coverage: {matched_count}/326 ({coverage:.1f}%)")
    print(f"   ➕ Added: {success_count} new images")
    print(f"   ❌ Errors: {error_count}")
    print(f"   🎯 Coverage improvement: +{success_count} codes")
    
    # Save results
    results = {
        'phase': 1,
        'new_matches': len(new_matches),
        'success_count': success_count,
        'error_count': error_count,
        'final_coverage': coverage,
        'matched_count': matched_count
    }
    
    with open('phase1_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📋 Results saved to: phase1_results.json")
    print(f"🔄 Restart web app để xem {success_count} ảnh mới!")

if __name__ == "__main__":
    main()
