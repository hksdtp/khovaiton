// Script kiểm tra Cloudinary images từ browser console
// Chạy: loadScript('/check-cloudinary.js') trong console

window.checkCloudinaryImages = async function() {
  console.log('☁️ Checking Cloudinary images...');
  
  // Test một số fabric codes phổ biến
  const testCodes = [
    '8525-26',
    'Datender 24sil', 
    'w5601-6',
    'm907-12',
    'YY2156-12',
    'test-not-exist'
  ];
  
  const cloudName = 'dgaktc3fb';
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fabrics`;
  
  console.log(`📁 Cloud: ${cloudName}`);
  console.log(`🔗 Base URL: ${baseUrl}`);
  
  let foundCount = 0;
  let notFoundCount = 0;
  
  console.log('\n🧪 Testing fabric codes:');
  console.log('=' .repeat(50));
  
  for (const code of testCodes) {
    try {
      const url = `${baseUrl}/${encodeURIComponent(code)}.jpg`;
      
      // Test if image exists using fetch
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ ${code}: Found (${response.status})`);
        foundCount++;
      } else {
        console.log(`❌ ${code}: Not found (${response.status})`);
        notFoundCount++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ ${code}: Error - ${error.message}`);
      notFoundCount++;
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('=' .repeat(30));
  console.log(`✅ Found: ${foundCount}`);
  console.log(`❌ Not found: ${notFoundCount}`);
  console.log(`📊 Success rate: ${((foundCount / testCodes.length) * 100).toFixed(1)}%`);
  
  // Check fabric data from app
  if (window.__FABRIC_DATA__) {
    const totalFabrics = window.__FABRIC_DATA__.length;
    const fabricsWithImages = window.__FABRIC_DATA__.filter(f => f.image).length;
    const imagePercentage = ((fabricsWithImages / totalFabrics) * 100).toFixed(1);
    
    console.log('\n📦 APP DATA:');
    console.log(`📋 Total fabrics: ${totalFabrics}`);
    console.log(`🖼️ Fabrics with images: ${fabricsWithImages}`);
    console.log(`📊 Image coverage: ${imagePercentage}%`);
  }
  
  // Check Cloudinary map
  if (window.__CLOUDINARY_MAP__) {
    console.log(`☁️ Cloudinary map size: ${window.__CLOUDINARY_MAP__.size}`);
  }
  
  return {
    tested: testCodes.length,
    found: foundCount,
    notFound: notFoundCount,
    successRate: ((foundCount / testCodes.length) * 100).toFixed(1) + '%'
  };
};

// Helper function to load script
window.loadScript = function(src) {
  const script = document.createElement('script');
  script.src = src;
  document.head.appendChild(script);
  console.log(`📜 Loaded script: ${src}`);
};

console.log('🔧 Cloudinary checker loaded!');
console.log('📋 Usage: checkCloudinaryImages()');
console.log('📋 Or run: loadScript("/check-cloudinary.js") if not loaded');
