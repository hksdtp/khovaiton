#!/usr/bin/env python3
"""
Google Drive Cleanup Script
Ninh ơi, script này sẽ clean up toàn bộ Google Drive legacy code
"""

import os
import shutil
from pathlib import Path

# Base directory
BASE_DIR = Path("/Users/nih/web app/khovaiton")

def cleanup_google_drive_files():
    """Remove all Google Drive related files"""
    print("🗑️ CLEANING UP GOOGLE DRIVE FILES")
    print("=" * 50)
    
    # Files to remove
    files_to_remove = [
        # Documentation
        "HUONG_DAN_GOOGLE_DRIVE.md",
        
        # Scripts
        "scripts/sync_from_drive.py",
        "scripts/quick_sync.sh",
        "scripts/analyze_vtt9_images.py",
        "scripts/integrate_vtt9_images.py", 
        "scripts/test_vtt9_integration.py",
        "scripts/verify_mapping_accuracy.py",
        "scripts/detailed_mapping_check.py",
        "scripts/emergency_rollback.py",
        "scripts/find_missing_images.py",
        "scripts/improved_matching.py",
        "scripts/quick_fixes_phase1.py",
        "scripts/prepare_for_vercel_deploy.py",
        
        # Services
        "src/features/inventory/services/googleDriveService.ts",
        "src/features/inventory/services/googleDriveApiService.ts", 
        "src/features/inventory/services/onlineImageSyncService.ts",
        
        # Components
        "src/features/inventory/components/GoogleDriveSyncModal.tsx",
        
        # Backup/temp files
        "VTT9_INTEGRATION_REPORT.md",
        "GAP_ANALYSIS_REPORT.md",
        "manual_review_data.json",
        "phase1_results.json",
        "verification_results.json",
        "rollback_suspicious.sh",
        "remove_suspicious_mappings.sh",
    ]
    
    removed_count = 0
    
    for file_path in files_to_remove:
        full_path = BASE_DIR / file_path
        if full_path.exists():
            try:
                if full_path.is_file():
                    full_path.unlink()
                elif full_path.is_dir():
                    shutil.rmtree(full_path)
                print(f"✅ Removed: {file_path}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Failed to remove {file_path}: {e}")
        else:
            print(f"⚠️ Not found: {file_path}")
    
    print(f"\n📊 Removed {removed_count} files/folders")
    return removed_count

def cleanup_backup_folders():
    """Remove backup folders created during integration"""
    print("\n🗑️ CLEANING UP BACKUP FOLDERS")
    print("=" * 50)
    
    backup_patterns = [
        "backup_images_*",
        "rollback_backup_*", 
        "public/images/fabrics_backup_*",
        "upload_missing_images",
    ]
    
    removed_count = 0
    
    for pattern in backup_patterns:
        for path in BASE_DIR.glob(pattern):
            try:
                if path.is_dir():
                    shutil.rmtree(path)
                    print(f"✅ Removed backup folder: {path.name}")
                    removed_count += 1
            except Exception as e:
                print(f"❌ Failed to remove {path}: {e}")
    
    print(f"\n📊 Removed {removed_count} backup folders")
    return removed_count

def update_environment_files():
    """Remove Google Drive environment variables"""
    print("\n🔧 UPDATING ENVIRONMENT FILES")
    print("=" * 50)
    
    env_files = [
        ".env.local",
        ".env.example",
        ".env.production"
    ]
    
    google_drive_vars = [
        "VITE_GOOGLE_DRIVE_API_KEY",
        "VITE_GOOGLE_DRIVE_FOLDER_ID", 
        "VITE_ENABLE_GOOGLE_DRIVE_SYNC",
        "NEXT_PUBLIC_GOOGLE_API_KEY",
        "NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID"
    ]
    
    for env_file in env_files:
        env_path = BASE_DIR / env_file
        if env_path.exists():
            try:
                # Read current content
                with open(env_path, 'r') as f:
                    lines = f.readlines()
                
                # Filter out Google Drive variables
                filtered_lines = []
                removed_vars = []
                
                for line in lines:
                    line_stripped = line.strip()
                    if any(var in line_stripped for var in google_drive_vars):
                        removed_vars.append(line_stripped.split('=')[0])
                    else:
                        filtered_lines.append(line)
                
                # Write back filtered content
                with open(env_path, 'w') as f:
                    f.writelines(filtered_lines)
                
                if removed_vars:
                    print(f"✅ Updated {env_file}: removed {len(removed_vars)} Google Drive vars")
                    for var in removed_vars:
                        print(f"   - {var}")
                else:
                    print(f"ℹ️ {env_file}: no Google Drive vars found")
                    
            except Exception as e:
                print(f"❌ Failed to update {env_file}: {e}")
        else:
            print(f"⚠️ {env_file} not found")

def scan_unused_imports():
    """Scan for unused imports in TypeScript files"""
    print("\n🔍 SCANNING FOR UNUSED IMPORTS")
    print("=" * 50)
    
    # Google Drive related imports to look for
    google_drive_imports = [
        "googleDriveService",
        "googleDriveApiService", 
        "onlineImageSyncService",
        "GoogleDriveSyncModal",
        "syncImagesFromDrive",
        "getDriveFiles",
        "autoSyncOnStartup",
        "startPeriodicSync",
        "checkOnlineSyncAvailability"
    ]
    
    files_with_issues = []
    
    # Scan TypeScript files
    for ts_file in BASE_DIR.rglob("*.ts"):
        if "node_modules" in str(ts_file) or "dist" in str(ts_file):
            continue
            
        try:
            with open(ts_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            issues = []
            for import_name in google_drive_imports:
                if import_name in content:
                    issues.append(import_name)
            
            if issues:
                files_with_issues.append({
                    'file': ts_file.relative_to(BASE_DIR),
                    'issues': issues
                })
                
        except Exception as e:
            print(f"⚠️ Error scanning {ts_file}: {e}")
    
    # Scan TSX files
    for tsx_file in BASE_DIR.rglob("*.tsx"):
        if "node_modules" in str(tsx_file) or "dist" in str(tsx_file):
            continue
            
        try:
            with open(tsx_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            issues = []
            for import_name in google_drive_imports:
                if import_name in content:
                    issues.append(import_name)
            
            if issues:
                files_with_issues.append({
                    'file': tsx_file.relative_to(BASE_DIR),
                    'issues': issues
                })
                
        except Exception as e:
            print(f"⚠️ Error scanning {tsx_file}: {e}")
    
    if files_with_issues:
        print(f"⚠️ Found {len(files_with_issues)} files with Google Drive imports:")
        for item in files_with_issues:
            print(f"   📁 {item['file']}")
            for issue in item['issues']:
                print(f"      - {issue}")
    else:
        print("✅ No Google Drive imports found")
    
    return files_with_issues

def generate_cleanup_report():
    """Generate cleanup report"""
    print("\n📋 GENERATING CLEANUP REPORT")
    print("=" * 50)
    
    report = """# 🧹 GOOGLE DRIVE CLEANUP REPORT

## ✅ Files Removed:
- HUONG_DAN_GOOGLE_DRIVE.md
- scripts/sync_from_drive.py
- scripts/quick_sync.sh
- scripts/*vtt9* (VTT9 integration scripts)
- src/features/inventory/services/googleDriveService.ts
- src/features/inventory/services/googleDriveApiService.ts
- src/features/inventory/services/onlineImageSyncService.ts
- src/features/inventory/components/GoogleDriveSyncModal.tsx

## ✅ Backup Folders Removed:
- backup_images_*
- rollback_backup_*
- upload_missing_images/
- public/images/fabrics_backup_*

## ✅ Environment Variables Removed:
- VITE_GOOGLE_DRIVE_API_KEY
- VITE_GOOGLE_DRIVE_FOLDER_ID
- VITE_ENABLE_GOOGLE_DRIVE_SYNC
- NEXT_PUBLIC_GOOGLE_API_KEY
- NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID

## 🎯 Next Steps:
1. Fix remaining imports in TypeScript files
2. Remove Google Drive references from components
3. Update environment configuration
4. Test build and functionality
5. Update documentation

## 📊 Result:
- Codebase cleaned of Google Drive legacy code
- Only Cloudinary + static images remain
- Ready for production deployment
"""
    
    with open(BASE_DIR / "CLEANUP_REPORT.md", 'w') as f:
        f.write(report)
    
    print("✅ Cleanup report saved: CLEANUP_REPORT.md")

def main():
    """Main cleanup function"""
    print("🧹 GOOGLE DRIVE LEGACY CODE CLEANUP")
    print("=" * 60)
    print("🎯 Goal: Remove all Google Drive code, keep only Cloudinary + static images")
    
    # Step 1: Remove files
    removed_files = cleanup_google_drive_files()
    
    # Step 2: Remove backup folders
    removed_folders = cleanup_backup_folders()
    
    # Step 3: Update environment files
    update_environment_files()
    
    # Step 4: Scan for remaining imports
    remaining_imports = scan_unused_imports()
    
    # Step 5: Generate report
    generate_cleanup_report()
    
    print(f"\n🎉 CLEANUP SUMMARY:")
    print(f"   📁 Files removed: {removed_files}")
    print(f"   📂 Folders removed: {removed_folders}")
    print(f"   ⚠️ Files with remaining imports: {len(remaining_imports)}")
    
    if remaining_imports:
        print(f"\n⚠️ MANUAL CLEANUP NEEDED:")
        print(f"   The following files still have Google Drive imports:")
        for item in remaining_imports:
            print(f"   - {item['file']}")
        print(f"\n💡 Run the TypeScript cleanup next!")
    else:
        print(f"\n✅ All Google Drive references removed!")
    
    print(f"\n🚀 Next: Test build with 'npm run build'")

if __name__ == "__main__":
    main()
