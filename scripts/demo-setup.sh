#!/bin/bash

# Demo Setup Script for Image Auto-Mapping
# Ninh ơi, script này sẽ tạo demo để test tính năng auto-map ảnh

echo "🖼️ Setting up demo for image auto-mapping..."

# Create demo images directory
mkdir -p public/images/fabrics

# Create some demo placeholder images (empty files for now)
echo "📁 Creating demo image files..."

# Get first 10 fabric codes from CSV for demo
fabric_codes=(
  "3 PASS BO - WHITE - COL 15"
  "33139-2-270"
  "71022-10"
  "71022-7"
  "8015-1"
  "8059"
  "99-129-39"
  "A9003-5"
  "AS22541-5"
  "B-1001"
)

# Create demo image files
for code in "${fabric_codes[@]}"; do
  echo "Creating: $code.jpg"
  touch "public/images/fabrics/$code.jpg"
done

echo "✅ Created ${#fabric_codes[@]} demo image files"

# Create a simple HTML file to show image mapping status
cat > public/images/fabrics/README.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Fabric Images Demo</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .image-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .exists { background-color: #d4edda; }
        .missing { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>🖼️ Fabric Images Status</h1>
    <p>This page shows which fabric images are available.</p>
    
    <div id="image-list">
        <p>Loading...</p>
    </div>

    <script>
        const fabricCodes = [
            "3 PASS BO - WHITE - COL 15",
            "33139-2-270", 
            "71022-10",
            "71022-7",
            "8015-1",
            "8059",
            "99-129-39",
            "A9003-5",
            "AS22541-5",
            "B-1001"
        ];

        async function checkImages() {
            const listEl = document.getElementById('image-list');
            listEl.innerHTML = '';
            
            for (const code of fabricCodes) {
                const imagePath = `./${code}.jpg`;
                const div = document.createElement('div');
                div.className = 'image-item';
                
                try {
                    const response = await fetch(imagePath, { method: 'HEAD' });
                    if (response.ok) {
                        div.className += ' exists';
                        div.innerHTML = `✅ <strong>${code}</strong> - Image found`;
                    } else {
                        div.className += ' missing';
                        div.innerHTML = `❌ <strong>${code}</strong> - Image missing`;
                    }
                } catch (error) {
                    div.className += ' missing';
                    div.innerHTML = `❌ <strong>${code}</strong> - Error checking image`;
                }
                
                listEl.appendChild(div);
            }
        }

        checkImages();
    </script>
</body>
</html>
EOF

echo "📄 Created demo status page: public/images/fabrics/README.html"

echo ""
echo "🎯 Demo setup complete!"
echo ""
echo "Next steps:"
echo "1. Open web app: http://localhost:3000"
echo "2. Click 'Import ảnh' button"
echo "3. See the mapping report"
echo "4. Check demo status: http://localhost:3000/images/fabrics/README.html"
echo ""
echo "To add real images:"
echo "- Replace the empty .jpg files with actual images"
echo "- Make sure filenames match fabric codes exactly"
echo "- Refresh the web app to see changes"
