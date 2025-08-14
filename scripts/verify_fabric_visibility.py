#!/usr/bin/env python3
"""
Verification script to check fabric visibility status
Shows statistics and specific fabric status

Usage: python scripts/verify_fabric_visibility.py
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = "https://zgrfqkytbmahxcbgpkxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs"

# Sample of fabric codes to check (from the hide list)
SAMPLE_CODES = [
    "FB15198A6", "JK090E-01", "JNF/19", "N208BOFR", "W5601-20", 
    "YB093", "YB096", "07013D-88", "1803 BLACKOUT", "8000"
]

def main():
    """Main verification function"""
    print("🔍 Verifying fabric visibility status...")
    
    # Initialize Supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Get overall statistics
    print("\n📊 Overall Statistics:")
    try:
        # Total fabrics
        total_response = supabase.table('fabrics').select('id', count='exact').execute()
        total_count = len(total_response.data) if total_response.data else 0
        
        # Visible fabrics (is_hidden is null or false)
        visible_response = supabase.table('fabrics').select('id', count='exact').or_('is_hidden.is.null,is_hidden.eq.false').execute()
        visible_count = len(visible_response.data) if visible_response.data else 0
        
        # Hidden fabrics (is_hidden is true)
        hidden_response = supabase.table('fabrics').select('id', count='exact').eq('is_hidden', True).execute()
        hidden_count = len(hidden_response.data) if hidden_response.data else 0
        
        print(f"📦 Total fabrics: {total_count}")
        print(f"👁️ Visible fabrics: {visible_count}")
        print(f"🙈 Hidden fabrics: {hidden_count}")
        print(f"📊 Hidden percentage: {(hidden_count/total_count*100):.1f}%" if total_count > 0 else "N/A")
        
    except Exception as e:
        print(f"❌ Error getting statistics: {e}")
        return
    
    # Check sample fabric codes
    print(f"\n🔍 Checking sample fabric codes ({len(SAMPLE_CODES)} samples):")
    found_count = 0
    hidden_count_sample = 0
    
    for code in SAMPLE_CODES:
        try:
            response = supabase.table('fabrics').select('id, code, name, is_hidden, updated_at').eq('code', code).execute()
            
            if response.data and len(response.data) > 0:
                fabric = response.data[0]
                found_count += 1
                is_hidden = fabric.get('is_hidden', False)
                
                if is_hidden:
                    hidden_count_sample += 1
                    status = "🙈 HIDDEN"
                else:
                    status = "👁️ VISIBLE"
                
                print(f"  {status} - {code} (ID: {fabric['id']})")
                
            else:
                print(f"  ❌ NOT FOUND - {code}")
                
        except Exception as e:
            print(f"  ❌ ERROR - {code}: {e}")
    
    print(f"\n📊 Sample Results:")
    print(f"✅ Found: {found_count}/{len(SAMPLE_CODES)}")
    print(f"🙈 Hidden in sample: {hidden_count_sample}/{found_count}" if found_count > 0 else "N/A")
    
    # Check recent updates
    print(f"\n🕒 Recent visibility updates (last 10):")
    try:
        recent_response = supabase.table('fabrics').select('code, name, is_hidden, updated_at').eq('is_hidden', True).order('updated_at', desc=True).limit(10).execute()
        
        if recent_response.data:
            for fabric in recent_response.data:
                updated_at = fabric.get('updated_at', 'Unknown')
                print(f"  🙈 {fabric['code']} - Updated: {updated_at}")
        else:
            print("  No recent hidden fabrics found")
            
    except Exception as e:
        print(f"❌ Error getting recent updates: {e}")
    
    print(f"\n✅ Verification completed!")
    print(f"💡 Use this data to verify hide/unhide operations worked correctly")

if __name__ == "__main__":
    main()
