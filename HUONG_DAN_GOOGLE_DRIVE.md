# ☁️ HƯỚNG DẪN SYNC ẢNH TỪ GOOGLE DRIVE

Ninh ơi, đây là hướng dẫn chi tiết để sync ảnh từ Google Drive vào web app.

## 🔗 Link Google Drive của bạn
```
https://drive.google.com/drive/folders/1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
```

## 📋 Chuẩn bị Google Drive

### Bước 1: Cấu hình quyền truy cập
1. Mở folder Google Drive của bạn
2. Click chuột phải → "Share" → "Get link"
3. Chọn "Anyone with the link" → "Viewer"
4. Copy link và gửi cho tôi để verify

### Bước 2: Tổ chức file trong Drive
```
📁 Fabric Images/
├── 3 PASS BO - WHITE - COL 15.jpg
├── 33139-2-270.png
├── 71022-10.jpg
├── 71022-7.webp
└── ...
```

**Quy tắc tên file:**
- ✅ Tên file = **Mã vải chính xác** (từ CSV)
- ✅ Format: .jpg, .png, .webp
- ❌ Không thêm prefix/suffix
- ❌ Không có ký tự đặc biệt

## 🚀 Cách 1: Sync qua Web App (Đơn giản)

### Trong web app:
1. Click button "Sync Drive" ở góc phải
2. Xem danh sách ảnh trong Drive
3. Click "Sync ảnh" để download
4. Chờ process hoàn thành

### Kết quả:
- ✅ Ảnh được download về máy bạn
- ✅ Tự động copy vào `public/images/fabrics/`
- ✅ Web app tự động hiển thị ảnh

## 🛠️ Cách 2: Sync qua Script (Nâng cao)

### Cài đặt dependencies:
```bash
# Cài Python packages
pip install gdown pandas

# Hoặc dùng conda
conda install pandas
pip install gdown
```

### Chạy sync script:
```bash
# Từ thư mục project
python scripts/sync_from_drive.py
```

### Script sẽ:
1. 📥 Download toàn bộ folder từ Drive
2. 📁 Organize ảnh vào đúng thư mục
3. 🎯 Check mapping với mã vải
4. 📊 Báo cáo kết quả

## 🔧 Cách 3: Manual Download (Backup)

### Nếu script không work:
1. Mở Google Drive folder
2. Select all images (Ctrl+A)
3. Right click → Download
4. Extract ZIP file
5. Copy ảnh vào `public/images/fabrics/`

## 📊 Kiểm tra kết quả

### Trong web app:
- Mở http://localhost:3000
- Click "Import ảnh" để xem báo cáo
- Check coverage: X/331 ảnh

### Trong terminal:
```bash
# Check số lượng ảnh
ls -la public/images/fabrics/ | wc -l

# Check mapping với CSV
python -c "
import pandas as pd
import os
df = pd.read_csv('fabric_inventory_updated.csv')
codes = df['Ma_hang'].tolist()
images = os.listdir('public/images/fabrics/')
mapped = len([c for c in codes if any(c in img for img in images)])
print(f'Mapped: {mapped}/{len(codes)} ({mapped/len(codes)*100:.1f}%)')
"
```

## 🎯 Tối ưu hóa

### Để có kết quả tốt nhất:

1. **Chuẩn bị ảnh trong Drive:**
   - Rename file theo đúng mã vải
   - Compress ảnh < 1MB/file
   - Dùng format WebP nếu có thể

2. **Batch rename trong Drive:**
   - Dùng Google Apps Script
   - Hoặc download → rename local → upload lại

3. **Sync định kỳ:**
   - Chạy script hàng tuần
   - Hoặc khi có ảnh mới

## 🔍 Troubleshooting

### Lỗi "Access denied":
```bash
# Kiểm tra quyền folder
curl -I "https://drive.google.com/drive/folders/1YiRnl2CfccL6rH98S8UlWexgckV_dnbU"
```
**Giải pháp:** Đảm bảo folder public với "Anyone with link"

### Lỗi "gdown failed":
```bash
# Cài đặt lại gdown
pip uninstall gdown
pip install gdown --upgrade
```

### Lỗi "No images found":
- Kiểm tra tên file có đúng format không
- Kiểm tra extension (.jpg, .png, .webp)
- Kiểm tra folder structure

### Ảnh không hiển thị trong web:
1. Hard refresh (Ctrl+F5)
2. Check console log (F12)
3. Verify file path: `public/images/fabrics/[tên file]`

## 📈 Monitoring

### Script output mẫu:
```
🚀 Starting Google Drive sync...
📁 Drive folder ID: 1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
📥 Downloading from Drive folder...
✅ Download completed successfully
📁 Organizing images...
✅ Copied: 3 PASS BO - WHITE - COL 15.jpg
✅ Copied: 33139-2-270.png
...
📊 Summary:
✅ Success: 245
❌ Errors: 3
🎯 Mapping Report:
📊 Total fabrics: 331
✅ With images: 245
❌ Without images: 86
📈 Coverage: 74.0%
```

## 🔄 Auto-sync (Tương lai)

### Có thể implement:
1. **Webhook từ Drive** → Auto trigger sync
2. **Scheduled job** → Sync hàng ngày
3. **Real-time API** → Trực tiếp từ Drive
4. **Desktop app** → Sync background

## 📞 Hỗ trợ

### Nếu gặp vấn đề:
1. Check Drive folder permissions
2. Verify file naming convention
3. Run script với verbose mode:
   ```bash
   python scripts/sync_from_drive.py --verbose
   ```
4. Check web app console (F12)

---

**Lưu ý:** Lần đầu sync có thể mất 5-10 phút tùy số lượng ảnh. Các lần sau sẽ nhanh hơn vì chỉ sync ảnh mới.
