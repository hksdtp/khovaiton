#!/bin/bash

# Script kiểm tra số lượng ảnh trong Cloudinary
# Ninh ơi, script này sử dụng curl để check Cloudinary API

echo "☁️ Checking Cloudinary images..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check required variables
if [ -z "$VITE_CLOUDINARY_CLOUD_NAME" ] || [ -z "$VITE_CLOUDINARY_API_KEY" ] || [ -z "$CLOUDINARY_API_SECRET" ]; then
    echo "❌ Missing Cloudinary credentials in .env.local"
    echo "Required:"
    echo "- VITE_CLOUDINARY_CLOUD_NAME"
    echo "- VITE_CLOUDINARY_API_KEY"
    echo "- CLOUDINARY_API_SECRET"
    exit 1
fi

echo "📁 Cloud: $VITE_CLOUDINARY_CLOUD_NAME"
echo "🔑 API Key: ${VITE_CLOUDINARY_API_KEY:0:8}..."

# Cloudinary Admin API endpoint
URL="https://api.cloudinary.com/v1_1/$VITE_CLOUDINARY_CLOUD_NAME/resources/image"

echo ""
echo "📡 Making API request..."

# Make API request with basic auth
response=$(curl -s -u "$VITE_CLOUDINARY_API_KEY:$CLOUDINARY_API_SECRET" \
  "$URL?resource_type=image&type=upload&prefix=fabrics/&max_results=500")

# Check if request was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to make API request"
    exit 1
fi

# Check if response contains error
if echo "$response" | grep -q '"error"'; then
    echo "❌ API Error:"
    echo "$response" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"//'
    exit 1
fi

# Parse response using basic tools
total_count=$(echo "$response" | grep -o '"total_count":[0-9]*' | cut -d':' -f2)
resources_count=$(echo "$response" | grep -o '"resources":\[' | wc -l)

if [ -n "$total_count" ]; then
    echo "✅ API request successful"
    echo ""
    echo "📊 CLOUDINARY SUMMARY:"
    echo "=" | tr ' ' '=' | head -c 50; echo ""
    echo "📁 Total images in 'fabrics/' folder: $total_count"
    
    # Extract some sample fabric codes
    echo ""
    echo "🏷️ SAMPLE FABRIC CODES:"
    echo "$response" | grep -o '"public_id":"fabrics/[^"]*"' | head -10 | while read line; do
        fabric_code=$(echo "$line" | sed 's/"public_id":"fabrics\///;s/"$//' | sed 's/\.[^.]*$//')
        echo "   • $fabric_code"
    done
    
    # Check for specific fabric codes
    echo ""
    echo "🔍 SPECIFIC FABRIC CHECK:"
    
    test_codes=("8525-26" "Datender 24sil")
    for code in "${test_codes[@]}"; do
        if echo "$response" | grep -q "fabrics/$code"; then
            echo "   $code: ✅ Found"
        else
            echo "   $code: ❌ Not found"
        fi
    done
    
else
    echo "❌ Could not parse response"
    echo "Response preview:"
    echo "$response" | head -c 200
    echo "..."
fi

echo ""
echo "🔗 Manual check URLs:"
echo "   https://res.cloudinary.com/$VITE_CLOUDINARY_CLOUD_NAME/image/upload/fabrics/8525-26.jpg"
echo "   https://res.cloudinary.com/$VITE_CLOUDINARY_CLOUD_NAME/image/upload/fabrics/Datender%2024sil.jpg"
