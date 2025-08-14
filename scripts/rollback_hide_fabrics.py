#!/usr/bin/env python3
"""
Rollback script to unhide fabrics that were hidden by hide_specific_fabrics.py
Uses backup file to restore previous state

Usage: python scripts/rollback_hide_fabrics.py [backup_file.json]
"""

import os
import sys
import json
import glob
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = "https://zgrfqkytbmahxcbgpkxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs"

def find_latest_backup():
    """Find the latest backup file"""
    backup_files = glob.glob("backup_hide_fabrics_*.json")
    if not backup_files:
        return None
    
    # Sort by filename (which includes timestamp)
    backup_files.sort(reverse=True)
    return backup_files[0]

def load_backup(backup_file):
    """Load backup data from file"""
    try:
        with open(backup_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading backup file: {e}")
        return None

def main():
    """Main rollback function"""
    print("🔄 Starting fabric hide rollback process...")
    
    # Determine backup file to use
    backup_file = None
    if len(sys.argv) > 1:
        backup_file = sys.argv[1]
    else:
        backup_file = find_latest_backup()
    
    if not backup_file:
        print("❌ No backup file specified and no backup files found.")
        print("Usage: python scripts/rollback_hide_fabrics.py [backup_file.json]")
        sys.exit(1)
    
    if not os.path.exists(backup_file):
        print(f"❌ Backup file not found: {backup_file}")
        sys.exit(1)
    
    print(f"📁 Using backup file: {backup_file}")
    
    # Load backup data
    backup_data = load_backup(backup_file)
    if not backup_data:
        sys.exit(1)
    
    print(f"📊 Backup info:")
    print(f"   - Timestamp: {backup_data.get('timestamp', 'Unknown')}")
    print(f"   - Operation: {backup_data.get('operation', 'Unknown')}")
    print(f"   - Total fabrics: {backup_data.get('total_count', 0)}")
    
    fabric_ids = backup_data.get('fabric_ids', [])
    fabric_codes = backup_data.get('fabric_codes', [])
    
    if not fabric_ids:
        print("❌ No fabric IDs found in backup file.")
        sys.exit(1)
    
    # Initialize Supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Verify fabrics exist and are currently hidden
    print(f"\n🔍 Verifying {len(fabric_ids)} fabrics...")
    verified_fabrics = []
    
    for i, fabric_id in enumerate(fabric_ids):
        try:
            response = supabase.table('fabrics').select('id, code, name, is_hidden').eq('id', fabric_id).execute()
            
            if response.data and len(response.data) > 0:
                fabric = response.data[0]
                code = fabric_codes[i] if i < len(fabric_codes) else "Unknown"
                
                if fabric.get('is_hidden'):
                    verified_fabrics.append(fabric)
                    print(f"✅ Found hidden: {code} (ID: {fabric_id})")
                else:
                    print(f"⚠️ Already visible: {code} (ID: {fabric_id})")
            else:
                code = fabric_codes[i] if i < len(fabric_codes) else "Unknown"
                print(f"❌ Not found: {code} (ID: {fabric_id})")
                
        except Exception as e:
            code = fabric_codes[i] if i < len(fabric_codes) else "Unknown"
            print(f"❌ Error checking {code}: {e}")
    
    if not verified_fabrics:
        print("❌ No hidden fabrics found to restore. Nothing to do.")
        return
    
    print(f"\n🎯 Fabrics to unhide: {len(verified_fabrics)}")
    
    # Confirm before proceeding
    response = input(f"\n❓ Do you want to unhide {len(verified_fabrics)} fabrics? (y/N): ")
    if response.lower() != 'y':
        print("❌ Rollback cancelled by user.")
        sys.exit(0)
    
    # Create rollback record
    timestamp = datetime.now().isoformat()
    rollback_data = {
        "timestamp": timestamp,
        "operation": "rollback_hide_fabrics",
        "original_backup": backup_file,
        "fabric_ids": [f['id'] for f in verified_fabrics],
        "fabric_codes": [f['code'] for f in verified_fabrics],
        "total_count": len(verified_fabrics)
    }
    
    # Save rollback record
    rollback_filename = f"rollback_hide_fabrics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(rollback_filename, 'w', encoding='utf-8') as f:
        json.dump(rollback_data, f, indent=2, ensure_ascii=False)
    print(f"💾 Rollback record saved to: {rollback_filename}")
    
    # Unhide fabrics
    print(f"\n🔄 Unhiding {len(verified_fabrics)} fabrics...")
    success_count = 0
    error_count = 0
    
    for fabric in verified_fabrics:
        try:
            response = supabase.table('fabrics').update({
                'is_hidden': False,
                'updated_at': datetime.now().isoformat()
            }).eq('id', fabric['id']).execute()
            
            if response.data:
                print(f"✅ Unhidden: {fabric['code']} (ID: {fabric['id']})")
                success_count += 1
            else:
                print(f"❌ Failed to unhide: {fabric['code']} (ID: {fabric['id']})")
                error_count += 1
                
        except Exception as e:
            print(f"❌ Error unhiding {fabric['code']}: {e}")
            error_count += 1
    
    # Final statistics
    print(f"\n📊 Rollback completed:")
    print(f"✅ Successfully unhidden: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"💾 Rollback record: {rollback_filename}")
    
    if success_count > 0:
        print(f"\n🎯 Changes applied:")
        print(f"📈 {success_count} fabrics are now visible again")
        print(f"✅ Marketing mode will now show {success_count} more products")
        print(f"✅ Sale mode will have {success_count} fewer hidden products")

if __name__ == "__main__":
    main()
