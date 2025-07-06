// Test script để kiểm tra việc parse CSV
import fs from 'fs';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function cleanValue(value) {
  if (!value || typeof value !== 'string') return undefined;
  const cleaned = value.trim().replace(/^"|"$/g, '');
  return cleaned === '' ? undefined : cleaned;
}

try {
  console.log('🔍 Testing CSV parsing...');
  
  // Đọc file CSV
  const csvContent = fs.readFileSync('anhhung.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📄 Total lines: ${lines.length}`);
  console.log(`📋 Header: ${lines[0]}`);
  
  // Parse header
  const headerValues = parseCSVLine(lines[0]);
  console.log(`🏷️ Header columns (${headerValues.length}):`, headerValues);
  
  // Parse first 5 data lines
  console.log('\n🔍 First 5 data lines:');
  for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    console.log(`\nLine ${i + 1}:`);
    console.log(`  Raw line: ${line}`);
    console.log(`  Parsed values (${values.length}):`, values);
    
    // Map to our structure
    const code = cleanValue(values[1]);
    const statusComputed = cleanValue(values[9]);
    
    console.log(`  Code: "${code}"`);
    console.log(`  Status_Computed (index 9): "${statusComputed}"`);
    console.log(`  Values[9] raw: "${values[9]}"`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
