-- SQL Script để import dữ liệu thật từ giavonmoi.xlsx
-- Tạo bởi: import-real-data-simple.py
-- Thời gian: 13/08/2025 10:15:59
-- Tổng số records: 330

-- Xóa tất cả dữ liệu cũ
DELETE FROM fabrics;

-- Reset sequence (nếu cần)
ALTER SEQUENCE fabrics_id_seq RESTART WITH 1;

-- Insert dữ liệu thật

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '3 PASS BO - WHITE - COL 15',
    'Vải 3 PASS BO - WHITE - COL 15 Khổ 280cm',
    'lót',
    45.97,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '33139-2-270',
    'Vải 33139-2-270 Khổ 280cm',
    'fabric',
    45.9,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '71022-10',
    'Vải lá màu trắng W280 cm',
    'fabric',
    29.0,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '71022-7',
    'Vải 71022-7 Khổ 280cm',
    'fabric',
    54.0,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8015-1',
    'Vải 8015-1 Khổ 290cm',
    'fabric',
    12.49,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '99-129-39',
    'Vải 99-129-39 khổ 280cm',
    'fabric',
    85.8,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'A9003-5',
    'Vải A9003-5 Khổ 280cm',
    'fabric',
    45.1,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AS22541-5',
    'AS22541-5 - 100% Polyeste W285cm, color: 5',
    'fabric',
    16.1,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AS22878-7',
    'AS22878-7 - 100% Polyeste, W280cm, color: 7',
    'fabric',
    15.0,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-71022-8',
    'Vải Lá Màu Xanh W280cm',
    'fabric',
    387.0,
    'm',
    'T4 B2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-MELIA-NHẠT',
    'DCR-MELIA NHẠT W280cm',
    'fabric',
    28.0,
    'm',
    'T4.B3.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15141A21',
    'Vải FB15141A21 Khổ 300cm',
    'fabric',
    10.8,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15144A3',
    'Vải chính FB15144A3# khổ 290cm',
    'fabric',
    63.2,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15148A21',
    'Vải FB15148A21 Khổ 300cm',
    'fabric',
    18.4,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15157A1',
    'Vải FB15157A1 Khổ 300cm',
    'fabric',
    18.6,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15169A4',
    'Vải FB15169A4 Khổ 300cm',
    'fabric',
    13.0,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15198A5',
    'Vải FB15198A5 Khổ 300cm',
    'fabric',
    15.4,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15198A6',
    'Vải FB15198A6 Khổ 300cm',
    'fabric',
    76.0,
    'Cuộn',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FS-PURPLE',
    'Vải FS-PURPLE Khổ 280cm',
    'fabric',
    64.5,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FS-Ruby',
    'Vải FS-Ruby Khổ 280cm',
    'fabric',
    58.85,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FS-TEAL',
    'Vải FS-TEAL Khổ 280cm',
    'fabric',
    157.0,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HB/BST/DY',
    'Vải HB/BST/DY Khổ 290cm',
    'fabric',
    12.3,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HY FAGEL-SILVER',
    'Vải HY FAGEL-SILVER Khổ 280cm',
    'fabric',
    45.97,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JK090E-01',
    'Vải JK090E-01 Khổ 280cm',
    'fabric',
    27.0,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JNF/19',
    'Vải JNF/19 Khổ 280cm',
    'fabric',
    16.2,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Lót bông nhăn',
    'Vải Lót bông nhăn Khổ 235cm',
    'fabric',
    38.83,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'N208BOFR',
    'Vải N208BOFR Khổ cm',
    'Roller',
    50.0,
    'm',
    'T4 Palet giữa F-G',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SG21-19-4007',
    'Vải SG21-19-4007 Khổ 280cm',
    'fabric',
    44.0,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'W5601-20',
    'Vải W5601-20 khổ 140cm',
    'fabric',
    7.0,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB0320-7',
    'Vải YB0320-7 Khổ cm',
    'fabric',
    12.0,
    'm',
    'T4 D2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB093',
    'Vải YB093 khổ 230cm',
    'fabric',
    136.0,
    'm',
    'T4 giữa A-B (phía ngoài)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB096',
    'Vải YB096 Khổ 280cm',
    'fabric',
    6.9,
    'm',
    'T4 giữa A-B (phía trong)',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '0248243680103',
    'Vải Panama Pro Of 1% BJ01A white- pearl khổ 250 cm',
    'Roller',
    4.2,
    'm',
    'T4.G2.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '0248243802071-TUISS',
    'BD03A TRAVERTINE FABRIC khổ 310cm',
    'Roller',
    22.0,
    'm',
    'T4.G2.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '07013D-88',
    'Vải chính 07013D-88 khổ 145cm',
    'fabric',
    19.5,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '089C-1',
    '089C-1 W150cm',
    'fabric',
    17.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '09-730-17',
    'Vải chính 09-730-17 khổ 140cm',
    'Vải bọc',
    95.5,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '100054-0081',
    'Vải Roller 100054-0081',
    'Roller',
    12.85,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '10-780-14',
    'Vải chính 10-780-14 khổ 140cm',
    'fabric',
    64.6,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '10-780-1402',
    '10-780-1402 W140cm',
    'fabric',
    165.7,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '10-780-17',
    'Vải chính 10-780-17 khổ 140cm',
    'fabric',
    154.9,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '10-780-316',
    'Vải 10-780-316 W140cm',
    'Vải bọc',
    263.7,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '10-780-41',
    '10-780-41 W140cm',
    'Vải bọc',
    0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '10-780-5',
    '10-780-5 W140cm',
    'fabric',
    20.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '131-254',
    'Vải 131-254 W140cm',
    'fabric',
    13.2,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '142421-DCR',
    'Vải chính 142421-DCR khổ 293cm',
    'fabric',
    8.7,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '1803 BLACKOUT',
    'Vải 1803 BLACKOUT khổ 280cm',
    'fabric',
    57.0,
    'm',
    'T4.A1.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '22A-990-5',
    '22A-990-5 W140cm',
    'fabric',
    47.9,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '22D-990-8',
    '22D-990-8 W140cm',
    'Vải bọc',
    90.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '22E-990-10',
    '22E-990-10 W140cm',
    'fabric',
    15.3,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
-- Đã insert 50/330 records

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '22E-990-2',
    '22E-990-2 W140cm',
    'fabric',
    30.8,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '22E-990-4',
    'Vải Chính 22E-990-4 W140cm',
    'Vải bọc',
    81.2,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '316-2',
    'Vải chính 316-2 khổ 145cm',
    'fabric',
    34.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '3c-40-11',
    'Vải 3c-40-11 W280cm',
    'fabric',
    20.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '50-008 dcr-T203 SB-12',
    'Vải Roller 100050-008 dcr-T203 SB-12 W200cm',
    'Roller',
    23.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '71022-10',
    'Vải lá màu trắng W280 cm',
    'fabric',
    29.0,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '71022-2',
    'Vải chính 71022-2 khổ 280cm',
    'fabric',
    29.5,
    'm',
    'T4 D2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '71022-9',
    'Vải lá màu kem W280 cm',
    'fabric',
    52.3,
    'm',
    'T4 B2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8136-2',
    'Vải 8136-2 W280cm',
    'fabric',
    20.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83082-11',
    'Vải chính 83082-11 khổ 145cm',
    'fabric',
    110.6,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83082-32',
    'Vải 83082-32 khổ 145cm',
    'fabric',
    41.5,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83086-06',
    '83086-06 W145cm',
    'fabric',
    37.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83086-08',
    'Vải 83086-08 khổ 145cm',
    'fabric',
    14.5,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83086-11',
    '83086-11 W145cm',
    'fabric',
    29.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83086-13',
    'Vải 83086-13 W145cm',
    'fabric',
    93.8,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83086-20',
    'Vải chính 83086-20 khổ 145cm',
    'fabric',
    35.5,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83100-13',
    'Vải chính 83100-13 khổ 145cm',
    'fabric',
    27.5,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83102-19',
    'Vải Chính 83102-19 W140cm',
    'Vải bọc',
    85.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '83813-7',
    '83813-7 W140cm',
    'fabric',
    14.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8525-26',
    '8525-26 W140cm',
    'fabric',
    15.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8525-42',
    'Vải chính 8525-42 khổ 145cm',
    'Vải bọc',
    23.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8525-43',
    'Vải 8525-43 khổ 145cm',
    'fabric',
    0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8525-46',
    '8525-46 W140cm',
    'fabric',
    13.3,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8542-11',
    '8542-11 W140cm',
    'fabric',
    11.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8557-06',
    'Vải chính 8557-06 khổ 145cm',
    'fabric',
    36.5,
    'm',
    'T4.K2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8568-05',
    'Vải Chính 8568-05 W140cm',
    'fabric',
    37.8,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8598-02',
    'Vải 8598-02 W140cm',
    'fabric',
    28.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8600-06',
    'Vải Roller 8600-06 W140cm',
    'fabric',
    17.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8600-07',
    'Vải Chính 8600-07 W140cm',
    'fabric',
    26.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8611-44',
    '8611-44 W140cm',
    'fabric',
    22.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8611-46',
    'Vải 8611-46 W140cm',
    'fabric',
    40.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8612-25',
    'Vải 8612-25 W140cm',
    'fabric',
    14.3,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8613-04',
    'Vải chính 8613-04 khổ 145cm',
    'fabric',
    40.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8613-13',
    'Vải 8613-13 khổ 145cm',
    'fabric',
    25.8,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8614-09',
    'Vải chính 8614-09 khổ 145cm',
    'fabric',
    9.5,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8615-14',
    '8615-14 W140cm',
    'fabric',
    16.5,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8628-17',
    '8628-17 W140cm',
    'fabric',
    19.5,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '8631-05',
    'Vải chính 8631-05 khổ 145cm',
    'Vải bọc',
    64.5,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '88-539-10',
    '88-539-10',
    'fabric',
    0,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '88-539-12',
    'Vải chính 88-539-12 khổ 280cm',
    'fabric',
    70.8,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '88-539-21',
    'Vải chính 88-539-21 khổ 280cm',
    'fabric',
    72.3,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '88-539-23',
    '88-539-23 W280cm',
    'fabric',
    95.5,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '88-539-9',
    '88-539-9 W280cm',
    'fabric',
    0,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '91200201S0103',
    '91200201S0103 W300cm',
    'Roller',
    10.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '99-129-11',
    '99-129-11 W280cm',
    'fabric',
    16.0,
    'm',
    'T4 B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '99-129-44',
    '99-129-44 W280cm',
    'fabric',
    41.0,
    'm',
    'T4 D1 + E1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'A6120A195',
    'A6 BON SOIR FABRIC, 150ft per carton, 3m width',
    'Roller',
    10.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'A65-2',
    'Vải Voan  A65-2 W280cm',
    'fabric',
    94.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AL200-21',
    'Vải Chính AL200-21 W140cm',
    'Vải bọc',
    34.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AL200-30',
    'AL200-30 W280cm',
    'Vải bọc',
    30.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
-- Đã insert 100/330 records

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Ar070-02B',
    'Vải Ar070-02B W140cm',
    'fabric',
    11.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AR-071-02B',
    'VẢI HÌNH CÁ HEO NÂU W140cm',
    'fabric',
    9.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AR074-02B',
    'AR074-02B W140cm',
    'fabric',
    18.5,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AR-076-02B',
    'Vải chính AR-076-02B khổ 150cm',
    'fabric',
    47.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AR-079-02B',
    'Vải chính AR-079-02B khổ 150cm',
    'fabric',
    18.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ASPERO 19',
    'Vải chính ASPERO 19 khổ 141cm',
    'fabric',
    18.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BD095-298',
    'Vải chính BD095-298 khổ 145cm',
    'fabric',
    17.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BD095-85',
    'Vải chính BD095-85 khổ 145cm',
    'fabric',
    163.0,
    'm',
    'T4.K2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BERTONE-30',
    'Vải chính BERTONE-30 khổ 295cm',
    'fabric',
    81.5,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BERTONE-31',
    'Vải chính BERTONE-31 khổ 295cm',
    'fabric',
    60.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BJ01A',
    'BJ01A W310cm',
    'Roller',
    77.0,
    'm2',
    'T4.G2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Bloom R/B Amellie',
    'Vải Roller Bloom R/B Amellie',
    'Roller',
    18.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BO300102',
    'Vải Coated Fabric Linen 300cm',
    'Roller',
    45.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Bonaza mufin-28',
    'Vải Bonaza mufin-28 W140cm',
    'Vải bọc',
    83.5,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BWB8136-4',
    'Vải chính BWB8136-4 W280cm',
    'fabric',
    110.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BWB-8539',
    'Vải Voan BWB-8539 (Chiffon Cream) khổ 295cm',
    'voan',
    0,
    'm',
    'T4 D2 + T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'carnival  r/b purple',
    'Vải Roller dcr-carnival  r/b purple-Kg W200cm',
    'Roller',
    10.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'CARNIVAL R/B HESSIAN 210',
    'Vải Roller CARNIVAL R/B HESSIAN 210 W200cm',
    'Roller',
    10.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'carnival r/b hot pink 210',
    'Vải Roller dcr- carnival r/b hot pink 210 W200cm',
    'Roller',
    30.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Carnival r/b mauve 210',
    'Vải Roller Dcr Carnival r/b mauve 210 W200cm',
    'Roller',
    10.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'CARNIVAL R/B MULBERRY 210',
    'Vải Roller DCR CARNIVAL R/B MULBERRY W200cm',
    'Roller',
    33.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'carnival r/b slate 210',
    'Vải Roller dcr- carnival r/b slate 210 W200cm',
    'Roller',
    13.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'CARNIVAL R/B TEAL 210',
    'Vải Roller CARNIVAL R/B TEAL 210 W200cm',
    'Roller',
    11.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'CRUSHED VELVET-15',
    'Vải chính CRUSHED VELVET-15 khổ 280cm',
    'fabric',
    27.0,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'D-3195',
    'Vải chính D-3195 khổ 150cm',
    'fabric',
    7.5,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'D3385',
    'Vải chính D3385 khổ 145cm',
    'fabric',
    11.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Datender 24sil',
    'Datender 24sil W140cm',
    'fabric',
    21.8,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DBY80434-3',
    'Vải DBY80434-3 W140cm',
    'fabric',
    8.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DBY80434-51',
    'Vải DBY80434-51 W140cm',
    'fabric',
    18.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCLR -EC-4022',
    'Vải Roller DCLR -EC-4022 W200cm',
    'Roller',
    9.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR - chats word white',
    'Vải Roller DCR - chats word white W200cm',
    'Roller',
    26.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'dcr- chats word cream',
    'Vải Roller dcr- chats word cream W200cm',
    'Roller',
    53.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR HL-814F',
    'Vải Roller DCR HL-814F W200cm',
    'Roller',
    7.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Dcr -Lauva r/b walnut',
    'Vải Roller Dcr -Lauva r/b walnut W200cm',
    'Roller',
    8.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'dcr- nouveaux r/b teal',
    'Vải Roller dcr- nouveaux r/b teal W200cm',
    'Roller',
    26.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-1000-2300-9000',
    'Vải Roller DCR-1000-2300-9000 W200cm',
    'Roller',
    19.5,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-1000-2300-9124',
    'DCR-1000-2300-9124 W200cm',
    'Roller',
    6.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-1000-2300-9162',
    'Vải Roller DCR-1000-2300-9162 W200cm',
    'Roller',
    15.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-1000-2300-9163',
    'Vải Roller DCR-1000-2300-9163 W200cm',
    'Roller',
    16.8,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR20018',
    'Vải Roller DCR20018 W200cm',
    'Roller',
    22.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-71022-8',
    'Vải Lá Màu Xanh W280cm',
    'fabric',
    0,
    'm',
    'T4 B2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-BRERA-33',
    'Vải chính  DCR-BRERA-33 khổ 140cm',
    'fabric',
    45.8,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Dcr-carnival R/B mocha',
    'Vải Roller Dcr-carnival R/B mocha W200cm',
    'Roller',
    10.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-EC-4037F',
    'Vải Roller DCR-EC-4037F W200cm',
    'Roller',
    6.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-ES-48',
    'Vải Roller DCR-ES-48 W200cm',
    'Roller',
    5.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-HA 1754-16',
    'Vải chính DCR-HA 1754-16 khổ 145cm',
    'fabric',
    53.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-HA 1754-7 BLACKCURRAN',
    'Vải chính DCR-HA 1754-7 BLACKCURRANT W 145cm',
    'fabric',
    28.5,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-HA 1754-9',
    'Vải chính DCR-HA 1754-9 khổ 145cm',
    'fabric',
    65.0,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-MELIA-COFFEE',
    'DCR-MELIA-COFFEE W280cm',
    'fabric',
    1366.37,
    'm',
    'T4.B3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-MELIA-NHẠT',
    'DCR-MELIA NHẠT W280cm',
    'fabric',
    28.0,
    'm',
    'T4.B3.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
-- Đã insert 150/330 records

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-N2087-Bo w280cm',
    'Vải DCR-N2087-Bo w280cm',
    'Roller',
    570.0,
    'm',
    'T4.G1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-OZONE-16',
    'DCR-OZONE-16 W280cm',
    'fabric',
    75.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1113',
    'Vải Roller DCR-RP1113 W200cm',
    'Roller',
    17.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1120',
    'Vải Roller DCR-RP1120 W200cm',
    'Roller',
    30.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1145',
    'Vải Roller DCR  - R1145 W200cm',
    'Roller',
    20.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1148',
    'Vải Roller DCR-RP1148 W200cm',
    'Roller',
    15.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1151',
    'Vải Roller DCR-RP1151 W200cm',
    'Roller',
    10.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1153',
    'Vải Roller DCR-RP1153 W200cm',
    'Roller',
    20.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1163',
    'Vải Roller DCR-RP1163 W200cm',
    'Roller',
    11.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP1193',
    'Vải Roller DCR-RP1193 W200cm',
    'Roller',
    18.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP2000',
    'Vải Roller DCR-RP2000 W200cm',
    'Roller',
    25.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP2007',
    'Vải Roller DCR-RP2007 W200cm',
    'Roller',
    8.6,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP2010',
    'Vải Roller DCR-RP2010 W200cm',
    'Roller',
    25.25,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP2328',
    'Vải DCR-RP2328 W200cm',
    'Roller',
    15.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP2365',
    'Vải Roller DCR-RP2365 W200cm',
    'Roller',
    15.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-RP770',
    'Vải Roller DCR-RP770 W200cm',
    'Roller',
    17.9,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'dcr-snong bird beyl',
    'Vải Roller dcr-snong bird beyl-Kg W200cm',
    'Roller',
    7.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-ST6026',
    'Vải Roller DCR-ST6026 W200cm',
    'Roller',
    17.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DH25-A4-120',
    'Vải chính  DH25-A4-120 khổ 145cm',
    'fabric',
    9.9,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DH25-B2-120',
    'Vải chính  DH25-B2-120 khổ 145cm',
    'fabric',
    20.9,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Dusk Slate - 3M',
    'Vải 4915161-Dcr - Dusk Slate - W300cm',
    'Roller',
    0,
    'm2',
    'T4 D3+E3 + T4 dưới sàn',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EB 36360688T',
    'Vải Roller EB 36360688T W200cm',
    'Roller',
    14.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EB48410186',
    'EB48410486 W300cm',
    'Roller',
    186.0,
    'm2',
    'T4.G1.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EB5448 ALA PASTER',
    'Vải mành EB5448 ALA PASTER khổ 250',
    'Roller',
    65.1,
    'm2',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF214-04',
    'EF214-04 W140cm',
    'fabric',
    127.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF216-05',
    'EF216-05 W140cm',
    'fabric',
    75.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF218-02',
    'Vải Chính EF218-02 W140cm',
    'Vải bọc',
    48.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF218-5',
    'EF218-5 W140cm',
    'fabric',
    63.95,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF51150133-dcr',
    'Vải EB51150133 white/mushroom - 2.5M',
    'Roller',
    192.0,
    'm2',
    'T4.G1.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF-BOD7543-TUISS',
    'EF-BOD7543-TUISS W300cm',
    'Silhouette',
    84.0,
    'm2',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EF-BON7531-TUISS',
    'EF-BON7531-TUISS W300cm',
    'Silhouette',
    134.4,
    'm2',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ELITEX EB5115 WHITE/MUSHR',
    'ELITEX EB5115 WHITE/MUSHROOM khổ 300cm',
    'Roller',
    521.0,
    'm2',
    'T4.G1.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ET66470183',
    'Vải Elitex - ET66470183 Pale Grey - khổ 250',
    'Roller',
    138.5,
    'm2',
    'T4.G1.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'F00614-20',
    'Vải F00614-20 khổ 140cm',
    'fabric',
    10.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'F02-Front-28022023',
    'Vải B Fabric Sample With FR (F02-Front-28022023) Thổ khổ 280cm',
    'fabric',
    747.0,
    'm',
    'T4.A3.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'F13-NB03300105',
    'Vải F13-NB03300105 W300cm',
    'Roller',
    30.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'F14-DUSK MARTINI',
    'F14-DUSK MARTINI (MARIAH) - TUISS khổ 300cm',
    'Roller',
    270.0,
    'm2',
    'T4.G2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15092A8',
    'Vải FB15092A8 khổ 290cm',
    'fabric',
    10.0,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15144A3',
    'Vải chính FB15144A3# khổ 290cm',
    'fabric',
    97.97,
    'm',
    'T4.A3.1 và T4F2 + giữa kệ A và B',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15151A2',
    'FB15151A2# FR-NFPA - vải mềm khổ 290cm',
    'fabric',
    35.0,
    'm',
    'T4 D2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15168A4',
    'Vải chính FB15168A4 khổ 290cm',
    'fabric',
    17.4,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB17118A7-4',
    'Vải chính FB17118A7-4 khổ 280cm',
    'fabric',
    413.4,
    'm',
    'T4.A1.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB17118A-BWB-28',
    'Vải chính FB17118A-BWB-28 khổ 280cm',
    'fabric',
    13.0,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB17118A-BWB-30',
    'Vải chính FB17118A-BWB-30 khổ 280cm',
    'fabric',
    10.7,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB17141A-1',
    'Vải chính FB17141A-1 khổ 280cm',
    'fabric',
    8.2,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB17195A-3',
    'Vải chính FB17195A-3 khổ 280cm',
    'fabric',
    22.4,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FS-GUNMETAL',
    'Vải chính FS-GUNMETAL khổ 280cm',
    'fabric',
    31.0,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FWP12157-16',
    'Vải chính  FWP12157-16 khổ 280cm',
    'fabric',
    70.2,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'G8002-01',
    'Vải G8002-01 Thổ khổ 140cm',
    'fabric',
    12.0,
    'm',
    'T4.A3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'H01',
    'Vải chính H-01 khổ 280cm',
    'Vải bọc',
    75.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
-- Đã insert 200/330 records

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HA 1754-10',
    'Vải chính HA 1754-10 khổ 145cm',
    'fabric',
    60.5,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HA 1754-11',
    'HA 1754-11 khổ 145cm',
    'fabric',
    335.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HA 1754-4',
    'Vải chính HA 1754-4 khổ 145cm',
    'fabric',
    120.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HA1754-0701D-28',
    'Vải Chính HA1754-0701D-28 khổ 145cm',
    'fabric',
    45.7,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HBM BLACKOUT HUESO',
    'Vải HBM BLACKOUT HUESO khổ 280cm',
    'fabric',
    37.0,
    'm',
    'T4 B2.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HENILY R/B RUN BN',
    'Vải Roller DCR-HENILY R/B RUN BN  RAI SIN W 200cm',
    'Roller',
    17.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HLR-17',
    'Vải chính HLR-17 khổ 140cm',
    'Vải bọc',
    9.5,
    'm',
    'T4 F2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HLR-25',
    'Vải chính HLR-25 khổ 140cm',
    'fabric',
    8.6,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HLR-5',
    'Vải chính HLR-5 khổ 140cm',
    'fabric',
    9.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HOLIWOD-04',
    'Vải HOLIWOD-04 khổ 280cm',
    'fabric',
    9.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HTK 20189-11',
    'Vải HTK 20189-11 khổ 280cm',
    'fabric',
    570.0,
    'm',
    'T4.A2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HTK-20125',
    'Vải chính HTK-20125 khổ 280cm',
    'fabric',
    13.0,
    'm',
    'T4 Thùng đất 5',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'IBI-2',
    'Vải chính IBI-2 khổ 280cm',
    'fabric',
    7.2,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ICON WAR WICK - COLOR',
    'Vải ICON WAR WICK - COLOR - AQUA khổ 300cm',
    'fabric',
    0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ICT-01',
    'ICT-01 khổ 140cm',
    'fabric',
    18.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ICT-02',
    'ICT-02 khổ 140cm',
    'fabric',
    10.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JBL54452-39',
    'Vải JBL54452-39 khổ 140cm',
    'fabric',
    20.1,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JBL54452-53',
    'Vải TBL54452-53 khổ 140cm',
    'fabric',
    8.7,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'LIBERTY-05',
    'LIBERTY-05 khổ 140cm',
    'fabric',
    6.8,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'LỤA ÉP HỌA TIẾT',
    'Vải lụa ép họa tiết (8600-07) khổ 280cm',
    'fabric',
    7.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'M-149',
    'M-149 khổ 140cm',
    'fabric',
    40.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'M61',
    'M61 khổ 140cm',
    'fabric',
    30.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'm907-12',
    'Vải m907-12 khổ 140cm',
    'fabric',
    53.0,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'M907-9',
    'M907-9 khổ 140cm',
    'fabric',
    19.0,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'M908-26',
    'Vải chính M908-26 khổ 145cm',
    'fabric',
    32.4,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'madrid canaval 210',
    'Vải Roller DCR-madrid spc R/B canaval 210 W 200cm',
    'Roller',
    38.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'MARINO-43',
    'Vải chính MARINO-43 khổ 142cm',
    'fabric',
    9.7,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'MJ304-03',
    'MJ304-03 W 140cm',
    'fabric',
    100.5,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'MJ428-06',
    'MJ428-06 W 200cm',
    'fabric',
    102.8,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'MJ428-14',
    'MJ428-14 W 200cm',
    'fabric',
    129.9,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'moir',
    'Vải MOIR W 140cm',
    'fabric',
    0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'MUNNAR SILK-23283',
    'Vải chính MUNNAR SILK-23283 khổ 300cm',
    'fabric',
    10.9,
    'm',
    'T4.A3.1 tấm lẻ 7,7+3,2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'NB01300103',
    'Vải Roller NB01300103 khổ 300cm',
    'Roller',
    136.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'NB150629D-2',
    'Vải Chính NB150629D-2 W 140cm',
    'fabric',
    37.5,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'PRJ-EB4834',
    'Vải Roller PRJ-EB4834 linen 10% opening W 200cm',
    'Roller',
    52.5,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'PRJ-HATCH CHENILLE - D',
    'Vải chính PRJ-HATCH CHENILLE - D khổ 145cm',
    'fabric',
    45.5,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'PRJ-honey Bo',
    'Vải Roller PRJ-honey Bo W 280cm',
    'fabric',
    13.0,
    'kg',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'PRJ-OXC B008-DCR',
    'PRJ-OXC B008-DCR khổ 280cm',
    'Roller',
    5.0,
    'm',
    'T4 Palet G-F',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'PRT-40273 FR',
    'PRT-40273 FR W 280cm',
    'Roller',
    25.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'R700-05',
    'R700-05 W 140cm',
    'Vải bọc',
    20.0,
    'm',
    'T4 F2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'R700-1',
    'R700-1 W 140cm',
    'fabric',
    59.1,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'R700-15',
    'R700-15 W 140cm',
    'fabric',
    32.4,
    'm',
    'T4.K3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'R700-19',
    'Vải R700-19 W 140cm',
    'fabric',
    22.5,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Satin Apex SA 9196 Chintz',
    'Vải chính Satin Apex SA 9196 Chintz Vũ Huỳnh W 140cm',
    'fabric',
    24.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SDWY0035-21-7542-HF-NG',
    'SDWY0035-21-7542-HF-NG W 280cm',
    'fabric',
    0,
    'm',
    'T4 B2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SG21-YH56-1',
    'Vải SG Màu kem W280',
    'fabric',
    31.0,
    'm',
    'T4 B2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ST 5049 CjNcc',
    'Vải Roller ST 5049 CjNcc W 280cm',
    'Roller',
    120.0,
    'm',
    'T4 Palet G-F',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ST-5031F',
    'Vải Roller ST-5031F W 200cm',
    'Roller',
    8.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'ST5082',
    'Vải Roller ST5082 W 200cm',
    'Roller',
    15.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'T201',
    'Vải Roller T201 W 200cm',
    'Roller',
    8.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
-- Đã insert 250/330 records

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TF13590-002',
    'Vải Chính TF13590-002 W 140cm',
    'fabric',
    65.0,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TF13590-4',
    'TF13590-4 W 140cm',
    'fabric',
    38.98,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TF13950-006',
    'Vải TF13950-006 khổ 140cm',
    'fabric',
    102.8,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TM17-37',
    'Vải chính TM17-37 thượng mỹ khổ 280cm',
    'fabric',
    40.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-00229',
    'TP01623-229 W 140cm',
    'Vải bọc',
    46.0,
    'm',
    'T4 F1,2+ T2E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-0035',
    'Vải TP01623-35 W 140cm',
    'fabric',
    81.03,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-219',
    'Vải chính TP01623-219 khổ 140cm',
    'Vải bọc',
    10.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-222',
    'Vải chính TP01623-222 khổ 140cm',
    'fabric',
    10.0,
    'm',
    'T4 F3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-224',
    'Vải chính TP01623-224 khổ 140cm',
    'Vải bọc',
    12.5,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-228',
    'Vải chính TP01623-228 khổ 140cm',
    'Vải bọc',
    5.9,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-6010',
    'Vải TP01623-6010 W 140cm',
    'fabric',
    54.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP13590-003',
    'Vải TP13590-003 W 140cm',
    'fabric',
    92.0,
    'm',
    'T4.H2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP229',
    'Vải Chính TP229 W 140cm',
    'Vải bọc',
    17.0,
    'm',
    'T4 F2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'UN 1371',
    'Vải Mành Roller EUROSCREEN W 280cm',
    'fabric',
    5.5,
    'm',
    'T4.G2.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'V01',
    'Vải V01 W 280cm',
    'fabric',
    25.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'vải nhung màu be',
    'Vải vải nhung màu be W 140cm',
    'Vải bọc',
    10.0,
    'm',
    'T4 F1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Vải nhung màu xanh',
    'Vải Vải nhung màu xanh W 140cm',
    'fabric',
    7.8,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VELVET NAMPA 282-4101',
    'Vải VELVET NAMPA 282- 4101  khổ 140cm',
    'fabric',
    33.0,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VELVET NAMPA 284-54247',
    'Vải VELVET NAMPA 284- 54247  khổ 140cm',
    'fabric',
    36.6,
    'm',
    'T4 G3.1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VN 10808',
    'Vải chính VN 10808 khổ 145cm',
    'fabric',
    10.8,
    'm',
    'T4.H1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VOAN HỒNG',
    'VẢI VOAN HỒNG W 280cm',
    'fabric',
    40.0,
    'm',
    'T4 E2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Voile R/B Cream',
    'Vải Roller Voile R/B Cream W 200cm',
    'Roller',
    55.0,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Voile R/B White',
    'Vải Roller Voile R/B White W 200cm',
    'Roller',
    40.5,
    'm',
    'T4 D3+E3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VR1000-06',
    'Vải chính MP637 145 NJ VR1000-06 khổ 145cm',
    'Vải bọc',
    39.8,
    'm',
    'T4 F2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'w5601-6',
    'Vải w5601-6 khổ 140cm',
    'fabric',
    72.0,
    'm',
    'T4.K2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'W5601-9',
    'Vải mành W5601-9 W 140cm',
    'fabric',
    123.5,
    'm',
    'T4.K2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB0822-1',
    'Vải màu xanh - Duckegg ( 300 ) W 280cm',
    'fabric',
    49.8,
    'm',
    'T4 B2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB180904-9',
    'YB180904-9- bán trong nước W 280cm',
    'fabric',
    126.0,
    'm',
    'T4 D1 + E1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YBJS0617',
    'Vải chính YBJS0617 khổ 280cm',
    'fabric',
    109.0,
    'm',
    'T4.K1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YY2156-10',
    'Vải chính YY2156-10 khổ 280cm',
    'fabric',
    33.0,
    'm',
    'T4.K1',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YY2156-12',
    'Vải chính YY2156-12 khổ 280cm',
    'fabric',
    10.0,
    'm',
    'T4.A2.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FS FLAX-NG',
    'Vải FS FLAX-NG W280',
    'Roller',
    46.0,
    'm',
    'Pallet tầng 2',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCT-BO-TB01-NG',
    'Vải TREEBARK BO ROLLER BLIND FABRIC W 280 CM',
    'Roller',
    33.0,
    'm',
    'Pallet tầng 2',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VL-BF45(H)-NG',
    'VẢI VALENTINE FRESH BLACKOUT W250 ( SN-BF45)',
    'Suntrip',
    80.0,
    'm',
    'Pallet tầng 2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HARMONY-OXC B003-NG',
    'VẢI HARMONY-003 BLACKOUT-NG W280',
    'Roller',
    38.0,
    'm',
    'Pallet tầng 2',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'D2070-008-NG',
    'VẢI D2070-008-NG LỖI PHAI MÀU W280',
    'Roller',
    405.0,
    'm',
    'Pallet tầng 2',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'D2082-001-NG',
    'D2082-001 LÕI VÕNG NẶNG W280',
    'Roller',
    300.0,
    'm',
    'Pallet tầng 2',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'NN-12-DK',
    'VẢI SUNSTRIP MÀU TRẮNG W280 (ICE WHITE B2G)',
    'Suntrip',
    180.0,
    'm',
    'Pallet tầng 2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HQ-1',
    'Vải HQ-1 khổ 280cm',
    'fabric',
    25.9,
    'm',
    'Pallet giữa kệ A và B Tầng 4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB14005-3',
    'Vải YB14005-3 Khổ 300cm',
    'fabric',
    29.5,
    'm',
    'Pallet giữa kệ A và B Tầng 4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCR-L4001-12122',
    'Vải voan DCR-L4001-12122 khổ 300cm',
    'voan',
    57.3,
    'm',
    'Pallet giữa kệ A và B Tầng 4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VLIET-PURE WHITE A',
    'Vải voan VLIET-PURE WHITE A khổ 280cm',
    'voan',
    18.0,
    'm',
    'Pallet giữa kệ A và B Tầng 4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BWB-8036-1',
    'Vải BWB-8036-1 Khổ 280cm',
    'fabric',
    9.9,
    'm',
    'T4B1.2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'A5583-2',
    'Vải voan A5583-2  Khổ 280cm',
    'voan',
    62.0,
    'm',
    'T4F3+T2G2',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    '31405014',
    'AS22803-12 - 6% linen, 94% Polyeste W288cm, color: 12',
    'fabric',
    92.0,
    'm',
    'T4C3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'YB0822-2',
    'Vải YB0822-2 khổ 280cm',
    'fabric',
    65.0,
    'm',
    'T4B2.2 Nhập thêm vào kho',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'TP01623-140',
    'Vải TP01623-140 khổ 140cm',
    'fabric',
    29.2,
    'm',
    'T4F1 nhập thêm vào kho',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'Dymondmie - Straw',
    'Vải Dymondmie - Straw khổ 140cm',
    'fabric',
    50.0,
    'm',
    'T4F2 Nhập thêm vào kho',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JNF-173-17104120',
    'Vải JNF-173-17104120 khổ 280cm',
    'fabric',
    30.0,
    'm',
    'T4C3 Nhập thêm vào kho',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'BWB-8043',
    'Vải màu hồng họa tiết khổ 280 cm',
    'fabric',
    57.38,
    'm',
    'Tầng 4 giữa kệ A và B',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
-- Đã insert 300/330 records

INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCT-BO-LT-06',
    'Vải Roller khổ 280cm',
    'Roller',
    30.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DL202143311',
    'Vải suntrip khổ 280cm',
    'Suntrip',
    30.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SG21-19-4007',
    'Vải  SG21-19-4007 khổ 280cm',
    'fabric',
    68.0,
    'm',
    'T4C3',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EB16306D5',
    'Vải  EB16306D5 khổ 280cm',
    'fabric',
    50.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SG màu đen',
    'Vải SG màu đen khổ 280cm',
    'fabric',
    12.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SG21-14-C434',
    'Vải SG21-14-C434 khổ 280cm',
    'fabric',
    20.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AS22878-6',
    'Vải AS22878-6 khổ 280cm',
    'fabric',
    40.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15151A3',
    'Vải FB15151A3 khổ 280cm',
    'fabric',
    20.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'W5601-24',
    'Vải W5601-24 khổ 280cm',
    'fabric',
    34.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'FB15090A-21',
    'Vải FB15090A-21 khổ 280cm',
    'fabric',
    15.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JNF-15-new',
    'Vải JNF-15-new khổ 280cm',
    'fabric',
    24.5,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'AS228388-3',
    'Vải AS228388-3 khổ 280cm',
    'fabric',
    25.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HA1449-W',
    'Vải HA1449-W khổ 280cm',
    'fabric',
    39.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'JNF161',
    'Vải JNF161 khổ 280cm',
    'fabric',
    35.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'THCO-14',
    'Vải THCO-14 khổ 280cm',
    'fabric',
    20.0,
    'm',
    'T4C4',
    'available',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCT-BO-TB07',
    'Vải DCT-BO-TB07 khổ 280cm',
    'Roller',
    0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DLWG202136055',
    'Vải DLWG202136055 khổ 280cm',
    'Roller',
    5.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DUSK XTRA VIVID',
    'Vải DUSK XTRA VIVID khổ 300cm',
    'Roller',
    40.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'EB48500186 WINSPRAY GREY',
    'Vải EB48500186 WINSPRAY GREY khổ 300cm',
    'Roller',
    15.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HARMONY-OXC B003-NG (TRẮNG)',
    'Vải HARMONY-OXC B003-NG (TRẮNG) khổ 280cm',
    'Roller',
    10.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HARMONY-OXC B014',
    'Vải HARMONY-OXC B014 khổ 280cm',
    'Roller',
    0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HARMONY-OXC B12-NG',
    'Vải HARMONY-OXC B12-NG khổ 280cm',
    'Roller',
    22.2,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VL-BFAT 45',
    'Vải VL-BFAT 45 khổ 280cm',
    'Suntrip',
    40.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VL-BFAT12 (H)',
    'Vải VL-BFAT12 (H) khổ 280cm',
    'Suntrip',
    18.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VL-BFAT96',
    'Vải VL-BFAT96 khổ 280cm',
    'Suntrip',
    35.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'Vải tồn VQ, ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'VL-FQAT42 (H)',
    'Vải VL-FQAT42 (H) khổ 280cm',
    'Suntrip',
    30.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'DCT-BO-ZH',
    'Vải DCT-BO-ZH khổ 280cm',
    'Roller',
    0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HARMONY-OXC B010',
    'Vải HARMONY-OXC B010 khổ 280cm',
    'Roller',
    40.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'SC-UDPL 15 FR',
    'Vải SC-UDPL 15 FR khổ 240cm',
    'Roller',
    30.0,
    'm',
    'T4 dưới sàn',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    'ko có giá',
    NOW(),
    NOW()
);
INSERT INTO fabrics (
    code, name, type, quantity, unit, location, status, 
    image, price, price_note, is_hidden, note,
    created_at, updated_at
) VALUES (
    'HA 1754- Italy-5',
    'Vải chính HA 1754-10 khổ 145cm',
    'fabric',
    30.0,
    'm',
    'T4F1',
    'damaged',
    '',  -- image sẽ được cập nhật sau
    NULL,  -- price
    NULL,  -- price_note
    false,  -- is_hidden
    '',
    NOW(),
    NOW()
);

-- Kiểm tra kết quả
SELECT COUNT(*) as total_records FROM fabrics;
SELECT code, name, quantity, location FROM fabrics LIMIT 10;

-- Thống kê theo trạng thái
SELECT status, COUNT(*) as count FROM fabrics GROUP BY status;

-- Thống kê theo vị trí
SELECT location, COUNT(*) as count FROM fabrics GROUP BY location ORDER BY count DESC LIMIT 10;

-- Hoàn tất import 330 sản phẩm thật từ giavonmoi.xlsx
