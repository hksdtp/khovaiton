/**
 * Update Fabric Image Mapping - Sync với Cloudinary
 * Script để cập nhật fabricImageMapping.ts với tất cả fabric codes có ảnh
 */

const fs = require('fs')
const path = require('path')

// Danh sách fabric codes từ static folder
const STATIC_FABRIC_CODES = [
  '0248243680103',
  '07013D -31',
  '07013D-88',
  '07013D-89 18104120',
  '08-SILVER',
  '089C-1',
  '09 Putty',
  '09-730-17',
  '10 780 -17',
  '10 780 4',
  '10-780-14',
  '10-780-1402',
  '10-780-17',
  '10-780-316',
  '10-780-41',
  '10-780-5',
  '100054-0081',
  '131-254',
  '1803 BLACKOUT',
  '22A-990-5',
  '22D-990-8',
  '22E-990-10',
  '22E-990-2',
  '22E-990-4',
  '3 PASS BO - WHITE - COL 15',
  '31405014',
  '316-2',
  '33139-2-270',
  '3c-40-11',
  '50-008 dcr-T203 SB-12',
  '71022-10',
  '71022-2',
  '71022-7',
  '71022-8',
  '8000',
  '8015-1',
  '8059',
  '8136-2',
  '83082-11',
  '83082-32',
  '83086-06',
  '83086-11',
  '83086-13',
  '83086-20',
  '83100-13',
  '83102-19',
  '83813-7',
  '8525-26',
  '8525-42',
  '8525-43',
  '8525-46',
  '8542-11',
  '8557-06',
  '8568-05',
  '8598-02',
  '8600-07',
  '8607',
  '8611-44',
  '8611-46',
  '8612-25',
  '8613-04',
  '8613-13',
  '8614-09',
  '8615-14',
  '8628-17',
  '8631-05',
  '88-539-10',
  '88-539-12',
  '88-539-21',
  '88-539-23',
  '88-539-9',
  '91200201S0103',
  '99-129-11',
  '99-129-39',
  '99-129-44',
  'A5583-2',
  'A6120A195',
  'A65-2',
  'A9003-5',
  'AL200-21',
  'AL200-30',
  'AR-071-02B',
  'AS22541-5',
  'AS228388-3',
  'AS22878-6',
  'ASPERO 19',
  'B-1001',
  'BD095-298',
  'BD095-85',
  'BERTONE-30',
  'BERTONE-31',
  'BO300102',
  'BWB-8036-1',
  'BWB-8043',
  'BWB-8539',
  'BWB8136-4',
  'Bonaza mufin-28',
  'Capri 2796',
  'D-3195',
  'D3385',
  'DBY80434-3',
  'DBY80434-51',
  'DCR HL-814F',
  'DCR-1000-2300-9000',
  'DCR-1000-2300-9163',
  'DCR-EC-4037F',
  'DCR-ES-48',
  'DCR-HA 1754-16',
  'DCR-HA 1754-7 BLACKCURRAN',
  'DCR-HA 1754-9',
  'DCR-MELIA-COFFEE',
  'DCR-MELIA-NHẠT',
  'DCR-RP1120',
  'DCR-RP1193',
  'DCR-RP2007',
  'DCR-RP2010',
  'DCR-RP770',
  'DCR-ST6026',
  'DCR20018',
  'Datender 24sil',
  'Dymondmie - Straw',
  'EF-BOD7543-TUISS',
  'EF-BON7531-TUISS',
  'EF214-04',
  'EF216-05',
  'EF218-02',
  'EF218-5',
  'F00614-20',
  'F13-NB03300105',
  'F14-DUSK MARTINI',
  'FB15090A-21',
  'FB15144A3',
  'FB15151A2',
  'FB15151A3',
  'FB15169A4',
  'FB17195A-3',
  'FS-GUNMETAL',
  'G8002-01',
  'H01',
  'HA 1754-10',
  'HA 1754-11',
  'HA 1754-4',
  'HA1449-W',
  'HA1754-0701D-28',
  'HARMONY-OXC B014',
  'HARMONY-OXC B12-NG',
  'HLR-17',
  'HLR-25',
  'HLR-5',
  'HY FAGEL-SILVER',
  'IBI-2',
  'ICON WAR WICK - COLOR',
  'JBL54452-39',
  'JBL54452-53',
  'JNF-15-new',
  'JNF-173-17104120',
  'JNF161',
  'LIBERTY-05',
  'LỤA ÉP HỌA TIẾT',
  'M-149',
  'M907-9',
  'M908-26',
  'MJ304-03',
  'MJ428-06',
  'MJ428-14',
  'MUNNAR SILK-23283',
  'NB01300103',
  'NB150629D-2',
  'PR 992',
  'PRJ-EB4834',
  'PRJ-HATCH CHENILLE - D',
  'PRT-40273 FR',
  'R700-1',
  'R700-15',
  'R700-19',
  'SB-12',
  'SDWY0035-21-7542-HF-NG',
  'SG21-14-C434',
  'SG21-19-4007',
  'SG21-YH56-1',
  'ST-5031F',
  'ST5082',
  'Satin Apex SA 9196 Chintz',
  'T201',
  'TF13590-002',
  'TF13590-4',
  'TF13950-006',
  'THCO-14',
  'TM17-37',
  'TP01623-00229',
  'TP01623-0035',
  'TP01623-219',
  'TP01623-222',
  'TP01623-224',
  'TP01623-228',
  'TP13590-003',
  'TP229',
  'V01',
  'VELVET NAMPA 282-4101',
  'VLIET-PURE WHITE A',
  'VOAN HỒNG',
  'VR1000-06',
  'Voile R_B Cream',
  'Vải nhung màu xanh',
  'W5601-20',
  'W5601-24',
  'W5601-9',
  'YB0320-7',
  'YB0822-1',
  'YB0822-2',
  'YB180904-9',
  'YBJS0617',
  'YY2156-10',
  'YY2156-12',
  'dcr- chats word cream',
  'dcr-snong bird beyl',
  'm907-12',
  'moir',
  'w5601-6'
]

async function updateFabricMapping() {
  console.log('🔄 Updating fabricImageMapping.ts with all uploaded Cloudinary images...')
  
  const mappingPath = path.join(__dirname, 'src/data/fabricImageMapping.ts')
  
  // Đọc file hiện tại
  let currentContent = ''
  try {
    currentContent = fs.readFileSync(mappingPath, 'utf8')
  } catch (error) {
    console.error('❌ Failed to read current mapping file:', error.message)
    return
  }
  
  // Tạo nội dung mới
  const newContent = `/**
 * Fabric Image Mapping - CLOUDINARY ONLY (UPDATED)
 * Ninh ơi, file này chứa fabric codes có ảnh THẬT trên Cloudinary
 * Đã cập nhật với tất cả ảnh đã upload lên Cloudinary
 * 
 * Generated: ${new Date().toISOString()}
 * Total fabrics with Cloudinary images: ${STATIC_FABRIC_CODES.length}
 * 
 * ✅ ALL IMAGES NOW ON CLOUDINARY - NO STATIC FALLBACK
 */

const FABRICS_WITH_CLOUDINARY_IMAGES = new Set([
${STATIC_FABRIC_CODES.map(code => `  '${code}'`).join(',\n')}
])

export function hasRealImage(fabricCode: string): boolean {
  // First check the static mapping
  if (FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)) {
    return true
  }

  // Then check runtime cache from syncService for newly uploaded images
  try {
    const syncService = require('@/services/syncService').syncService
    return syncService.hasRuntimeImage(fabricCode)
  } catch (error) {
    // Fallback to static mapping if syncService is not available
    return FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)
  }
}

export function getAllFabricsWithImages(): string[] {
  return Array.from(FABRICS_WITH_CLOUDINARY_IMAGES)
}

export function getFabricImageCount(): number {
  return FABRICS_WITH_CLOUDINARY_IMAGES.size
}

// Chỉ sử dụng Cloudinary - không có static images
export function hasStaticImage(_fabricCode: string): boolean {
  return false
}

export function hasCloudinaryImage(fabricCode: string): boolean {
  return FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)
}

// ✅ TỔNG KẾT: ${STATIC_FABRIC_CODES.length} fabric codes có ảnh trên Cloudinary
// 🚀 TẤT CẢ ẢNH ĐÃ ĐƯỢC UPLOAD LÊN CLOUDINARY
`
  
  // Ghi file mới
  try {
    fs.writeFileSync(mappingPath, newContent, 'utf8')
    console.log(`✅ Updated fabricImageMapping.ts with ${STATIC_FABRIC_CODES.length} fabric codes`)
    console.log('🚀 All fabric codes now mapped to Cloudinary images')
  } catch (error) {
    console.error('❌ Failed to write mapping file:', error.message)
  }
}

// Chạy update
updateFabricMapping()