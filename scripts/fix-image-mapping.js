#!/usr/bin/env node

/**
 * Script để sửa cấu trúc file image_mapping.json
 * Chuyển từ {filename: [objects]} sang {fabricCode: url}
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/image_mapping.json');
const OUTPUT_FILE = path.join(__dirname, '../public/image_mapping_fixed.json');
const BACKUP_FILE = path.join(__dirname, '../public/image_mapping_backup.json');

console.log('🔧 Fixing image mapping structure...');

try {
  // Backup original file
  const originalData = fs.readFileSync(INPUT_FILE, 'utf8');
  fs.writeFileSync(BACKUP_FILE, originalData);
  console.log('💾 Backup created:', BACKUP_FILE);

  // Parse original data
  const originalMapping = JSON.parse(originalData);
  console.log(`📊 Original entries: ${Object.keys(originalMapping).length}`);

  // Convert structure
  const newMapping = {};
  let convertedCount = 0;
  let skippedCount = 0;

  for (const [filename, entries] of Object.entries(originalMapping)) {
    if (Array.isArray(entries) && entries.length > 0) {
      // Take the first entry (main fabric)
      const mainEntry = entries.find(entry => entry.type === 'main') || entries[0];
      
      if (mainEntry && mainEntry.fabric_code) {
        // Generate Cloudinary URL for the fabric code
        const fabricCode = mainEntry.fabric_code;
        const cloudinaryUrl = `https://res.cloudinary.com/dgaktc3fb/image/upload/fabrics/${fabricCode}.jpg`;
        
        newMapping[fabricCode] = cloudinaryUrl;
        convertedCount++;
        
        if (convertedCount <= 10) {
          console.log(`✅ ${fabricCode} -> ${cloudinaryUrl}`);
        }
      } else {
        console.warn(`⚠️ Skipping ${filename}: no fabric_code found`);
        skippedCount++;
      }
    } else {
      console.warn(`⚠️ Skipping ${filename}: invalid entries`);
      skippedCount++;
    }
  }

  // Write new mapping
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(newMapping, null, 2));
  console.log(`\n📊 Conversion Summary:`);
  console.log(`   ✅ Converted: ${convertedCount} entries`);
  console.log(`   ⚠️ Skipped: ${skippedCount} entries`);
  console.log(`   📁 Output: ${OUTPUT_FILE}`);

  // Replace original file
  fs.writeFileSync(INPUT_FILE, JSON.stringify(newMapping, null, 2));
  console.log(`\n🔄 Replaced original file: ${INPUT_FILE}`);

  // Test the new structure
  console.log(`\n🧪 Testing new structure...`);
  const testMapping = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const testEntries = Object.entries(testMapping).slice(0, 3);
  
  for (const [fabricCode, url] of testEntries) {
    console.log(`   ${fabricCode}: ${typeof url} -> ${url}`);
  }

  console.log(`\n✅ Image mapping structure fixed successfully!`);
  console.log(`📋 New format: {fabricCode: cloudinaryUrl}`);
  console.log(`🔄 Ready for cross-device sync`);

} catch (error) {
  console.error('❌ Error fixing image mapping:', error.message);
  process.exit(1);
}
