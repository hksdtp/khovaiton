#!/usr/bin/env node

/**
 * Script kiểm tra số lượng ảnh trong Cloudinary
 * Ninh ơi, script này sẽ check tất cả ảnh trong folder 'fabrics'
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌ Missing Cloudinary credentials in .env.local');
  console.log('Required:');
  console.log('- VITE_CLOUDINARY_CLOUD_NAME');
  console.log('- VITE_CLOUDINARY_API_KEY');
  console.log('- CLOUDINARY_API_SECRET');
  process.exit(1);
}

console.log('☁️ Checking Cloudinary images...');
console.log(`📁 Cloud: ${CLOUD_NAME}`);
console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);

async function checkCloudinaryImages() {
  try {
    // Cloudinary Admin API endpoint
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image`;
    
    // Basic auth
    const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
    
    let allImages = [];
    let nextCursor = null;
    let totalRequests = 0;
    
    do {
      totalRequests++;
      console.log(`📡 Request ${totalRequests}${nextCursor ? ` (cursor: ${nextCursor.substring(0, 20)}...)` : ''}`);
      
      const params = new URLSearchParams({
        resource_type: 'image',
        type: 'upload',
        prefix: 'fabrics/', // Only images in fabrics folder
        max_results: '500' // Maximum per request
      });
      
      if (nextCursor) {
        params.append('next_cursor', nextCursor);
      }
      
      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`✅ Found ${data.resources.length} images in this batch`);
      
      allImages = allImages.concat(data.resources);
      nextCursor = data.next_cursor;
      
      // Rate limiting - wait 1 second between requests
      if (nextCursor) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } while (nextCursor);
    
    console.log('\n📊 CLOUDINARY SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`📁 Total images in 'fabrics/' folder: ${allImages.length}`);
    console.log(`📡 API requests made: ${totalRequests}`);
    
    if (allImages.length > 0) {
      // Analyze image names
      const fabricCodes = allImages.map(img => {
        const publicId = img.public_id;
        // Extract fabric code from public_id (remove 'fabrics/' prefix and file extension)
        return publicId.replace('fabrics/', '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
      });
      
      console.log(`\n🏷️ FABRIC CODES ANALYSIS:`);
      console.log(`📦 Unique fabric codes: ${new Set(fabricCodes).size}`);
      
      // Show first 10 fabric codes
      const uniqueCodes = [...new Set(fabricCodes)].slice(0, 10);
      console.log(`\n📋 Sample fabric codes (first 10):`);
      uniqueCodes.forEach((code, index) => {
        console.log(`   ${index + 1}. ${code}`);
      });
      
      if (fabricCodes.length > 10) {
        console.log(`   ... and ${fabricCodes.length - 10} more`);
      }
      
      // Check for specific fabric codes
      const testCodes = ['8525-26', 'Datender 24sil', 'test-fabric'];
      console.log(`\n🔍 SPECIFIC FABRIC CHECK:`);
      testCodes.forEach(code => {
        const found = fabricCodes.includes(code);
        console.log(`   ${code}: ${found ? '✅ Found' : '❌ Not found'}`);
      });
      
      // Image size analysis
      const totalSize = allImages.reduce((sum, img) => sum + (img.bytes || 0), 0);
      const avgSize = totalSize / allImages.length;
      
      console.log(`\n💾 STORAGE ANALYSIS:`);
      console.log(`📏 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📐 Average size: ${(avgSize / 1024).toFixed(2)} KB per image`);
      
      // Recent uploads
      const recentImages = allImages
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      console.log(`\n🕒 RECENT UPLOADS (last 5):`);
      recentImages.forEach((img, index) => {
        const fabricCode = img.public_id.replace('fabrics/', '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const date = new Date(img.created_at).toLocaleDateString('vi-VN');
        console.log(`   ${index + 1}. ${fabricCode} (${date})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking Cloudinary:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check API credentials in .env.local');
      console.log('2. Verify API secret is correct');
      console.log('3. Check Cloudinary account permissions');
    }
  }
}

// Run the check
checkCloudinaryImages();
