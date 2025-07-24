# 🖼️ Hướng Dẫn Cập Nhật Trạng Thái Ảnh

## 🎯 Vấn Đề Đã Được Khắc Phục

**Trước đây:** Khi bạn upload ảnh mới lên Cloudinary, số liệu trạng thái ảnh không tự động cập nhật.

**Bây giờ:** Hệ thống có thể tự động phát hiện ảnh mới trên Cloudinary và cập nhật trạng thái.

## 🔧 Chức Năng Mới

### 1. **Button "Làm mới trạng thái ảnh"**
- **Vị trí**: Trong panel "Đồng bộ Cloudinary" (nhấn nút "Đồng bộ" để mở)
- **Chức năng**: Quét tất cả fabric codes và kiểm tra xem có ảnh mới trên Cloudinary không
- **Kết quả**: Cập nhật số liệu "Có ảnh" và "Chưa có ảnh" trong thời gian thực

### 2. **Tự động phát hiện ảnh mới**
- Hệ thống sẽ tự động thêm fabric codes có ảnh mới vào danh sách "có ảnh"
- Không cần cập nhật file code thủ công

## 📋 Cách Sử Dụng

### Bước 1: Upload ảnh lên Cloudinary
1. Upload ảnh vải lên Cloudinary với tên file chính xác là fabric code
2. Ví dụ: `FB15144A3.jpg`, `DCR-MELIA-COFFEE.png`

### Bước 2: Cập nhật trạng thái trong web app
1. Mở web app: `http://localhost:3004/sale`
2. Nhấn nút **"Đồng bộ"** để mở panel sync
3. Nhấn nút **"🖼️ Làm mới trạng thái ảnh"**
4. Đợi hệ thống kiểm tra (có thể mất 1-2 phút)
5. Trang sẽ tự động reload với số liệu mới

### Bước 3: Kiểm tra kết quả
- Số liệu "✅ Có ảnh" và "❌ Chưa có ảnh" sẽ được cập nhật
- Tỷ lệ phần trăm sẽ thay đổi tương ứng

## 🔍 Kiểm Tra Thủ Công

### Cách 1: Sử dụng Browser Console
1. Mở `http://localhost:3004/sale`
2. Nhấn F12 để mở Developer Tools
3. Vào tab Console
4. Chạy lệnh:
```javascript
// Load test script
const script = document.createElement('script');
script.src = '/scripts/refresh-image-status.js';
document.head.appendChild(script);

// Sau khi load xong, chạy test
setTimeout(() => {
  runAllTests();
}, 2000);
```

### Cách 2: Sử dụng Test Page
1. Mở file: `test-refresh-image-status.html`
2. Nhấn các button để test chức năng

## 📊 Ví Dụ Kết Quả

**Trước khi refresh:**
```
📊 Tỷ lệ có ảnh: 35.8%
✅ Có ảnh: 120
❌ Chưa có ảnh: 215
```

**Sau khi upload 15 ảnh mới và refresh:**
```
📊 Tỷ lệ có ảnh: 40.3%
✅ Có ảnh: 135 (+15)
❌ Chưa có ảnh: 200 (-15)
```

## 🚨 Lưu Ý Quan Trọng

### 1. **Tên file phải chính xác**
- Tên file trên Cloudinary phải khớp chính xác với fabric code
- Ví dụ: `FB15144A3.jpg` cho fabric code `FB15144A3`

### 2. **Thời gian xử lý**
- Quá trình kiểm tra có thể mất 1-2 phút cho 335 fabric codes
- Hệ thống sẽ hiển thị trạng thái "Đang xử lý..."

### 3. **Chỉ áp dụng cho phiên bản Sale**
- Chức năng này chỉ có trong phiên bản Sale (`/sale`)
- Phiên bản Marketing (`/marketing`) không cần cập nhật số liệu

### 4. **Cache và Storage**
- Hệ thống sử dụng cache để tăng tốc độ
- Nếu có vấn đề, có thể nhấn "Xóa cache" để reset

### 5. **Development Mode**
- Trong development mode, một số API calls sẽ được skip
- Console sẽ hiển thị: "🚧 Development mode: Sync API not available (no backend)"
- Đây là hành vi bình thường, không phải lỗi

## 🔧 Troubleshooting

### Vấn đề: Số liệu không cập nhật
**Giải pháp:**
1. Kiểm tra tên file trên Cloudinary có đúng không
2. Nhấn "Xóa cache" và thử lại
3. Refresh trang web (F5)

### Vấn đề: Lỗi "fabricModule.getFabricInventory is not a function"
**Giải pháp:**
✅ **Đã được khắc phục!** Function đã được đổi thành `getMockFabrics()`
- Nếu vẫn gặp lỗi, refresh trang và thử lại

### Vấn đề: Console hiển thị "Development mode: Sync API not available"
**Giải pháp:**
✅ **Đây không phải lỗi!** Đây là hành vi bình thường trong development mode
- Các API backend không khả dụng trong development
- Chức năng vẫn hoạt động với dữ liệu local

### Vấn đề: Quá trình kiểm tra bị lỗi
**Giải pháp:**
1. Kiểm tra kết nối internet
2. Đảm bảo Cloudinary đang hoạt động
3. Thử lại sau vài phút

### Vấn đề: Button không xuất hiện
**Giải pháp:**
1. Đảm bảo đang ở phiên bản Sale (`/sale`)
2. Nhấn nút "Đồng bộ" để mở panel
3. Refresh trang nếu cần

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console log (F12 > Console)
2. Chụp ảnh màn hình lỗi
3. Ghi lại các bước đã thực hiện

---

**🎉 Chúc bạn sử dụng thành công!**
