#!/usr/bin/env python3
"""
Test script để verify logic mapping trước khi chạy full integration
"""

import os
import sys
from pathlib import Path

# Import functions from analyze script
sys.path.append(os.path.dirname(__file__))
from analyze_vtt9_images import (
    extract_fabric_code, 
    calculate_similarity,
    get_existing_fabric_codes
)

def test_fabric_code_extraction():
    """Test logic extract fabric code"""
    print("🧪 TEST FABRIC CODE EXTRACTION")
    print("=" * 50)
    
    # Sample filenames from vtt9
    test_files = [
        "07 013D -26.heic",
        "07013D-88(1).jpg", 
        "Capri 2796.jpg",
        "HA 1754-0701D.jpg",
        "SB-12.jpg",
        "CADIZ FLE SURF 01.jpg",
        "JBL 54452 - 39.jpg",
        "EF 214-4.jpg",
        "71022-8.jpg",
        "HEIO 3579 cankhoto.jpg",
        "HERMITAGE 27466 31.jpg"
    ]
    
    for filename in test_files:
        extracted = extract_fabric_code(filename)
        print(f"   {filename:<30} → {extracted}")

def test_similarity_matching():
    """Test similarity matching với fabric codes thật"""
    print("\n🎯 TEST SIMILARITY MATCHING")
    print("=" * 50)
    
    # Get real fabric codes
    fabric_codes = get_existing_fabric_codes()
    print(f"📋 Loaded {len(fabric_codes)} fabric codes")
    
    # Test cases
    test_cases = [
        ("07013D-26", "07013D-88"),  # Should match
        ("Capri 2796", "CAPRI2769"),  # Should match
        ("HA 1754-0701D", "HA 1754-10"),  # Should match  
        ("SB-12", "50-008 dcr-T203 SB-12"),  # Should match
        ("JBL 54452 - 39", "JBL54452-53"),  # Should match
        ("Random Name", "Another Random"),  # Should not match
    ]
    
    for extracted, fabric_code in test_cases:
        similarity = calculate_similarity(extracted, fabric_code)
        match_status = "✅ MATCH" if similarity >= 0.7 else "❌ NO MATCH"
        print(f"   {extracted:<20} vs {fabric_code:<20} → {similarity:.2f} {match_status}")

def test_real_mapping_sample():
    """Test mapping với sample ảnh thật từ vtt9"""
    print("\n🔍 TEST REAL MAPPING SAMPLE")
    print("=" * 50)
    
    VTT9_FOLDER = "/Users/nih/Downloads/vtt9"
    
    if not os.path.exists(VTT9_FOLDER):
        print("❌ VTT9 folder not found")
        return
    
    # Get fabric codes
    fabric_codes = get_existing_fabric_codes()
    
    # Sample a few images
    sample_images = []
    count = 0
    
    for root, dirs, files in os.walk(VTT9_FOLDER):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.heic')):
                sample_images.append((file, os.path.join(root, file)))
                count += 1
                if count >= 20:  # Test with 20 images
                    break
        if count >= 20:
            break
    
    print(f"📊 Testing with {len(sample_images)} sample images:")
    
    matched_count = 0
    
    for filename, filepath in sample_images:
        extracted_code = extract_fabric_code(filename)
        
        # Find best match
        best_match = None
        best_score = 0.0
        
        for fabric_code in fabric_codes:
            score = calculate_similarity(extracted_code, fabric_code)
            if score > best_score and score >= 0.7:
                best_score = score
                best_match = fabric_code
        
        if best_match:
            matched_count += 1
            print(f"   ✅ {filename:<30} → {best_match} ({best_score:.2f})")
        else:
            print(f"   ❌ {filename:<30} → No match (extracted: {extracted_code})")
    
    print(f"\n📊 Sample Results: {matched_count}/{len(sample_images)} matched ({matched_count/len(sample_images)*100:.1f}%)")

def main():
    """Run all tests"""
    print("🧪 VTT9 INTEGRATION TESTS")
    print("=" * 60)
    
    test_fabric_code_extraction()
    test_similarity_matching() 
    test_real_mapping_sample()
    
    print(f"\n✅ Tests completed!")
    print(f"💡 Review results before running full integration")

if __name__ == "__main__":
    main()
