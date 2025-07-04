#!/bin/bash

# Quick Sync Script
# Ninh ơi, script này giúp sync ảnh từ Google Drive một cách nhanh chóng

echo "🚀 Quick Sync from Google Drive"
echo "================================"

# Configuration
DRIVE_FOLDER_ID="1YiRnl2CfccL6rH98S8UlWexgckV_dnbU"
LOCAL_DIR="public/images/fabrics"
TEMP_DIR="/tmp/fabric_images_sync"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check dependencies
print_status "Checking dependencies..."

if ! command -v python3 &> /dev/null; then
    print_error "Python3 is required but not installed"
    exit 1
fi

if ! python3 -c "import gdown" 2>/dev/null; then
    print_warning "gdown not installed. Installing..."
    pip3 install gdown
fi

if ! python3 -c "import requests" 2>/dev/null; then
    print_warning "requests not installed. Installing..."
    pip3 install requests
fi

print_success "Dependencies OK"

# Create directories
print_status "Creating directories..."
mkdir -p "$LOCAL_DIR"
mkdir -p "$TEMP_DIR"

# Test Drive access
print_status "Testing Google Drive access..."
if python3 scripts/test_drive_access.py > /dev/null 2>&1; then
    print_success "Google Drive accessible"
else
    print_error "Cannot access Google Drive folder"
    print_error "Please check:"
    print_error "1. Folder is public (Anyone with link can view)"
    print_error "2. Folder ID is correct: $DRIVE_FOLDER_ID"
    exit 1
fi

# Download from Drive
print_status "Downloading from Google Drive..."
print_status "This may take a few minutes depending on folder size..."

cd "$TEMP_DIR"
if gdown --folder "https://drive.google.com/drive/folders/$DRIVE_FOLDER_ID" --remaining-ok --quiet; then
    print_success "Download completed"
else
    print_error "Download failed"
    exit 1
fi

# Go back to project directory
cd - > /dev/null

# Count downloaded images
image_count=$(find "$TEMP_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | wc -l)
print_status "Found $image_count image files"

if [ "$image_count" -eq 0 ]; then
    print_warning "No image files found in the downloaded folder"
    print_warning "Please check if the Google Drive folder contains images"
    exit 1
fi

# Copy images to local directory
print_status "Copying images to local directory..."
copied_count=0
error_count=0

find "$TEMP_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | while read -r file; do
    filename=$(basename "$file")
    if cp "$file" "$LOCAL_DIR/$filename" 2>/dev/null; then
        echo "✅ Copied: $filename"
        ((copied_count++))
    else
        echo "❌ Failed: $filename"
        ((error_count++))
    fi
done

# Cleanup temp directory
rm -rf "$TEMP_DIR"

# Check mapping with fabric codes
print_status "Checking fabric mapping..."

if [ -f "fabric_inventory_updated.csv" ]; then
    # Simple mapping check using basic shell commands
    total_fabrics=$(tail -n +2 fabric_inventory_updated.csv | wc -l)
    local_images=$(ls -1 "$LOCAL_DIR"/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l)
    
    print_status "📊 Mapping Summary:"
    print_status "   Total fabrics in CSV: $total_fabrics"
    print_status "   Total images in local: $local_images"
    
    if [ "$local_images" -gt 0 ]; then
        coverage=$(echo "scale=1; $local_images * 100 / $total_fabrics" | bc -l 2>/dev/null || echo "N/A")
        print_status "   Coverage: ${coverage}%"
    fi
else
    print_warning "fabric_inventory_updated.csv not found, skipping mapping check"
fi

# Final status
echo ""
print_success "🎉 Sync completed!"
print_status "📂 Images saved to: $LOCAL_DIR"
print_status "🌐 Refresh your web app to see the images: http://localhost:3000"
print_status "🔧 Use 'Import ảnh' button in web app for detailed mapping report"

echo ""
print_status "💡 Next steps:"
print_status "1. Open web app: http://localhost:3000"
print_status "2. Click 'Import ảnh' button to see mapping report"
print_status "3. Check which fabrics still need images"
print_status "4. Re-run this script anytime to sync new images"

echo ""
print_status "📋 Quick commands:"
print_status "   View images: ls -la $LOCAL_DIR"
print_status "   Count images: ls -1 $LOCAL_DIR/*.{jpg,png,webp} 2>/dev/null | wc -l"
print_status "   Re-sync: ./scripts/quick_sync.sh"
