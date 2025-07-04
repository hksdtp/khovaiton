#!/usr/bin/env python3
"""
Improved matching logic để tăng coverage từ 54.3% lên cao hơn
Ninh ơi, script này implement các cải thiện:
1. Lower threshold (60% thay vì 70%)
2. Better normalization
3. Prefix/suffix handling
4. Manual mapping dictionary
"""

import os
import re
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# Import functions from previous scripts
import sys
sys.path.append(os.path.dirname(__file__))
from analyze_vtt9_images import (
    get_existing_fabric_codes,
    IMAGE_EXTENSIONS
)

# Paths
VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
WEB_APP_IMAGES = "/Users/nih/web app/khovaiton/public/images/fabrics"

def enhanced_extract_fabric_code(filename):
    """Enhanced fabric code extraction với nhiều cải thiện"""
    # Remove extension
    name = Path(filename).stem
    
    # Remove common prefixes
    prefixes_to_remove = [
        'MO RONG VAI_', 'MỞ RỘNG VẢI_', 'MORONG_',
        'VAI_', 'FABRIC_', 'IMG_', 'DSC_'
    ]
    
    for prefix in prefixes_to_remove:
        if name.upper().startswith(prefix.upper()):
            name = name[len(prefix):]
            break
    
    # Remove common suffixes
    suffixes_to_remove = [
        ' cankhoto', ' CANKHOTO', ' copy', ' COPY', 
        ' (1)', ' (2)', ' (3)', ' - Copy'
    ]
    
    for suffix in suffixes_to_remove:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
            break
    
    # Remove date patterns
    name = re.sub(r'\s*\d{8}\s*$', '', name)  # Remove 8-digit dates
    name = re.sub(r'\s*\d{6}\s*$', '', name)  # Remove 6-digit dates
    
    # Clean up parentheses content
    name = re.sub(r'\s*\([^)]*\)\s*', ' ', name)
    
    # Normalize spaces and dashes
    name = re.sub(r'\s+', ' ', name).strip()
    name = re.sub(r'\s*-\s*', '-', name)
    
    return name

def enhanced_normalize_for_comparison(text):
    """Enhanced normalization cho comparison tốt hơn"""
    if not text:
        return ""
    
    # Convert to uppercase
    text = text.upper()
    
    # Handle common variations
    text = re.sub(r'R/B', 'RB', text)  # R/B → RB
    text = re.sub(r'B/R', 'BR', text)  # B/R → BR
    text = re.sub(r'\s+', '', text)    # Remove all spaces
    text = re.sub(r'[^\w\-]', '', text)  # Keep only alphanumeric and dash
    text = re.sub(r'\-+', '-', text)     # Normalize multiple dashes
    text = text.strip('-')               # Remove leading/trailing dashes
    
    # Handle leading zeros
    text = re.sub(r'\b0+(\d+)', r'\1', text)  # 071 → 71
    
    return text

def enhanced_calculate_similarity(str1, str2):
    """Enhanced similarity calculation với multiple strategies"""
    if not str1 or not str2:
        return 0.0
    
    # Strategy 1: Exact match
    if str1 == str2:
        return 1.0
    
    # Strategy 2: Normalized exact match
    norm1 = enhanced_normalize_for_comparison(str1)
    norm2 = enhanced_normalize_for_comparison(str2)
    
    if norm1 == norm2:
        return 0.95
    
    # Strategy 3: Substring match
    if norm1 in norm2 or norm2 in norm1:
        return 0.85
    
    # Strategy 4: Token-based matching
    tokens1 = set(re.findall(r'\w+', norm1))
    tokens2 = set(re.findall(r'\w+', norm2))
    
    if tokens1 and tokens2:
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        token_similarity = len(intersection) / len(union)
        
        if token_similarity > 0.5:
            return 0.7 + (token_similarity - 0.5) * 0.3  # 0.7-1.0 range
    
    # Strategy 5: Character-based similarity
    common_chars = sum(1 for c in norm1 if c in norm2)
    max_len = max(len(norm1), len(norm2))
    
    if max_len > 0:
        char_similarity = common_chars / max_len
        return char_similarity * 0.6  # Max 0.6 for char similarity
    
    return 0.0

def create_manual_mapping_dictionary():
    """Tạo dictionary mapping thủ công cho các cases đặc biệt"""
    manual_mappings = {
        # Based on analysis results
        'CAPRI 2796': 'CAPRI2769',
        'HEIO 3579': 'HEIO3579',
        'HERMITAGE 27466 31': 'HERMITAGE27466-31',
        'CADIZ FLE SURF 01': 'CADIZFLESURF01',
        'Safari AC 1096': 'SAFARIIAC1096',
        'TWILIGHT 24 ROEBUCK': 'TWILIGHT24ROEBUCK',
        'Sparkle plain': 'SPARKLEPLAIN',
        'Southface 23 plaza': 'SOUTHFACE23PLAZA',
        'PIOLA 41801.16': 'PIOLA4180116',
        'DUBLIN': 'DUBLIN',
        'MORVIS 02': 'MORVIS02',
        
        # Common patterns
        '130 479': '130479',
        '130 353': '130353',
        '120298': '120298',
        'BWB-8076': 'BWB8076',
        'STEP-06 BISCUIT': 'STEP06BISCUIT',
        
        # R/B patterns
        'CAMVAL RBYY 210': 'CARNIVALRB210',
        'carnival r/b purple': 'CARNIVALRBPURPLE',
        'carnival r/b slate 210': 'CARNIVALRBSLATE210',
        'CARNIVAL R/B TEAL 210': 'CARNIVALRBTEAL210',
        'CARNIVAL R/B MULBERRY 210': 'CARNIVALRBMULBERRY210',
        'carnival r/b hot pink 210': 'CARNIVALRBHOTPINK210',
        'carnival r/b mauve 210': 'CARNIVALRBMAUVE210',
        
        # Voile patterns
        'Voile R/B Cream': 'VOILERBCREAM',
        'Voile R/B White': 'VOILERBWHITE',
    }
    
    return manual_mappings

def improved_map_images_to_fabric_codes():
    """Improved mapping với enhanced logic"""
    print("\n🎯 IMPROVED MAPPING ẢNH VỚI MÃ VẢI")
    print("=" * 50)
    
    # Get existing fabric codes
    fabric_codes = get_existing_fabric_codes()
    print(f"📊 Tổng số mã vải: {len(fabric_codes)}")
    
    # Get manual mappings
    manual_mappings = create_manual_mapping_dictionary()
    print(f"📋 Manual mappings: {len(manual_mappings)}")
    
    # Scan images
    image_mapping = {
        'matched': {},
        'unmatched': [],
        'missing_codes': set(fabric_codes.copy()),
        'similarity_scores': {},
        'manual_matches': 0,
        'improved_matches': 0
    }
    
    for root, dirs, files in os.walk(VTT9_FOLDER):
        for file in files:
            ext = Path(file).suffix.lower()
            if ext not in IMAGE_EXTENSIONS:
                continue
                
            # Enhanced extraction
            extracted_code = enhanced_extract_fabric_code(file)
            
            # Check manual mappings first
            manual_match = None
            for manual_key, manual_value in manual_mappings.items():
                if enhanced_normalize_for_comparison(extracted_code) == enhanced_normalize_for_comparison(manual_key):
                    # Find fabric code that matches manual_value
                    for fabric_code in fabric_codes:
                        if enhanced_normalize_for_comparison(fabric_code) == enhanced_normalize_for_comparison(manual_value):
                            manual_match = fabric_code
                            break
                    if manual_match:
                        break
            
            if manual_match:
                image_mapping['matched'][manual_match] = {
                    'file': file,
                    'path': os.path.join(root, file),
                    'extracted_code': extracted_code,
                    'similarity': 1.0,
                    'method': 'manual'
                }
                image_mapping['missing_codes'].discard(manual_match)
                image_mapping['manual_matches'] += 1
                continue
            
            # Enhanced similarity matching với lower threshold
            best_match = None
            best_score = 0.0
            
            for fabric_code in fabric_codes:
                score = enhanced_calculate_similarity(extracted_code, fabric_code)
                
                if score > best_score and score >= 0.6:  # Lowered from 0.7 to 0.6
                    best_score = score
                    best_match = fabric_code
            
            if best_match:
                # Only keep the best match for each fabric code
                if best_match not in image_mapping['matched'] or \
                   best_score > image_mapping['similarity_scores'].get(best_match, 0):
                    
                    # Check if this is an improvement over previous matching
                    method = 'improved' if best_score >= 0.6 and best_score < 0.7 else 'standard'
                    if method == 'improved':
                        image_mapping['improved_matches'] += 1
                    
                    image_mapping['matched'][best_match] = {
                        'file': file,
                        'path': os.path.join(root, file),
                        'extracted_code': extracted_code,
                        'similarity': best_score,
                        'method': method
                    }
                    image_mapping['similarity_scores'][best_match] = best_score
                    image_mapping['missing_codes'].discard(best_match)
            else:
                image_mapping['unmatched'].append({
                    'file': file,
                    'path': os.path.join(root, file),
                    'extracted_code': extracted_code
                })
    
    return image_mapping

def copy_improved_matches(mapping):
    """Copy ảnh từ improved matching"""
    print("\n📋 COPY ẢNH TỪ IMPROVED MATCHING")
    print("=" * 50)
    
    # Filter for new matches (improved + manual)
    new_matches = {}
    for fabric_code, data in mapping['matched'].items():
        if data['method'] in ['improved', 'manual']:
            new_matches[fabric_code] = data
    
    if not new_matches:
        print("❌ Không có matches mới để copy")
        return 0, 0
    
    print(f"📊 Found {len(new_matches)} new matches to copy")
    
    success_count = 0
    error_count = 0
    
    for fabric_code, image_data in new_matches.items():
        try:
            source_path = image_data['path']
            source_ext = Path(source_path).suffix.lower()
            
            # Determine target filename
            target_filename = f"{fabric_code}.jpg"
            target_path = os.path.join(WEB_APP_IMAGES, target_filename)
            
            # Skip if already exists
            if os.path.exists(target_path):
                print(f"⚠️ Already exists: {fabric_code}")
                continue
            
            # Handle HEIC conversion
            if source_ext == '.heic':
                print(f"🔄 Converting HEIC: {fabric_code}")
                result = subprocess.run([
                    'sips', '-s', 'format', 'jpeg', source_path, '--out', target_path
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    success_count += 1
                    print(f"✅ Converted & copied: {fabric_code} ({image_data['method']}, {image_data['similarity']:.2f})")
                else:
                    print(f"❌ HEIC conversion failed: {fabric_code}")
                    error_count += 1
                    continue
            else:
                # Direct copy for JPG/PNG
                shutil.copy2(source_path, target_path)
                success_count += 1
                print(f"✅ Copied: {fabric_code} ({image_data['method']}, {image_data['similarity']:.2f})")
                
        except Exception as e:
            error_count += 1
            print(f"❌ Error copying {fabric_code}: {e}")
    
    print(f"\n📊 IMPROVED COPY SUMMARY:")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")
    
    return success_count, error_count

def main():
    """Main improved matching function"""
    print("🚀 IMPROVED MATCHING LOGIC")
    print("=" * 60)
    
    # Step 1: Run improved mapping
    mapping = improved_map_images_to_fabric_codes()
    
    # Step 2: Show results
    total_matched = len(mapping['matched'])
    manual_matches = mapping['manual_matches']
    improved_matches = mapping['improved_matches']
    
    print(f"\n📊 IMPROVED MAPPING RESULTS:")
    print(f"   🎯 Total matched: {total_matched}")
    print(f"   📋 Manual matches: {manual_matches}")
    print(f"   🔧 Improved matches: {improved_matches}")
    print(f"   ❌ Still unmatched: {len(mapping['unmatched'])}")
    
    # Step 3: Copy new matches
    success_count, error_count = copy_improved_matches(mapping)
    
    # Step 4: Calculate new coverage
    fabric_codes = get_existing_fabric_codes()
    new_coverage = (total_matched / len(fabric_codes)) * 100
    
    print(f"\n🎉 FINAL RESULTS:")
    print(f"   📈 Potential new coverage: {new_coverage:.1f}%")
    print(f"   ➕ Added {success_count} new images")
    print(f"   🔄 Restart web app để xem kết quả!")

if __name__ == "__main__":
    main()
