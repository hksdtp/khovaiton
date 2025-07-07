/**
 * Fabric Image Mapping - CLOUDINARY ONLY
 * Ninh ơi, file này chỉ chứa fabric codes có ảnh THẬT trên Cloudinary
 * Đã loại bỏ tất cả ảnh static/giả/mặc định
 * 
 * Generated: 2025-07-07T11:29:02.693Z (Updated with 27 potential matches)
 * Total fabrics with Cloudinary images: 116 (89 original + 27 potential matches)
 */

const FABRICS_WITH_CLOUDINARY_IMAGES = new Set([
  '07013D-88',
  '089C-1',
  '09-730-17',
  '10-780-1402',
  '10-780-17',
  '10-780-316',
  '10-780-41',
  '10-780-5',
  '131-254',
  '22D-990-8',
  '22E-990-10',
  '22E-990-4',
  '316-2',
  '71022-10',
  '71022-2',
  '83082-11',
  '83082-32',
  '83086-06',
  '83086-11',
  '83102-19',
  '83813-7',
  '8525-26', // Added from potential matches
  '8525-42',
  '8525-43',
  '8525-46',
  '8542-11',
  '8557-06',
  '8568-05',
  '8598-02',
  '8600-07',
  '8611-44',
  '8611-46',
  '8612-25',
  '8613-04',
  '8613-13',
  '8614-09',
  '8631-05',
  '88-539-10',
  '88-539-12',
  '88-539-21',
  '88-539-23',
  '88-539-9',
  '91200201S0103', // Added from potential matches
  '99-129-11',
  '99-129-44',
  'A5583-2', // Added from potential matches
  'AL200-21',
  'AL200-30', // Added from potential matches
  'AR-071-02B',
  'ASPERO 19',
  'BD095-85',
  'BERTONE-30',
  'D-3195',
  'D3385',
  'DBY80434-3',
  'DCR-1000-2300-9000',
  'DCR-ES-48',
  'DCR-RP1120',
  'DCR-ST6026',
  'Datender 24sil', // Added from potential matches
  'EB48410186',
  'EF-BOD7543-TUISS',
  'EF214-04',
  'EF216-05',
  'EF218-02', // Added from potential matches
  'EF218-5', // Added from potential matches
  'F00614-20',
  'F13-NB03300105',
  'FB15090A-21',
  'FB15144A3',
  'FB15151A3', // Added from potential matches
  'H01',
  'HA 1754-10', // Added from potential matches
  'HA 1754-11',
  'HA 1754-4', // Added from potential matches
  'HA1449-W', // Added from potential matches
  'HA1754-0701D-28', // Added from potential matches
  'HLR-17',
  'HLR-25',
  'HLR-5',
  'JBL54452-39', // Added from potential matches
  'JNF161', // Added from potential matches
  'LIBERTY-05',
  'M907-9',
  'M908-26',
  'MJ304-03', // Added from potential matches
  'MJ428-06',
  'MJ428-14',
  'NB01300103',
  'NB150629D-2',
  'PRJ-HATCH CHENILLE - D', // Added from potential matches
  'PRT-40273 FR',
  'R700-1',
  'R700-15',
  'R700-19', // Added from potential matches
  'SDWY0035-21-7542-HF-NG',
  'SG21-YH56-1', // Added from potential matches
  'TF13590-4', // Added from potential matches
  'TM17-37',
  'TP01623-0035', // Added from potential matches
  'TP01623-00229', // Added from potential matches
  'TP01623-219',
  'TP01623-222', // Added from potential matches
  'TP01623-228',
  'TP13590-003', // Added from potential matches
  'Vải nhung màu xanh',
  'Voile R/B Cream', // Added from potential matches
  'VR1000-06', // Added from potential matches
  'W5601-24',
  'W5601-9',
  'YB0320-7',
  'YB0822-1', // Added from potential matches
  'YBJS0617', // Added from potential matches
  'YY2156-12',
  'm907-12',
  'w5601-6'
])

export function hasRealImage(fabricCode: string): boolean {
  return FABRICS_WITH_CLOUDINARY_IMAGES.has(fabricCode)
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
