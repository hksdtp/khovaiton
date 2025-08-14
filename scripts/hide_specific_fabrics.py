#!/usr/bin/env python3
"""
Script to hide specific fabric products by their codes
Direct database update via Supabase API

Usage: python scripts/hide_specific_fabrics.py
"""

import os
import sys
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = "https://zgrfqkytbmahxcbgpkxx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs"

# List of fabric codes to hide
FABRIC_CODES_TO_HIDE = [
    "FB15198A6", "JK090E-01", "JNF/19", "N208BOFR", "W5601-20", "YB093", "YB096",
    "07013D-88", "1803 BLACKOUT", "8000", "83100-13", "83102-19", "83813-7",
    "8525-26", "8525-42", "8525-43", "8525-46", "8542-11", "8557-06", "8568-05",
    "8598-02", "8600-06", "8600-07", "8611-44", "8611-46", "8612-25", "8613-04",
    "8613-13", "8614-09", "8615-14", "8628-17", "8631-05", "88-539-10", "88-539-12",
    "88-539-21", "88-539-23", "88-539-9", "91200201S0103", "99-129-11", "99-129-44",
    "A6120A195", "A65-2", "AL200-21", "AL200-30", "Ar070-02B", "AR-071-02B",
    "AR074-02B", "AR-076-02B", "AR-079-02B", "ASPERO 19", "BD095-298", "BD095-85",
    "BERTONE-30", "BERTONE-31", "BJ01A", "Bloom R/B Amellie", "BO300102",
    "Bonaza mufin-28", "BWB8136-4", "BWB-8539", "carnival  r/b purple",
    "CARNIVAL R/B HESSIAN 210", "carnival r/b hot pink 210", "Carnival r/b mauve 210",
    "CARNIVAL R/B MULBERRY 210", "carnival r/b slate 210", "CARNIVAL R/B TEAL 210",
    "CRUSHED VELVET-15", "D-3195", "D3385", "Datender 24sil", "DBY80434-3",
    "DBY80434-51", "DCLR -EC-4022", "DCR - chats word white", "dcr- chats word cream",
    "DCR HL-814F", "Dcr -Lauva r/b walnut", "dcr- nouveaux r/b teal",
    "DCR-1000-2300-9000", "DCR-1000-2300-9124", "DCR-1000-2300-9162",
    "DCR-1000-2300-9163", "DCR20018", "DCR-71022-8", "DCR-BRERA-33",
    "Dcr-carnival R/B mocha", "DCR-EC-4037F", "DCR-ES-48", "DCR-HA 1754-16",
    "DCR-HA 1754-7 BLACKCURRAN", "DCR-HA 1754-9", "DCR-MELIA-COFFEE",
    "DCR-MELIA-NHẠT", "DCR-N2087-Bo w280cm", "DCR-OZONE-16", "DCR-RP1113",
    "DCR-RP1120", "DCR-RP1145", "DCR-RP1148", "DCR-RP1151", "DCR-RP1153",
    "DCR-RP1163", "DCR-RP1193", "DCR-RP2000", "DCR-RP2007", "DCR-RP2010",
    "DCR-RP2328", "DCR-RP2365", "DCR-RP770", "dcr-snong bird beyl", "DCR-ST6026",
    "DH25-A4-120", "DH25-B2-120", "Dusk Slate - 3M", "EB 36360688T", "EB48410186",
    "EB5448 ALA PASTER", "EF214-04", "EF216-05", "EF218-02", "EF218-5",
    "EF51150133-dcr", "EF-BOD7543-TUISS", "EF-BON7531-TUISS",
    "ELITEX EB5115 WHITE/MUSHR", "ET66470183", "F00614-20", "F02-Front-28022023",
    "F13-NB03300105", "F14-DUSK MARTINI", "FB15092A8", "FB15144A3", "FB15151A2",
    "FB15168A4", "FB17118A7-4", "FB17118A-BWB-28", "FB17118A-BWB-30",
    "FB17141A-1", "FB17195A-3", "FS-GUNMETAL", "FWP12157-16", "G8002-01", "H01",
    "HA 1754-10", "HA 1754-11", "HA 1754-4", "HA1754-0701D-28", "HBM BLACKOUT HUESO",
    "HENILY R/B RUN BN", "HLR-17", "HLR-25", "HLR-5", "HOLIWOD-04", "HTK 20189-11",
    "HTK-20125", "IBI-2", "ICON WAR WICK - COLOR", "ICT-01", "ICT-02", "JBL54452-39",
    "JBL54452-53", "LIBERTY-05", "LỤA ÉP HỌA TIẾT", "M-149", "M61", "m907-12",
    "M907-9", "M908-26", "madrid canaval 210", "MARINO-43", "MJ304-03", "MJ428-06",
    "MJ428-14"
]

def main():
    """Main function to hide specific fabrics"""
    print("🚀 Starting fabric hiding process...")
    print(f"📋 Total fabric codes to hide: {len(FABRIC_CODES_TO_HIDE)}")
    
    # Initialize Supabase client
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Get current statistics
    print("\n📊 Getting current statistics...")
    try:
        # Count currently visible fabrics
        visible_response = supabase.table('fabrics').select('id', count='exact').or_('is_hidden.is.null,is_hidden.eq.false').execute()
        visible_count = len(visible_response.data) if visible_response.data else 0
        
        # Count currently hidden fabrics
        hidden_response = supabase.table('fabrics').select('id', count='exact').eq('is_hidden', True).execute()
        hidden_count = len(hidden_response.data) if hidden_response.data else 0
        
        print(f"📈 Current visible fabrics: {visible_count}")
        print(f"👁️ Current hidden fabrics: {hidden_count}")
        
    except Exception as e:
        print(f"⚠️ Warning: Could not get current statistics: {e}")
        visible_count = "Unknown"
        hidden_count = "Unknown"
    
    # Find fabrics by codes
    print("\n🔍 Finding fabrics by codes...")
    found_fabrics = []
    not_found_codes = []
    
    for code in FABRIC_CODES_TO_HIDE:
        try:
            response = supabase.table('fabrics').select('id, code, name, is_hidden').eq('code', code).execute()
            
            if response.data and len(response.data) > 0:
                fabric = response.data[0]
                found_fabrics.append(fabric)
                status = "already hidden" if fabric.get('is_hidden') else "visible"
                print(f"✅ Found: {code} (ID: {fabric['id']}) - {status}")
            else:
                not_found_codes.append(code)
                print(f"❌ Not found: {code}")
                
        except Exception as e:
            print(f"❌ Error searching for {code}: {e}")
            not_found_codes.append(code)
    
    print(f"\n📊 Summary:")
    print(f"✅ Found fabrics: {len(found_fabrics)}")
    print(f"❌ Not found codes: {len(not_found_codes)}")
    
    if not_found_codes:
        print(f"\n⚠️ Codes not found in database:")
        for code in not_found_codes:
            print(f"   - {code}")
    
    if not found_fabrics:
        print("❌ No fabrics found to hide. Exiting.")
        sys.exit(1)
    
    # Filter out already hidden fabrics
    fabrics_to_hide = [f for f in found_fabrics if not f.get('is_hidden')]
    already_hidden = [f for f in found_fabrics if f.get('is_hidden')]
    
    if already_hidden:
        print(f"\n👁️ Already hidden fabrics: {len(already_hidden)}")
        for fabric in already_hidden:
            print(f"   - {fabric['code']}")
    
    if not fabrics_to_hide:
        print("✅ All found fabrics are already hidden. Nothing to do.")
        return
    
    print(f"\n🎯 Fabrics to hide: {len(fabrics_to_hide)}")
    
    # Confirm before proceeding
    response = input(f"\n❓ Do you want to hide {len(fabrics_to_hide)} fabrics? (y/N): ")
    if response.lower() != 'y':
        print("❌ Operation cancelled by user.")
        sys.exit(0)
    
    # Create backup record
    timestamp = datetime.now().isoformat()
    backup_data = {
        "timestamp": timestamp,
        "operation": "hide_fabrics",
        "fabric_ids": [f['id'] for f in fabrics_to_hide],
        "fabric_codes": [f['code'] for f in fabrics_to_hide],
        "total_count": len(fabrics_to_hide)
    }
    
    # Save backup to file
    backup_filename = f"backup_hide_fabrics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)
    print(f"💾 Backup saved to: {backup_filename}")
    
    # Hide fabrics
    print(f"\n🔄 Hiding {len(fabrics_to_hide)} fabrics...")
    success_count = 0
    error_count = 0
    
    for fabric in fabrics_to_hide:
        try:
            response = supabase.table('fabrics').update({
                'is_hidden': True,
                'updated_at': datetime.now().isoformat()
            }).eq('id', fabric['id']).execute()
            
            if response.data:
                print(f"✅ Hidden: {fabric['code']} (ID: {fabric['id']})")
                success_count += 1
            else:
                print(f"❌ Failed to hide: {fabric['code']} (ID: {fabric['id']})")
                error_count += 1
                
        except Exception as e:
            print(f"❌ Error hiding {fabric['code']}: {e}")
            error_count += 1
    
    # Final statistics
    print(f"\n📊 Operation completed:")
    print(f"✅ Successfully hidden: {success_count}")
    print(f"❌ Errors: {error_count}")
    print(f"💾 Backup file: {backup_filename}")
    
    if success_count > 0:
        print(f"\n🎯 Expected changes:")
        print(f"📈 Visible fabrics: {visible_count} → {visible_count - success_count if isinstance(visible_count, int) else 'Unknown'}")
        print(f"👁️ Hidden fabrics: {hidden_count} → {hidden_count + success_count if isinstance(hidden_count, int) else 'Unknown'}")
        
        print(f"\n✅ Marketing mode will now show {success_count} fewer products")
        print(f"✅ Sale mode can access hidden products via 'Chỉ xem SP ẩn' filter")

if __name__ == "__main__":
    main()
