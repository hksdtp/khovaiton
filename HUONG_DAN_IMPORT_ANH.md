# 🖼️ HƯỚNG DẪN IMPORT ẢNH HÀNG LOẠT

Ninh ơi, đây là hướng dẫn chi tiết để import thư viện ảnh vào web app mà không cần upload từng ảnh một.

## 📋 Tổng quan

Hệ thống đã được cập nhật để tự động map ảnh dựa trên mã vải. Bạn chỉ cần:
1. Copy ảnh vào đúng thư mục
2. Đặt tên file theo quy tắc
3. Refresh trang web

## 📁 Cấu trúc thư mục

```
khovaiton/
├── public/
│   └── images/
│       └── fabrics/          ← Đặt tất cả ảnh vào đây
│           ├── 3 PASS BO - WHITE - COL 15.jpg
│           ├── 33139-2-270.png
│           ├── 71022-10.webp
│           └── ...
```

## 📝 Quy tắc đặt tên file

### ✅ Đúng:
- Tên file = **Mã vải chính xác** + extension
- Ví dụ: `3 PASS BO - WHITE - COL 15.jpg`
- Ví dụ: `AS22541-5.png`

### ❌ Sai:
- `vai_3_pass_bo.jpg` (khác mã gốc)
- `3 PASS BO - WHITE - COL 15 - copy.jpg` (có thêm text)

### 🎯 Mã vải trong hệ thống:
Kiểm tra file `fabric_inventory_updated.csv` cột "Ma_hang" để biết mã chính xác.

## 🖼️ Format ảnh hỗ trợ

- ✅ `.jpg` / `.jpeg`
- ✅ `.png` 
- ✅ `.webp`
- ❌ `.gif`, `.bmp`, `.tiff` (không hỗ trợ)

## 📏 Yêu cầu kỹ thuật

- **Kích thước tối đa**: 10MB/ảnh
- **Độ phân giải khuyến nghị**: 800x600px trở lên
- **Tỷ lệ khuyến nghị**: 4:3 hoặc 16:9

## 🚀 Cách thực hiện

### Bước 1: Chuẩn bị ảnh
1. Mở thư viện ảnh hiện tại của bạn
2. Đối chiếu tên file với mã vải trong CSV
3. Rename file nếu cần (dùng batch rename tool)

### Bước 2: Copy ảnh
```bash
# Copy tất cả ảnh vào thư mục
cp /path/to/your/images/* public/images/fabrics/
```

### Bước 3: Kiểm tra
1. Mở web app: http://localhost:3000
2. Click button "Import ảnh" ở góc phải
3. Xem báo cáo mapping
4. Click "Refresh" để áp dụng

## 📊 Monitoring & Báo cáo

### Trong web app:
- Button "Import ảnh" → Xem báo cáo chi tiết
- Hiển thị: Tổng vải / Có ảnh / Chưa có ảnh
- Danh sách vải chưa có ảnh

### Trong console:
```
🖼️ Auto-mapping images for fabrics...
✅ Found images for 245/331 fabrics
```

## 🔧 Troubleshooting

### Ảnh không hiển thị?
1. **Kiểm tra tên file**: Phải chính xác 100% với mã vải
2. **Kiểm tra đường dẫn**: File phải ở `public/images/fabrics/`
3. **Kiểm tra format**: Chỉ hỗ trợ jpg, png, webp
4. **Hard refresh**: Ctrl+F5 hoặc Cmd+Shift+R

### Một số ảnh bị thiếu?
1. Mở modal "Import ảnh" để xem danh sách thiếu
2. Kiểm tra tên file có đúng không
3. Kiểm tra ký tự đặc biệt trong tên

### Performance chậm?
1. Compress ảnh trước khi copy (khuyến nghị < 500KB/ảnh)
2. Dùng format WebP cho tối ưu nhất
3. Batch import từng 50-100 ảnh

## 🛠️ Tools hỗ trợ

### Batch Rename (Windows):
- PowerToys PowerRename
- Bulk Rename Utility

### Batch Rename (Mac):
- Name Mangler
- Automator (built-in)

### Image Compression:
- TinyPNG.com
- ImageOptim (Mac)
- RIOT (Windows)

## 📈 Tối ưu hóa

### Để có performance tốt nhất:
1. **Compress ảnh**: 200-500KB/ảnh
2. **Resize ảnh**: 800x600px là đủ
3. **Dùng WebP**: Nhẹ hơn 30% so với JPG
4. **Lazy loading**: Đã tự động implement

### Batch convert sang WebP:
```bash
# Dùng cwebp tool
for file in *.jpg; do
  cwebp "$file" -o "${file%.jpg}.webp"
done
```

## 🎯 Kết quả mong đợi

Sau khi hoàn thành:
- ✅ Tất cả vải có ảnh sẽ hiển thị ngay lập tức
- ✅ Không cần upload từng ảnh thủ công
- ✅ Tự động optimize loading performance
- ✅ Responsive trên mọi device

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check console log (F12 → Console)
2. Kiểm tra Network tab để xem ảnh nào load fail
3. Thử với 1-2 ảnh trước để test

---

**Lưu ý**: Hệ thống sẽ tự động cache ảnh để load nhanh hơn. Nếu thay đổi ảnh, cần hard refresh để thấy update.
