# 👁️ Fabric Visibility Management Scripts

Scripts để quản lý việc ẩn/hiện sản phẩm vải trong hệ thống.

## 📋 Scripts Available

### 1. `hide_specific_fabrics.py`
**Mục đích:** Ẩn danh sách các sản phẩm vải cụ thể theo mã vải

**Chức năng:**
- ✅ Ẩn 169 sản phẩm vải theo danh sách mã đã định sẵn
- ✅ Direct database update qua Supabase API
- ✅ Tạo backup file tự động để rollback
- ✅ Validation và error handling
- ✅ Real-time statistics và progress tracking

**Usage:**
```bash
cd /path/to/khovaiton
python scripts/hide_specific_fabrics.py
```

**Output:**
- Backup file: `backup_hide_fabrics_YYYYMMDD_HHMMSS.json`
- Console log với detailed progress
- Statistics before/after operation

### 2. `rollback_hide_fabrics.py`
**Mục đích:** Rollback operation - unhide các sản phẩm đã ẩn

**Chức năng:**
- ✅ Restore từ backup file
- ✅ Auto-detect latest backup nếu không specify
- ✅ Verification trước khi rollback
- ✅ Tạo rollback record để track

**Usage:**
```bash
# Sử dụng latest backup
python scripts/rollback_hide_fabrics.py

# Sử dụng backup file cụ thể
python scripts/rollback_hide_fabrics.py backup_hide_fabrics_20250114_150000.json
```

**Output:**
- Rollback record: `rollback_hide_fabrics_YYYYMMDD_HHMMSS.json`
- Console log với detailed progress

### 3. `verify_fabric_visibility.py`
**Mục đích:** Verification và monitoring visibility status

**Chức năng:**
- ✅ Overall statistics (total, visible, hidden)
- ✅ Sample fabric code checking
- ✅ Recent updates tracking
- ✅ Health check cho visibility system

**Usage:**
```bash
python scripts/verify_fabric_visibility.py
```

## 🎯 Workflow Example

### Hide Fabrics:
```bash
# 1. Verify current state
python scripts/verify_fabric_visibility.py

# 2. Hide specific fabrics
python scripts/hide_specific_fabrics.py

# 3. Verify changes
python scripts/verify_fabric_visibility.py
```

### Rollback if needed:
```bash
# 1. Rollback using latest backup
python scripts/rollback_hide_fabrics.py

# 2. Verify rollback
python scripts/verify_fabric_visibility.py
```

## 📊 Expected Results

### After Hide Operation:
- **Marketing Mode (localhost:3005/marketing):** 169 sản phẩm sẽ KHÔNG hiển thị
- **Sale Mode (localhost:3005):** 
  - Default view: 169 sản phẩm không hiển thị
  - "Chỉ xem SP ẩn" filter: Có thể xem 169 sản phẩm đã ẩn
- **Statistics:** Counter "Đã ẩn" tăng +169

### After Rollback:
- Tất cả sản phẩm trở lại trạng thái visible
- Statistics trở về như ban đầu

## 🔧 Technical Details

### Database Schema:
```sql
-- Fabrics table structure
fabrics {
  id: integer (primary key)
  code: text (unique)
  name: text
  is_hidden: boolean (default: false)
  updated_at: timestamp
  ...
}
```

### Backup File Format:
```json
{
  "timestamp": "2025-01-14T15:00:00.000Z",
  "operation": "hide_fabrics",
  "fabric_ids": [1, 2, 3, ...],
  "fabric_codes": ["FB15198A6", "JK090E-01", ...],
  "total_count": 169
}
```

## 🛡️ Safety Features

### Validation:
- ✅ Fabric existence check
- ✅ Current status verification
- ✅ User confirmation prompts
- ✅ Error handling và logging

### Backup & Recovery:
- ✅ Automatic backup creation
- ✅ Rollback capability
- ✅ Operation tracking
- ✅ Audit trail

### Error Handling:
- ✅ Network error resilience
- ✅ Partial failure handling
- ✅ Detailed error reporting
- ✅ Safe exit on critical errors

## 📝 Fabric Codes List

Total: **169 fabric codes** được ẩn:

```
FB15198A6, JK090E-01, JNF/19, N208BOFR, W5601-20, YB093, YB096,
07013D-88, 1803 BLACKOUT, 8000, 83100-13, 83102-19, 83813-7,
8525-26, 8525-42, 8525-43, 8525-46, 8542-11, 8557-06, 8568-05,
... (và 149 mã khác)
```

## 🚨 Important Notes

1. **Database Impact:** Scripts thực hiện direct database updates
2. **Backup Required:** Luôn tạo backup trước khi thực hiện
3. **Verification:** Chạy verify script trước và sau operation
4. **Rollback Ready:** Có thể rollback bất cứ lúc nào
5. **Real-time Effect:** Changes có hiệu lực ngay lập tức

## 📞 Support

Nếu có vấn đề:
1. Check console logs để xem error details
2. Verify Supabase connection
3. Check backup files tồn tại
4. Run verification script để check current state
5. Use rollback script nếu cần restore
