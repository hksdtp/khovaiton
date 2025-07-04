# 📸 HƯỚNG DẪN UPLOAD ẢNH FABRIC

## 🎯 QUY TRÌNH UPLOAD:

### Bước 1: Chuẩn bị ảnh
1. **Chụp ảnh fabric** với ánh sáng tốt
2. **Crop ảnh** để focus vào texture
3. **Resize** về kích thước hợp lý (800-1200px)
4. **Format:** JPG hoặc PNG
5. **Kích thước:** Tối đa 5MB/ảnh

### Bước 2: Đặt tên file
1. **Tên file = Fabric code CHÍNH XÁC**
2. **Ví dụ:** 
   - Fabric code: `TP01623-222` → File: `TP01623-222.jpg`
   - Fabric code: `carnival r/b purple` → File: `carnival r/b purple.jpg`
3. **Lưu ý:** Giữ nguyên spaces, dấu gạch ngang, ký tự đặc biệt

### Bước 3: Upload vào folder phù hợp
1. **High Priority:** Fabric có số lượng lớn, quan trọng
2. **Medium Priority:** Fabric số lượng trung bình
3. **Low Priority:** Fabric ít, có lỗi
4. **Special Cases:** Fabric có tên phức tạp

### Bước 4: Sync vào web app
```bash
cd /Users/nih/web app/khovaiton/upload_missing_images
python3 sync_images.py
```

## ⚠️ LƯU Ý QUAN TRỌNG:

### ✅ ĐÚNG:
- Tên file chính xác 100%
- Format JPG/PNG
- Ảnh rõ nét, đủ sáng
- Kích thước hợp lý

### ❌ SAI:
- Tên file sai chính tả
- Thêm số thứ tự (1), (2)
- Format khác (HEIC, BMP)
- Ảnh mờ, tối

## 📊 PRIORITY GUIDE:

### 🔥 High Priority (Upload trước):
- Fabric có số lượng > 50
- Fabric thường xuyên sử dụng
- Fabric ở vị trí dễ tiếp cận

### 🔶 Medium Priority:
- Fabric số lượng 10-50
- Fabric sử dụng thỉnh thoảng

### 🔸 Low Priority:
- Fabric số lượng < 10
- Fabric có lỗi, bẩn
- Fabric ít sử dụng

## 🎯 MỤC TIÊU:
Tăng coverage từ 63.2% lên 80%+ bằng cách upload ảnh cho ~50-60 fabric codes quan trọng nhất.
