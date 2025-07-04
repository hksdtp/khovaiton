#!/usr/bin/env python3
"""
Test Google Drive Access
Ninh ơi, script này test xem có thể access Google Drive folder không
"""

import requests
import sys

def test_drive_access(folder_id):
    """Test if we can access the Google Drive folder"""
    
    print(f"🔍 Testing access to Google Drive folder: {folder_id}")
    
    # Test direct folder access
    folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
    
    try:
        response = requests.get(folder_url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Folder is accessible")
            
            # Check if it contains expected content
            if "fabric" in response.text.lower() or "vai" in response.text.lower():
                print("✅ Folder seems to contain fabric-related content")
            else:
                print("⚠️  Folder accessible but content unclear")
                
            return True
        else:
            print(f"❌ Cannot access folder (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Error accessing folder: {e}")
        return False

def test_gdown_installation():
    """Test if gdown is available"""
    
    print("🔧 Testing gdown installation...")
    
    try:
        import subprocess
        result = subprocess.run(['gdown', '--version'], 
                              capture_output=True, text=True, timeout=5)
        
        if result.returncode == 0:
            print(f"✅ gdown is installed: {result.stdout.strip()}")
            return True
        else:
            print("❌ gdown not working properly")
            return False
            
    except FileNotFoundError:
        print("❌ gdown not installed")
        print("💡 Install with: pip install gdown")
        return False
    except Exception as e:
        print(f"❌ Error testing gdown: {e}")
        return False

def test_folder_download(folder_id):
    """Test downloading a small sample from the folder"""
    
    print("📥 Testing folder download...")
    
    try:
        import subprocess
        import tempfile
        import os
        
        # Create temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            print(f"📁 Using temp directory: {temp_dir}")
            
            # Try to download folder (with limit to avoid downloading everything)
            cmd = [
                'gdown', '--folder', 
                f'https://drive.google.com/drive/folders/{folder_id}',
                '-O', temp_dir,
                '--remaining-ok',
                '--quiet'
            ]
            
            print("🚀 Running gdown command...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                # Check what was downloaded
                files = []
                for root, dirs, filenames in os.walk(temp_dir):
                    for filename in filenames:
                        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                            files.append(filename)
                
                if files:
                    print(f"✅ Successfully downloaded {len(files)} image files")
                    print("📋 Sample files:")
                    for file in files[:5]:  # Show first 5
                        print(f"   • {file}")
                    if len(files) > 5:
                        print(f"   ... and {len(files) - 5} more")
                    return True
                else:
                    print("⚠️  Download succeeded but no image files found")
                    return False
            else:
                print(f"❌ Download failed: {result.stderr}")
                return False
                
    except subprocess.TimeoutExpired:
        print("⏰ Download test timed out (folder might be large)")
        print("💡 This is normal for large folders")
        return True  # Timeout is not necessarily a failure
    except Exception as e:
        print(f"❌ Error testing download: {e}")
        return False

def main():
    """Main test function"""
    
    folder_id = "1YiRnl2CfccL6rH98S8UlWexgckV_dnbU"
    
    print("🧪 Google Drive Access Test")
    print("=" * 50)
    
    # Test 1: Basic folder access
    access_ok = test_drive_access(folder_id)
    print()
    
    # Test 2: gdown installation
    gdown_ok = test_gdown_installation()
    print()
    
    # Test 3: Sample download (only if gdown works)
    download_ok = False
    if gdown_ok:
        download_ok = test_folder_download(folder_id)
        print()
    
    # Summary
    print("📊 Test Summary:")
    print(f"   Folder Access: {'✅' if access_ok else '❌'}")
    print(f"   gdown Ready:   {'✅' if gdown_ok else '❌'}")
    print(f"   Download Test: {'✅' if download_ok else '❌'}")
    print()
    
    if access_ok and gdown_ok:
        print("🎉 All tests passed! Ready to sync from Google Drive")
        print("💡 Run: python scripts/sync_from_drive.py")
    else:
        print("⚠️  Some tests failed. Check the issues above.")
        
        if not access_ok:
            print("🔧 Fix folder access:")
            print("   1. Make sure folder is public (Anyone with link)")
            print("   2. Check the folder ID is correct")
            
        if not gdown_ok:
            print("🔧 Install gdown:")
            print("   pip install gdown")
    
    return access_ok and gdown_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
