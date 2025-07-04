#!/usr/bin/env python3
"""
Test access to main Google Drive folder
"""

import requests

# Google Drive API configuration
API_KEY = "AIzaSyBijqu8qSHhahlsk5Y4EPZMC81Y4d4wThM"
DRIVE_API_BASE = "https://www.googleapis.com/drive/v3"
MAIN_FOLDER_ID = "1YiRnl2CfccL6rH98S8UlWexgckV_dnbU"

def test_main_folder():
    """Test access to main folder"""
    print("🔍 TESTING MAIN FOLDER ACCESS")
    print("=" * 40)
    
    params = {
        'key': API_KEY,
        'q': f"'{MAIN_FOLDER_ID}' in parents and trashed=false",
        'fields': 'files(id,name,mimeType)',
        'pageSize': 10
    }
    
    try:
        response = requests.get(f"{DRIVE_API_BASE}/files", params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            files = data.get('files', [])
            
            print(f"✅ SUCCESS! Found {len(files)} items in main folder:")
            
            for file in files:
                file_type = "📁 Folder" if file['mimeType'] == 'application/vnd.google-apps.folder' else "📄 File"
                print(f"   {file_type}: {file['name']} (ID: {file['id']})")
                
            return True
            
        else:
            print(f"❌ FAILED: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_folder_info(folder_id, name):
    """Test getting folder info"""
    print(f"\n🔍 Testing {name}: {folder_id}")
    
    params = {
        'key': API_KEY,
        'fields': 'name,id,mimeType'
    }
    
    try:
        response = requests.get(f"{DRIVE_API_BASE}/files/{folder_id}", params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Accessible: {data.get('name', 'Unknown')}")
            return True
        else:
            print(f"   ❌ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

if __name__ == "__main__":
    print("🚀 GOOGLE DRIVE ACCESS TEST")
    print("=" * 50)
    
    # Test main folder
    main_ok = test_main_folder()
    
    # Test subfolders
    subfolder1_ok = test_folder_info("1N0kD1XzoQ2quVLgPwywZBVkMGyebECif", "Ảnh vải - Phần 1")
    subfolder2_ok = test_folder_info("1GKq_J5Xd_93docDHgKABeg85lqyksz22", "Ảnh vải - Phần 2")
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    print(f"   Main folder: {'✅' if main_ok else '❌'}")
    print(f"   Subfolder 1: {'✅' if subfolder1_ok else '❌'}")
    print(f"   Subfolder 2: {'✅' if subfolder2_ok else '❌'}")
    
    if main_ok and subfolder1_ok and subfolder2_ok:
        print("\n🎉 ALL FOLDERS ACCESSIBLE!")
    else:
        print("\n⚠️  SOME FOLDERS NOT ACCESSIBLE")
        print("   Please check folder permissions (make them public)")
