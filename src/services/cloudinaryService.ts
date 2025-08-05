/**
 * Cloudinary Service for Fabric Image Management
 * Ninh ơi, service này handle upload và fetch ảnh từ Cloudinary
 */

// import { Cloudinary } from '@cloudinary/url-gen'

// Environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'fabric_images'

// Fabric code corrections for mismatched names (including display name mappings)
const FABRIC_CODE_CORRECTIONS: Record<string, any> = {
  '3 PASS BO - WHITE - COL 15': {"originalCode": "3 PASS BO - WHITE - COL 15", "cloudinaryFileName": "fabric_images/3 PASS BO - WHITE - COL 15", "displayName": "3 PASS BO - WHITE - COL 15", "matchType": "new_fabric_images_structure", "confidence": 100},
  'AR-079-02B': {"originalCode": "AR-079-02B", "cloudinaryFileName": "AR-071-02B", "matchType": "similar", "confidence": 88},
  'vải nhung màu be': {"originalCode": "vải nhung màu be", "cloudinaryFileName": "fabric_images/a44zn2hnktvmktsfdt7g", "displayName": "vải nhung màu be_edited", "matchType": "moved_to_fabric_images", "confidence": 100},
  'R700-05': {"originalCode": "R700-05", "cloudinaryFileName": "fabric_images/agc184xbjm0n715e5aet", "displayName": "R700-05_edited", "matchType": "moved_to_fabric_images", "confidence": 100},
  'TF13590-002': {"originalCode": "TF13590-002", "cloudinaryFileName": "fabric_images/d6ic5ifzjafn4x8lfqhs", "displayName": "TF13590-002_edited", "matchType": "moved_to_fabric_images", "confidence": 100},
  'Carnival r/b mauve 210': {"originalCode": "Carnival r/b mauve 210", "cloudinaryFileName": "rlz7l2vnqto8vxmo2egj", "displayName": "b mauve 210_edited", "matchType": "final_edited_fix", "confidence": 67},
  'HENILY R/B RUN BN': {"originalCode": "HENILY R/B RUN BN", "cloudinaryFileName": "wq8xmjxpop92m9enfvzd", "displayName": "B RUN BN_edited", "matchType": "final_edited_fix", "confidence": 64},
  'TP01623-224': {"originalCode": "TP01623-224", "cloudinaryFileName": "TP01623-224", "matchType": "high_confidence", "confidence": 95},
  'Bonaza mufin-28': {"originalCode": "Bonaza mufin-28", "cloudinaryFileName": "BONAZA MUFFIN-28", "matchType": "high_confidence", "confidence": 95},
  'AS22878-6': {"originalCode": "AS22878-6", "cloudinaryFileName": "AS-22878-6", "matchType": "high_confidence", "confidence": 95},
  '22A-990-5': {"originalCode": "22A-990-5", "cloudinaryFileName": "22A990-5", "matchType": "high_confidence", "confidence": 95},
  '22E-990-2': {"originalCode": "22E-990-2", "cloudinaryFileName": "22E990-2", "matchType": "high_confidence", "confidence": 95},
  'Voile R/B White': {"originalCode": "Voile R/B White", "cloudinaryFileName": "VOICE RB WHITE", "matchType": "high_confidence", "confidence": 95},
  'CARNIVAL R/B TEAL 210': {"originalCode": "CARNIVAL R/B TEAL 210", "cloudinaryFileName": "DCR-CARNIVAL RB TEAL 210", "matchType": "high_confidence", "confidence": 95},
  'dcr- chats word cream': {"originalCode": "dcr- chats word cream", "cloudinaryFileName": "DCR-CHAT WORD CREAM", "matchType": "high_confidence", "confidence": 95},
  'ELITEX EB5115 WHITE/MUSHR': {"originalCode": "ELITEX EB5115 WHITE/MUSHR", "cloudinaryFileName": "ELITE EB5115 WHITE MUSHROOM", "matchType": "high_confidence", "confidence": 95},
  'YB180904-9': {"originalCode": "YB180904-9", "cloudinaryFileName": "VB180904-9", "matchType": "high_confidence", "confidence": 95},
  'AR-076-02B': {"originalCode": "AR-076-02B", "cloudinaryFileName": "AR-071-02B", "matchType": "high_confidence", "confidence": 95},
  'BERTONE-31': {"originalCode": "BERTONE-31", "cloudinaryFileName": "BERTONE-30", "matchType": "high_confidence", "confidence": 95},
  'JNF-15-new': {"originalCode": "JNF-15-new", "cloudinaryFileName": "JNF-15 new", "matchType": "high_confidence", "confidence": 95},
  'JNF161': {
    "originalCode": "JNF161",
    "cloudinaryFileName": "JNF 161",
    "matchType": "space_difference_fix",
    "confidence": 95
  },
  'TP01623-0035': {
    "originalCode": "TP01623-0035",
    "cloudinaryFileName": "TP01623-0035 VẢI BỌC DẬP NHUNG",
    "matchType": "correct_filename_fix",
    "confidence": 100
  },
  '91200201S0103': {
    "originalCode": "91200201S0103",
    "cloudinaryFileName": "l7x0xsqbnei8pursrffz",
    "displayName": "91200201S0103_edited",
    "matchType": "edited_file_fix",
    "confidence": 100
  },
  '10-780-14': {
    "originalCode": "10-780-14",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "high_confidence",
    "confidence": 90
  },
  'DCR HL-814F': {
    "originalCode": "DCR HL-814F",
    "cloudinaryFileName": "DCR-HL-814F",
    "matchType": "high_confidence",
    "confidence": 90
  },
  'AS228388-3': {
    "originalCode": "AS228388-3",
    "cloudinaryFileName": "AS-22388-3",
    "matchType": "high_confidence",
    "confidence": 90
  },
  'BD095-298': {
    "originalCode": "BD095-298",
    "cloudinaryFileName": "BD 095298",
    "matchType": "high_confidence",
    "confidence": 88
  },
  'ICON WAR WICK - COLOR': {
    "originalCode": "ICON WAR WICK - COLOR",
    "cloudinaryFileName": "Icon war wich color aqua",
    "matchType": "high_confidence",
    "confidence": 88
  },
  'YY2156-10': {
    "originalCode": "YY2156-10",
    "cloudinaryFileName": "YY2156-12",
    "matchType": "high_confidence",
    "confidence": 88
  },
  'SG21-14-C434': {
    "originalCode": "SG21-14-C434",
    "cloudinaryFileName": "SG 21-14-0434",
    "matchType": "high_confidence",
    "confidence": 88
  },
  'W5601-20': {
    "originalCode": "W5601-20",
    "cloudinaryFileName": "W5601-24",
    "matchType": "high_confidence",
    "confidence": 87
  },
  '83086-08': {
    "originalCode": "83086-08",
    "cloudinaryFileName": "83086-20 (1)",
    "matchType": "high_confidence",
    "confidence": 87
  },
  '83086-13': {
    "originalCode": "83086-13",
    "cloudinaryFileName": "83086-11",
    "matchType": "high_confidence",
    "confidence": 87
  },
  '83086-20': {
    "originalCode": "83086-20",
    "cloudinaryFileName": "83086-20 (1)",
    "matchType": "high_confidence",
    "confidence": 87
  },
  'EF-BON7531-TUISS': {
    "originalCode": "EF-BON7531-TUISS",
    "cloudinaryFileName": "EF-BOD7543-TUISS",
    "matchType": "high_confidence",
    "confidence": 87
  },
  'HARMONY-OXC B010': {
    "originalCode": "HARMONY-OXC B010",
    "cloudinaryFileName": "HARMONY OXC B009",
    "matchType": "high_confidence",
    "confidence": 87
  },
  'JBL54452-53': {
    "originalCode": "JBL54452-53",
    "cloudinaryFileName": "JBL 54452 53",
    "matchType": "high_confidence",
    "confidence": 86
  },
  'TF13950-006': {
    "originalCode": "TF13950-006",
    "cloudinaryFileName": "TF 13590-006",
    "matchType": "high_confidence",
    "confidence": 86
  },
  '71022-7': {
    "originalCode": "71022-7",
    "cloudinaryFileName": "71022-2",
    "matchType": "high_confidence",
    "confidence": 85
  },
  '71022-9': {
    "originalCode": "71022-9",
    "cloudinaryFileName": "71022-2",
    "matchType": "high_confidence",
    "confidence": 85
  },
  '8600-06': {
    "originalCode": "8600-06",
    "cloudinaryFileName": "8600-07",
    "matchType": "high_confidence",
    "confidence": 85
  },
  'DBY80434-51': {
    "originalCode": "DBY80434-51",
    "cloudinaryFileName": "DBY80434-3",
    "matchType": "high_confidence",
    "confidence": 85
  },
  'FB15151A2': {
    "originalCode": "FB15151A2",
    "cloudinaryFileName": "FB 1515 1A-2",
    "matchType": "high_confidence",
    "confidence": 85
  },
  'THCO-14': {
    "originalCode": "THCO-14",
    "cloudinaryFileName": "THCO 14",
    "matchType": "high_confidence",
    "confidence": 85
  },
  '33139-2-270': {
    "originalCode": "33139-2-270",
    "cloudinaryFileName": "33139-2-270",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '71022-10': {
    "originalCode": "71022-10",
    "cloudinaryFileName": "71022-10",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '99-129-39': {
    "originalCode": "99-129-39",
    "cloudinaryFileName": "99-129-11",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  'DCR-71022-8': {
    "originalCode": "DCR-71022-8",
    "cloudinaryFileName": "71022-10",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  'DCR-MELIA-NHẠT': {
    "originalCode": "DCR-MELIA-NHẠT",
    "cloudinaryFileName": "DCR 1078",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  'FB15144A3': {
    "originalCode": "FB15144A3",
    "cloudinaryFileName": "FB15144A3",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  'FS-TEAL': {
    "originalCode": "FS-TEAL",
    "cloudinaryFileName": "DCR-CARNIVAL RB TEAL 210",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  'HY FAGEL-SILVER': {
    "originalCode": "HY FAGEL-SILVER",
    "cloudinaryFileName": "08-SILVER",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  'SG21-19-4007': {
    "originalCode": "SG21-19-4007",
    "cloudinaryFileName": "SG21 - YH 56-1",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  'YB0320-7': {
    "originalCode": "YB0320-7",
    "cloudinaryFileName": "YB0320-7",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '0248243802071-TUISS': {
    "originalCode": "0248243802071-TUISS",
    "cloudinaryFileName": "EF-BOD7543-TUISS",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '07013D-88': {
    "originalCode": "07013D-88",
    "cloudinaryFileName": "07013D-88",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '089C-1': {
    "originalCode": "089C-1",
    "cloudinaryFileName": "089C-1",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '09-730-17': {
    "originalCode": "09-730-17",
    "cloudinaryFileName": "09-730-17",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '10-780-1402': {
    "originalCode": "10-780-1402",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '10-780-17': {
    "originalCode": "10-780-17",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '10-780-316': {
    "originalCode": "10-780-316",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '10-780-41': {
    "originalCode": "10-780-41",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '10-780-5': {
    "originalCode": "10-780-5",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '131-254': {
    "originalCode": "131-254",
    "cloudinaryFileName": "131-254",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '142421-DCR': {
    "originalCode": "142421-DCR",
    "cloudinaryFileName": "DCR 1078",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '22D-990-8': {
    "originalCode": "22D-990-8",
    "cloudinaryFileName": "22E-990-10",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '22E-990-10': {
    "originalCode": "22E-990-10",
    "cloudinaryFileName": "22E-990-10",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '22E-990-4': {
    "originalCode": "22E-990-4",
    "cloudinaryFileName": "22E-990-10",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '316-2': {
    "originalCode": "316-2",
    "cloudinaryFileName": "316-2",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '50-008 dcr-T203 SB-12': {
    "originalCode": "50-008 dcr-T203 SB-12",
    "cloudinaryFileName": "DCR 1078",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '83082-11': {
    "originalCode": "83082-11",
    "cloudinaryFileName": "83082-32",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '83082-32': {
    "originalCode": "83082-32",
    "cloudinaryFileName": "83082-32",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '83102-19': {
    "originalCode": "83102-19",
    "cloudinaryFileName": "83102-19",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '83813-7': {
    "originalCode": "83813-7",
    "cloudinaryFileName": "83813-7",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8525-26': {
    "originalCode": "8525-26",
    "cloudinaryFileName": "8525-42",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '8525-42': {
    "originalCode": "8525-42",
    "cloudinaryFileName": "8525-42",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '8525-43': {
    "originalCode": "8525-43",
    "cloudinaryFileName": "8525-42",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '8525-46': {
    "originalCode": "8525-46",
    "cloudinaryFileName": "8525-42",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '8542-11': {
    "originalCode": "8542-11",
    "cloudinaryFileName": "8542-11",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8557-06': {
    "originalCode": "8557-06",
    "cloudinaryFileName": "8557-06",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8568-05': {
    "originalCode": "8568-05",
    "cloudinaryFileName": "8568-05",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8598-02': {
    "originalCode": "8598-02",
    "cloudinaryFileName": "8598-02",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8611-44': {
    "originalCode": "8611-44",
    "cloudinaryFileName": "8611-46",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8611-46': {
    "originalCode": "8611-46",
    "cloudinaryFileName": "8611-46",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '8612-25': {
    "originalCode": "8612-25",
    "cloudinaryFileName": "8612-25",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8613-04': {
    "originalCode": "8613-04",
    "cloudinaryFileName": "8613-13",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8613-13': {
    "originalCode": "8613-13",
    "cloudinaryFileName": "8613-13",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '8614-09': {
    "originalCode": "8614-09",
    "cloudinaryFileName": "8614-09",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '8631-05': {
    "originalCode": "8631-05",
    "cloudinaryFileName": "8631-05",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '88-539-10': {
    "originalCode": "88-539-10",
    "cloudinaryFileName": "88-539-12",
    "matchType": "aggressive_code",
    "confidence": 100
  },
  '88-539-12': {
    "originalCode": "88-539-12",
    "cloudinaryFileName": "88-539-12",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '88-539-21': {
    "originalCode": "88-539-21",
    "cloudinaryFileName": "88-539-12",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '88-539-23': {
    "originalCode": "88-539-23",
    "cloudinaryFileName": "88-539-12",
    "matchType": "aggressive_part",
    "confidence": 100
  },
  '71022-2': {
    "originalCode": "71022-2",
    "cloudinaryFileName": "71022-2",
    "matchType": "exact_match",
    "confidence": 100
  },
  '8000': {
    "originalCode": "8000",
    "cloudinaryFileName": "180004",
    "matchType": "contains_match",
    "confidence": 90
  },
  '83086-06': {
    "originalCode": "83086-06",
    "cloudinaryFileName": "83086-20 (1)",
    "matchType": "exact_match",
    "confidence": 100
  },
  '83086-11': {
    "originalCode": "83086-11",
    "cloudinaryFileName": "83086-11",
    "matchType": "exact_match",
    "confidence": 100
  },
  '83100-13': {
    "originalCode": "83100-13",
    "cloudinaryFileName": "83 100 13",
    "matchType": "similar_match",
    "confidence": 95
  },
  '8600-07': {
    "originalCode": "8600-07",
    "cloudinaryFileName": "8600-07",
    "matchType": "exact_match",
    "confidence": 100
  },
  'AS-22388-3': {
    "originalCode": "AS-22388-3",
    "cloudinaryFileName": "AS-22388-3",
    "matchType": "exact_match",
    "confidence": 100
  },
  'BD 095298': {
    "originalCode": "BD 095298",
    "cloudinaryFileName": "BD 095298",
    "matchType": "exact_match",
    "confidence": 100
  },
  'DBY80434-3': {
    "originalCode": "DBY80434-3",
    "cloudinaryFileName": "DBY80434-3",
    "matchType": "exact_match",
    "confidence": 100
  },
  'DCR-1000-2300-9000': {
    "originalCode": "DCR-1000-2300-9000",
    "cloudinaryFileName": "DCR-1000-2300-9000",
    "matchType": "exact_match",
    "confidence": 100
  },
  'DCR-1000-2300-9163': {
    "originalCode": "DCR-1000-2300-9163",
    "cloudinaryFileName": "DCR-1000-2300-9000",
    "matchType": "partial_match",
    "confidence": 80
  },
  'DCR-EC-4037F': {
    "originalCode": "DCR-EC-4037F",
    "cloudinaryFileName": "EC-4037",
    "matchType": "reverse_contains",
    "confidence": 85
  },
  'DCR-ES-48': {
    "originalCode": "DCR-ES-48",
    "cloudinaryFileName": "DCR-ES-48",
    "matchType": "exact_match",
    "confidence": 100
  },
  'DCR-RP1120': {
    "originalCode": "DCR-RP1120",
    "cloudinaryFileName": "DCR-RP1120",
    "matchType": "exact_match",
    "confidence": 100
  },
  'DCR-ST6026': {
    "originalCode": "DCR-ST6026",
    "cloudinaryFileName": "DCR-ST6026",
    "matchType": "exact_match",
    "confidence": 100
  },
  'EF-BOD7543-TUISS': {
    "originalCode": "EF-BOD7543-TUISS",
    "cloudinaryFileName": "EF-BOD7543-TUISS",
    "matchType": "exact_match",
    "confidence": 100
  },
  'FB 1515 1A-2': {
    "originalCode": "FB 1515 1A-2",
    "cloudinaryFileName": "FB 1515 1A-2",
    "matchType": "exact_match",
    "confidence": 100
  },
  'FB15151A3': {
    "originalCode": "FB15151A3",
    "cloudinaryFileName": "FB 15151A3",
    "matchType": "similar_match",
    "confidence": 95
  },
  'HARMONY OXC B009': {
    "originalCode": "HARMONY OXC B009",
    "cloudinaryFileName": "HARMONY OXC B009",
    "matchType": "exact_match",
    "confidence": 100
  },
  'Icon war wich color aqua': {
    "originalCode": "Icon war wich color aqua",
    "cloudinaryFileName": "Icon war wich color aqua",
    "matchType": "exact_match",
    "confidence": 100
  },
  'JBL 54452 53': {
    "originalCode": "JBL 54452 53",
    "cloudinaryFileName": "JBL 54452 53",
    "matchType": "exact_match",
    "confidence": 100
  },
  'R700-15': {
    "originalCode": "R700-15",
    "cloudinaryFileName": "R700-15",
    "matchType": "exact_match",
    "confidence": 100
  },
  'SG 21-14-0434': {
    "originalCode": "SG 21-14-0434",
    "cloudinaryFileName": "SG 21-14-0434",
    "matchType": "exact_match",
    "confidence": 100
  },
  'TF 13590-006': {
    "originalCode": "TF 13590-006",
    "cloudinaryFileName": "TF 13590-006",
    "matchType": "exact_match",
    "confidence": 100
  },
  'THCO 14': {
    "originalCode": "THCO 14",
    "cloudinaryFileName": "THCO 14",
    "matchType": "exact_match",
    "confidence": 100
  },
  'W5601-24': {
    "originalCode": "W5601-24",
    "cloudinaryFileName": "W5601-24",
    "matchType": "exact_match",
    "confidence": 100
  },
  'YBJS0617': {
    "originalCode": "YBJS0617",
    "cloudinaryFileName": "YBJS 0617",
    "matchType": "similar_match",
    "confidence": 95
  },
  'YY2156-12': {
    "originalCode": "YY2156-12",
    "cloudinaryFileName": "YY2156-12",
    "matchType": "exact_match",
    "confidence": 100
  },
  'dcr-snong bird beyl': {
    "originalCode": "dcr-snong bird beyl",
    "cloudinaryFileName": "MO RONG_DCR-SNONG BIRD BEYL",
    "matchType": "contains_match",
    "confidence": 90
  },
  'm907-12': {
    "originalCode": "m907-12",
    "cloudinaryFileName": "M907-12",
    "matchType": "case_insensitive_exact",
    "confidence": 100
  },
  'w5601-6': {
    "originalCode": "w5601-6",
    "cloudinaryFileName": "W5601-6",
    "matchType": "case_insensitive_exact",
    "confidence": 100
  },
  'Capri 2796': {
    "originalCode": "Capri 2796",
    "cloudinaryFileName": "Capri 2796",
    "matchType": "static_upload",
    "confidence": 100
  },
  'PR 992': {
    "originalCode": "PR 992",
    "cloudinaryFileName": "PR 992",
    "matchType": "static_upload",
    "confidence": 100
  },
  'SB-12': {
    "originalCode": "SB-12",
    "cloudinaryFileName": "SB-12",
    "matchType": "static_upload",
    "confidence": 100
  },
  '8607': {
    "originalCode": "8607",
    "cloudinaryFileName": "8607",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BWB8136-4': {
    "originalCode": "BWB8136-4",
    "cloudinaryFileName": "BWB8136-4",
    "matchType": "static_upload",
    "confidence": 100
  },
  'IBI-2': {
    "originalCode": "IBI-2",
    "cloudinaryFileName": "IBI-2 cankhoto",
    "matchType": "static_upload",
    "confidence": 100
  },
  '71022-8': {
    "originalCode": "71022-8",
    "cloudinaryFileName": "71022-8",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BERTONE-30': {
    "originalCode": "BERTONE-30",
    "cloudinaryFileName": "BERTONE-30",
    "matchType": "static_upload",
    "confidence": 100
  },
  '10 780 4': {
    "originalCode": "10 780 4",
    "cloudinaryFileName": "10 780 4",
    "matchType": "static_upload",
    "confidence": 100
  },
  'moir': {
    "originalCode": "moir",
    "cloudinaryFileName": "moir",
    "matchType": "static_upload",
    "confidence": 100
  },
  'VOAN HỒNG': {
    "originalCode": "VOAN HỒNG",
    "cloudinaryFileName": "VOAN HỒNG",
    "matchType": "static_upload",
    "confidence": 100
  },
  'AL200-30': {
    "originalCode": "AL200-30",
    "cloudinaryFileName": "AL200-30",
    "matchType": "static_upload",
    "confidence": 100
  },
  '07013D-89 18104120': {
    "originalCode": "07013D-89 18104120",
    "cloudinaryFileName": "07013D-89 18104120",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BD095-85': {
    "originalCode": "BD095-85",
    "cloudinaryFileName": "BD095-85",
    "matchType": "static_upload",
    "confidence": 100
  },
  'MJ428-14': {
    "originalCode": "MJ428-14",
    "cloudinaryFileName": "MJ428-14",
    "matchType": "static_upload",
    "confidence": 100
  },
  'V01': {
    "originalCode": "V01",
    "cloudinaryFileName": "INES-NFPA V01",
    "matchType": "static_upload",
    "confidence": 100
  },
  'AR-071-02B': {
    "originalCode": "AR-071-02B",
    "cloudinaryFileName": "AR-071-02B",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-RP1193': {
    "originalCode": "DCR-RP1193",
    "cloudinaryFileName": "DCR-RP1193",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HARMONY-OXC B12-NG': {
    "originalCode": "HARMONY-OXC B12-NG",
    "cloudinaryFileName": "HARMONY-OXC B12-NG",
    "matchType": "static_upload",
    "confidence": 100
  },
  '3c-40-11': {
    "originalCode": "3c-40-11",
    "cloudinaryFileName": "3c-40-11",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-MELIA-COFFEE': {
    "originalCode": "DCR-MELIA-COFFEE",
    "cloudinaryFileName": "DCR-MELIA-COFFEE",
    "matchType": "static_upload",
    "confidence": 100
  },
  '99-129-44': {
    "originalCode": "99-129-44",
    "cloudinaryFileName": "99-129-44",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TP01623-222': {
    "originalCode": "TP01623-222",
    "cloudinaryFileName": "TP01623-222",
    "matchType": "static_upload",
    "confidence": 100
  },
  'MJ304-03': {
    "originalCode": "MJ304-03",
    "cloudinaryFileName": "MJ304-03",
    "matchType": "static_upload",
    "confidence": 100
  },
  'ST5082': {
    "originalCode": "ST5082",
    "cloudinaryFileName": "ST5082",
    "matchType": "static_upload",
    "confidence": 100
  },
  'D3385': {
    "originalCode": "D3385",
    "cloudinaryFileName": "D3385",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-RP770': {
    "originalCode": "DCR-RP770",
    "cloudinaryFileName": "DCR-RP770",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HLR-5': {
    "originalCode": "HLR-5",
    "cloudinaryFileName": "HLR-5",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BWB-8539': {
    "originalCode": "BWB-8539",
    "cloudinaryFileName": "BWB-8539",
    "matchType": "static_upload",
    "confidence": 100
  },
  'FB15169A4': {
    "originalCode": "FB15169A4",
    "cloudinaryFileName": "FB15169A4",
    "matchType": "static_upload",
    "confidence": 100
  },
  'A65-2': {
    "originalCode": "A65-2",
    "cloudinaryFileName": "A65-2",
    "matchType": "static_upload",
    "confidence": 100
  },
  'MJ428-06': {
    "originalCode": "MJ428-06",
    "cloudinaryFileName": "MJ428-06",
    "matchType": "static_upload",
    "confidence": 100
  },
  'FS-GUNMETAL': {
    "originalCode": "FS-GUNMETAL",
    "cloudinaryFileName": "FS-GUNMETAL",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TP01623-219': {
    "originalCode": "TP01623-219",
    "cloudinaryFileName": "TP01623-219",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HA 1754-4': {
    "originalCode": "HA 1754-4",
    "cloudinaryFileName": "HA 1754-4",
    "matchType": "static_upload",
    "confidence": 100
  },
  '8015-1': {
    "originalCode": "8015-1",
    "cloudinaryFileName": "8015-1",
    "matchType": "static_upload",
    "confidence": 100
  },
  'B-1001': {
    "originalCode": "B-1001",
    "cloudinaryFileName": "B-1001",
    "matchType": "static_upload",
    "confidence": 100
  },
  'A6120A195': {
    "originalCode": "A6120A195",
    "cloudinaryFileName": "A6120A195",
    "matchType": "static_upload",
    "confidence": 100
  },
  'AL200-21': {
    "originalCode": "AL200-21",
    "cloudinaryFileName": "AL200-21",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HLR-17': {
    "originalCode": "HLR-17",
    "cloudinaryFileName": "HLR-17",
    "matchType": "static_upload",
    "confidence": 100
  },
  'M908-26': {
    "originalCode": "M908-26",
    "cloudinaryFileName": "M908-26",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HARMONY-OXC B014': {
    "originalCode": "HARMONY-OXC B014",
    "cloudinaryFileName": "HARMONY-OXC B014",
    "matchType": "static_upload",
    "confidence": 100
  },
  'A9003-5': {
    "originalCode": "A9003-5",
    "cloudinaryFileName": "A9003-5",
    "matchType": "static_upload",
    "confidence": 100
  },
  'EF216-05': {
    "originalCode": "EF216-05",
    "cloudinaryFileName": "EF216-05",
    "matchType": "static_upload",
    "confidence": 100
  },
  'EF218-02': {
    "originalCode": "EF218-02",
    "cloudinaryFileName": "EF218-02",
    "matchType": "static_upload",
    "confidence": 100
  },
  'G8002-01': {
    "originalCode": "G8002-01",
    "cloudinaryFileName": "G8002-01",
    "matchType": "static_upload",
    "confidence": 100
  },
  'LIBERTY-05': {
    "originalCode": "LIBERTY-05",
    "cloudinaryFileName": "Liberty-05",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-HA 1754-7 BLACKCURRAN': {
    "originalCode": "DCR-HA 1754-7 BLACKCURRAN",
    "cloudinaryFileName": "DCR-HA 1754-7 BLACKCURRAN",
    "matchType": "static_upload",
    "confidence": 100
  },
  'M907-9': {
    "originalCode": "M907-9",
    "cloudinaryFileName": "M907-9",
    "matchType": "static_upload",
    "confidence": 100
  },
  'H01': {
    "originalCode": "H01",
    "cloudinaryFileName": "H01",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-RP2007': {
    "originalCode": "DCR-RP2007",
    "cloudinaryFileName": "DCR-RP2007",
    "matchType": "static_upload",
    "confidence": 100
  },
  'PRJ-EB4834': {
    "originalCode": "PRJ-EB4834",
    "cloudinaryFileName": "PRJ-EB4834",
    "matchType": "static_upload",
    "confidence": 100
  },
  'VELVET NAMPA 282-4101': {
    "originalCode": "VELVET NAMPA 282-4101",
    "cloudinaryFileName": "VELVET NAMPA 282-4101",
    "matchType": "static_upload",
    "confidence": 100
  },
  '8059': {
    "originalCode": "8059",
    "cloudinaryFileName": "8059",
    "matchType": "static_upload",
    "confidence": 100
  },
  '8136-2': {
    "originalCode": "8136-2",
    "cloudinaryFileName": "8136-2",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HA1449-W': {
    "originalCode": "HA1449-W",
    "cloudinaryFileName": "HA1449-W",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HA 1754-10': {
    "originalCode": "HA 1754-10",
    "cloudinaryFileName": "HA 1754-10",
    "matchType": "static_upload",
    "confidence": 100
  },
  'EF214-04': {
    "originalCode": "EF214-04",
    "cloudinaryFileName": "EF214-04",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-RP2010': {
    "originalCode": "DCR-RP2010",
    "cloudinaryFileName": "DCR-RP2010",
    "matchType": "static_upload",
    "confidence": 100
  },
  'FB15090A-21': {
    "originalCode": "FB15090A-21",
    "cloudinaryFileName": "FB15090A-21",
    "matchType": "static_upload",
    "confidence": 100
  },
  '8615-14': {
    "originalCode": "8615-14",
    "cloudinaryFileName": "8615-14",
    "matchType": "static_upload",
    "confidence": 100
  },
  'Satin Apex SA 9196 Chintz': {
    "originalCode": "Satin Apex SA 9196 Chintz",
    "cloudinaryFileName": "Satin Apex SA 9196 Chintz",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TF13590-4': {
    "originalCode": "TF13590-4",
    "cloudinaryFileName": "TF13590-4",
    "matchType": "static_upload",
    "confidence": 100
  },
  '100054-0081': {
    "originalCode": "100054-0081",
    "cloudinaryFileName": "100054-0081",
    "matchType": "static_upload",
    "confidence": 100
  },
  'EF218-5': {
    "originalCode": "EF218-5",
    "cloudinaryFileName": "EF218-5",
    "matchType": "static_upload",
    "confidence": 100
  },
  'A5583-2': {
    "originalCode": "A5583-2",
    "cloudinaryFileName": "A5583-2",
    "matchType": "static_upload",
    "confidence": 100
  },
  'JNF-173-17104120': {
    "originalCode": "JNF-173-17104120",
    "cloudinaryFileName": "JNF-173-17104120",
    "matchType": "static_upload",
    "confidence": 100
  },
  '99-129-11': {
    "originalCode": "99-129-11",
    "cloudinaryFileName": "99-129-11",
    "matchType": "static_upload",
    "confidence": 100
  },
  'R700-19': {
    "originalCode": "R700-19",
    "cloudinaryFileName": "R700-19",
    "matchType": "static_upload",
    "confidence": 100
  },
  '10 780 -17': {
    "originalCode": "10 780 -17",
    "cloudinaryFileName": "10-780-1402",
    "matchType": "static_upload",
    "confidence": 100
  },
  'Vải nhung màu xanh': {
    "originalCode": "Vải nhung màu xanh",
    "cloudinaryFileName": "Vải nhung màu xanh",
    "matchType": "static_upload",
    "confidence": 100
  },
  'F14-DUSK MARTINI': {
    "originalCode": "F14-DUSK MARTINI",
    "cloudinaryFileName": "F14-DUSK MARTINI",
    "matchType": "static_upload",
    "confidence": 100
  },
  'SG21-YH56-1': {
    "originalCode": "SG21-YH56-1",
    "cloudinaryFileName": "SG21-YH56-1",
    "matchType": "static_upload",
    "confidence": 100
  },
  'M-149': {
    "originalCode": "M-149",
    "cloudinaryFileName": "M-149",
    "matchType": "static_upload",
    "confidence": 100
  },
  '8628-17': {
    "originalCode": "8628-17",
    "cloudinaryFileName": "8628-17",
    "matchType": "static_upload",
    "confidence": 100
  },
  'Voile R_B Cream': {
    "originalCode": "Voile R_B Cream",
    "cloudinaryFileName": "Voile R_B Cream",
    "matchType": "static_upload",
    "confidence": 100
  },
  'FB17195A-3': {
    "originalCode": "FB17195A-3",
    "cloudinaryFileName": "FB17195A-3",
    "matchType": "static_upload",
    "confidence": 100
  },
  'PRJ-HATCH CHENILLE - D': {
    "originalCode": "PRJ-HATCH CHENILLE - D",
    "cloudinaryFileName": "PRJ-HATCH CHENILLE - D",
    "matchType": "static_upload",
    "confidence": 100
  },
  '07013D -31': {
    "originalCode": "07013D -31",
    "cloudinaryFileName": "07013D-88",
    "matchType": "static_upload",
    "confidence": 100
  },
  '31405014': {
    "originalCode": "31405014",
    "cloudinaryFileName": "31405014",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BO300102': {
    "originalCode": "BO300102",
    "cloudinaryFileName": "BO300102",
    "matchType": "static_upload",
    "confidence": 100
  },
  'D-3195': {
    "originalCode": "D-3195",
    "cloudinaryFileName": "D-3195",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BWB-8036-1': {
    "originalCode": "BWB-8036-1",
    "cloudinaryFileName": "BWB-8036-1",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HA1754-0701D-28': {
    "originalCode": "HA1754-0701D-28",
    "cloudinaryFileName": "HA1754-0701D-28",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TP13590-003': {
    "originalCode": "TP13590-003",
    "cloudinaryFileName": "TP13590-003",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TM17-37': {
    "originalCode": "TM17-37",
    "cloudinaryFileName": "TM17-37",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR20018': {
    "originalCode": "DCR20018",
    "cloudinaryFileName": "DCR20018",
    "matchType": "static_upload",
    "confidence": 100
  },
  'F13-NB03300105': {
    "originalCode": "F13-NB03300105",
    "cloudinaryFileName": "F13-NB03300105",
    "matchType": "static_upload",
    "confidence": 100
  },
  'PRT-40273 FR': {
    "originalCode": "PRT-40273 FR",
    "cloudinaryFileName": "PRT-40273 FR",
    "matchType": "static_upload",
    "confidence": 100
  },
  'NB150629D-2': {
    "originalCode": "NB150629D-2",
    "cloudinaryFileName": "NB150629D-2",
    "matchType": "static_upload",
    "confidence": 100
  },
  '1803 BLACKOUT': {
    "originalCode": "1803 BLACKOUT",
    "cloudinaryFileName": "1803 BLACKOUT",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TP01623-228': {
    "originalCode": "TP01623-228",
    "cloudinaryFileName": "TP01623-228",
    "matchType": "static_upload",
    "confidence": 100
  },
  'ST-5031F': {
    "originalCode": "ST-5031F",
    "cloudinaryFileName": "ST-5031F",
    "matchType": "static_upload",
    "confidence": 100
  },
  '08-SILVER': {
    "originalCode": "08-SILVER",
    "cloudinaryFileName": "08-SILVER",
    "matchType": "static_upload",
    "confidence": 100
  },
  'HLR-25': {
    "originalCode": "HLR-25",
    "cloudinaryFileName": "HLR-25",
    "matchType": "static_upload",
    "confidence": 100
  },
  '0248243680103': {
    "originalCode": "0248243680103",
    "cloudinaryFileName": "0248243680103",
    "matchType": "static_upload",
    "confidence": 100
  },
  'Dymondmie - Straw': {
    "originalCode": "Dymondmie - Straw",
    "cloudinaryFileName": "Dymondmie - Straw",
    "matchType": "static_upload",
    "confidence": 100
  },
  'MUNNAR SILK-23283': {
    "originalCode": "MUNNAR SILK-23283",
    "cloudinaryFileName": "MUNNAR SILK-23283",
    "matchType": "static_upload",
    "confidence": 100
  },
  'AS22541-5': {
    "originalCode": "AS22541-5",
    "cloudinaryFileName": "AS22541-5",
    "matchType": "static_upload",
    "confidence": 100
  },
  'NB01300103': {
    "originalCode": "NB01300103",
    "cloudinaryFileName": "NB01300103",
    "matchType": "static_upload",
    "confidence": 100
  },
  'TP229': {
    "originalCode": "TP229",
    "cloudinaryFileName": "TP229",
    "matchType": "static_upload",
    "confidence": 100
  },
  'LỤA ÉP HỌA TIẾT': {
    "originalCode": "LỤA ÉP HỌA TIẾT",
    "cloudinaryFileName": "LỤA ÉP HỌA TIẾT",
    "matchType": "static_upload",
    "confidence": 100
  },
  'VR1000-06': {
    "originalCode": "VR1000-06",
    "cloudinaryFileName": "VR1000-06",
    "matchType": "static_upload",
    "confidence": 100
  },
  'DCR-HA 1754-9': {
    "originalCode": "DCR-HA 1754-9",
    "cloudinaryFileName": "DCR-HA 1754-9",
    "matchType": "static_upload",
    "confidence": 100
  },
  '88-539-9': {
    "originalCode": "88-539-9",
    "cloudinaryFileName": "88-539-9",
    "matchType": "static_upload",
    "confidence": 100
  },
  'VLIET-PURE WHITE A': {
    "originalCode": "VLIET-PURE WHITE A",
    "cloudinaryFileName": "VLIET-PURE WHITE A",
    "matchType": "static_upload",
    "confidence": 100
  },
  'YB0822-1': {
    "originalCode": "YB0822-1",
    "cloudinaryFileName": "YB0822-1",
    "matchType": "static_upload",
    "confidence": 100
  },
  'SDWY0035-21-7542-HF-NG': {
    "originalCode": "SDWY0035-21-7542-HF-NG",
    "cloudinaryFileName": "SDWY0035-21-7542-HF-NG",
    "matchType": "static_upload",
    "confidence": 100
  },
  'YB0822-2': {
    "originalCode": "YB0822-2",
    "cloudinaryFileName": "YB0822-2",
    "matchType": "static_upload",
    "confidence": 100
  },
  'BWB-8043': {
    "originalCode": "BWB-8043",
    "cloudinaryFileName": "BWB-8043",
    "matchType": "static_upload",
    "confidence": 100
  },};

// Initialize Cloudinary instance (for future use)
// const cld = new Cloudinary({
//   cloud: {
//     cloudName: CLOUD_NAME
//   }
// })

interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  created_at: string
}

interface UploadOptions {
  fabricCode: string
  folder?: string
  tags?: string[]
  transformation?: string
}

export class CloudinaryService {
  private static instance: CloudinaryService
  
  static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService()
    }
    return CloudinaryService.instance
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isConfigured(): boolean {
    return !!(CLOUD_NAME && API_KEY && UPLOAD_PRESET)
  }

  /**
   * Get configuration status
   */
  getConfig() {
    return {
      cloudName: CLOUD_NAME,
      apiKey: API_KEY ? `${API_KEY.substring(0, 8)}...` : '',
      uploadPreset: UPLOAD_PRESET,
      configured: this.isConfigured()
    }
  }

  /**
   * Upload image to Cloudinary (Unsigned Upload)
   * Ninh ơi, chỉ gửi các tham số được phép với unsigned upload preset
   */
  async uploadImage(file: File, options: UploadOptions): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured. Please check environment variables.')
    }

    const formData = new FormData()

    // Basic upload parameters (ONLY these are allowed for unsigned upload)
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    // DO NOT add any other parameters for unsigned upload:
    // - context, tags, public_id, folder, overwrite are FORBIDDEN
    // The upload preset handles folder and other settings automatically

    console.log(`🚀 Uploading image for fabric ${options.fabricCode} using unsigned preset...`)

    try {
      const startTime = Date.now()

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(30000) // 30 second timeout
        }
      )

      const uploadTime = Date.now() - startTime
      console.log(`⏱️ Upload took ${uploadTime}ms`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`)
      }

      const result: CloudinaryUploadResult = await response.json()

      console.log(`✅ Uploaded image for fabric ${options.fabricCode}:`, {
        publicId: result.public_id,
        url: result.secure_url,
        size: `${result.width}x${result.height}`,
        bytes: result.bytes,
        fabricCode: options.fabricCode
      })

      // Note: With unsigned upload, Cloudinary generates random public_id
      // The fabric code mapping will be handled by the upload preset configuration
      return result
      
    } catch (error) {
      console.error(`❌ Failed to upload image for fabric ${options.fabricCode}:`, error)
      throw error
    }
  }

  /**
   * Get optimized image URL for fabric code
   */
  getFabricImageUrl(fabricCode: string, options?: {
    width?: number
    height?: number
    quality?: number | 'auto'
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  }): string {
    if (!this.isConfigured()) {
      return ''
    }

    try {
      // Check for fabric code corrections first
      let actualFabricCode = fabricCode
      let isRandomId = false
      if (FABRIC_CODE_CORRECTIONS[fabricCode]) {
        const correction = FABRIC_CODE_CORRECTIONS[fabricCode]
        if (correction.confidence && correction.confidence > 60) {
          actualFabricCode = correction.cloudinaryFileName
          isRandomId = true // This is a random ID, not a fabric code
          console.log(`🔄 Using corrected fabric code: ${fabricCode} → ${actualFabricCode}`)
        }
      }

      // Generate URL with proper format and auto-fetch version
      const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`

      // Handle random IDs vs fabric codes differently
      let publicId
      if (isRandomId) {
        // For random IDs, use directly without fabrics/ folder
        publicId = actualFabricCode
        if (!actualFabricCode.includes('.')) {
          publicId += '.jpg'
        }
      } else {
        // For fabric codes, handle both new fabric_images/ and legacy fabrics/ structure
        if (actualFabricCode.startsWith('fabric_images/')) {
          // New structure: fabric_images/ folder
          publicId = actualFabricCode
        } else if (actualFabricCode.startsWith('fabrics/')) {
          // Legacy structure: fabrics/ folder
          publicId = actualFabricCode
          // Fix duplicate fabrics/ folder issue for legacy images
          if (publicId.startsWith('fabrics/fabrics/')) {
            publicId = publicId.replace('fabrics/fabrics/', 'fabrics/')
          }
        } else {
          // Default: add fabric_images/ prefix for new uploads
          publicId = `fabric_images/${actualFabricCode}`
        }
        if (!actualFabricCode.includes('.')) {
          publicId += '.jpg'
        }
      }

      // Basic optimizations only
      const transformations = []

      if (options?.format && options.format !== 'auto') {
        transformations.push(`f_${options.format}`)
      }

      if (options?.quality && options.quality !== 'auto') {
        transformations.push(`q_${options.quality}`)
      }

      if (options?.width) {
        transformations.push(`w_${options.width}`)
      }

      if (options?.height) {
        transformations.push(`h_${options.height}`)
      }

      const transformString = transformations.length > 0 ? transformations.join(',') + '/' : ''

      // Add version for specific files that need it
      let versionString = ''
      if (actualFabricCode === 'fabric_images/3 PASS BO - WHITE - COL 15' ||
          actualFabricCode === 'fabrics/fabrics/3 PASS BO - WHITE - COL 15') {
        versionString = 'v1751648065/'
      }

      // Return URL with proper format
      const finalUrl = `${baseUrl}/${transformString}${versionString}${publicId}`

      // Debug log for specific fabric codes
      if (fabricCode === 'TP01623-0035' || fabricCode === '3 PASS BO - WHITE - COL 15') {
        console.log(`🔍 DEBUG URL generation for ${fabricCode}:`)
        console.log(`   Original: ${fabricCode}`)
        console.log(`   Corrected: ${actualFabricCode}`)
        console.log(`   PublicId: ${publicId}`)
        console.log(`   Version: ${versionString}`)
        console.log(`   Final URL: ${finalUrl}`)
        console.log(`   🆕 Using NEW fabric_images structure`)
      }

      return finalUrl

    } catch (error) {
      console.error(`❌ Failed to generate URL for fabric ${fabricCode}:`, error)
      return ''
    }
  }

  /**
   * Check if image exists for fabric code
   */
  async checkImageExists(fabricCode: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return false
    }

    try {
      const url = this.getFabricImageUrl(fabricCode)
      if (!url) return false

      // For production: assume Cloudinary images exist to avoid CORS/network issues
      // This matches the fix in syncService.checkImageExists()
      if (url.includes('res.cloudinary.com/dgaktc3fb/image/upload/fabrics/')) {
        console.log(`☁️ Cloudinary URL generated: ${url}`)
        console.log(`☁️ Assuming Cloudinary image exists for ${fabricCode}`)
        return true
      }

      const response = await fetch(url, { method: 'HEAD' })
      return response.ok

    } catch (error) {
      console.error(`❌ Failed to check image existence for fabric ${fabricCode}:`, error)
      return false
    }
  }

  /**
   * Batch check which fabric codes have images
   */
  async batchCheckImages(fabricCodes: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    // Check in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < fabricCodes.length; i += batchSize) {
      const batch = fabricCodes.slice(i, i + batchSize)
      
      const promises = batch.map(async (code) => {
        const exists = await this.checkImageExists(code)
        return { code, exists }
      })
      
      const batchResults = await Promise.all(promises)
      batchResults.forEach(({ code, exists }) => {
        results.set(code, exists)
      })
      
      // Small delay between batches
      if (i + batchSize < fabricCodes.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }

  /**
   * Delete image for fabric code
   */
  async deleteImage(fabricCode: string): Promise<boolean> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured')
    }

    // Note: Deletion requires API secret, so this would need server-side implementation
    // For now, we'll just return false to indicate client-side deletion is not supported
    console.warn(`⚠️ Image deletion for ${fabricCode} requires server-side implementation`)
    return false
  }

  /**
   * Get upload widget configuration (Unsigned Upload)
   * Ninh ơi, config này cho Cloudinary Upload Widget với unsigned preset
   */
  getUploadWidgetConfig(fabricCode: string) {
    return {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET, // unsigned preset handles folder/tags automatically
      // Note: publicId, folder, tags, context are handled by the upload preset
      // Don't set them here for unsigned uploads
      maxFileSize: 5000000, // 5MB
      maxImageWidth: 2000,
      maxImageHeight: 2000,
      cropping: false,
      multiple: false,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      sources: ['local', 'camera'],
      showAdvancedOptions: false,
      showInsecurePreview: false,
      showUploadMoreButton: false,
      theme: 'minimal',
      // Add fabric code as metadata for tracking (if supported by preset)
      metadata: {
        fabric_code: fabricCode
      }
    }
  }
}

// Export singleton instance
export const cloudinaryService = CloudinaryService.getInstance()

// Export types
export type { CloudinaryUploadResult, UploadOptions }
