# 🤖 Hướng Dẫn Tự Động Đồng Bộ Trạng Thái Ảnh

## 🎯 **Tính Năng Mới: Tự Động Đồng Bộ**

### ✅ **Đã Hoàn Thành:**
- **🤖 Tự động kiểm tra** ảnh mới trên Cloudinary mỗi 5 phút
- **🔄 Tự động cập nhật** trạng thái "có ảnh" vs "chưa có ảnh"
- **🔔 Thông báo** khi tìm thấy ảnh mới
- **⚙️ Cấu hình** tần suất và tùy chọn
- **📊 Thống kê** chi tiết về quá trình đồng bộ

## 🖥️ **Giao Diện Tự Động Đồng Bộ**

### 📍 **Vị Trí:**
- **Trang Sale**: `http://localhost:3004/sale`
- **Vị trí**: Ngay dưới bộ lọc "Có ảnh / Chưa có ảnh"
- **Hiển thị**: Panel màu trắng với đèn LED trạng thái

### 🎛️ **Các Thành Phần:**

**1. 🔴/🟢 Đèn LED Trạng Thái:**
- **🟢 Xanh nhấp nháy**: Đang hoạt động
- **🔴 Xám**: Đã tắt

**2. 📊 Thống Kê:**
- **Đã kiểm tra**: Tổng số fabric codes đã kiểm tra
- **Ảnh mới tìm thấy**: Số ảnh mới được phát hiện

**3. ⏰ Thông Tin Thời Gian:**
- **Lần cuối**: Thời gian sync gần nhất
- **Tiếp theo**: Countdown đến lần sync tiếp theo

**4. 🎛️ Nút Điều Khiển:**
- **▶️ Play**: Bắt đầu tự động đồng bộ
- **⏸️ Pause**: Tạm dừng tự động đồng bộ
- **🔄 Refresh**: Đồng bộ ngay lập tức
- **⚙️ Settings**: Mở panel cài đặt

## ⚙️ **Cài Đặt Tự Động Đồng Bộ**

### 🔧 **Các Tùy Chọn:**

**1. Bật/Tắt Tự Động Đồng Bộ:**
- ✅ **Bật**: Tự động kiểm tra theo lịch
- ❌ **Tắt**: Chỉ đồng bộ thủ công

**2. Tần Suất Kiểm Tra:**
- **1 phút**: Kiểm tra rất thường xuyên (cho test)
- **2 phút**: Kiểm tra thường xuyên
- **5 phút**: Mặc định (khuyến nghị)
- **10 phút**: Kiểm tra vừa phải
- **15 phút**: Kiểm tra ít
- **30 phút**: Kiểm tra rất ít

**3. Thông Báo:**
- ✅ **Bật**: Hiển thị notification khi có ảnh mới
- ❌ **Tắt**: Không hiển thị notification

## 🚀 **Cách Sử Dụng**

### 🎬 **Lần Đầu Sử Dụng:**

1. **Mở trang Sale**: `http://localhost:3004/sale`
2. **Tìm panel "Tự động đồng bộ"** (dưới bộ lọc ảnh)
3. **Kiểm tra trạng thái**: Đèn LED xanh = đang hoạt động
4. **Xem thống kê**: Số liệu sẽ cập nhật theo thời gian

### 📱 **Sử Dụng Hàng Ngày:**

**Khi Upload Ảnh Mới:**
1. **Upload ảnh** lên Cloudinary (tên file = fabric code)
2. **Đợi tối đa 5 phút** (hoặc tần suất đã cài đặt)
3. **Xem thông báo** "🖼️ Tìm thấy ảnh mới!" (nếu bật)
4. **Số liệu TỰ ĐỘNG cập nhật** trong phần "Trạng thái ảnh"
5. **Danh sách vải tự động refresh** để hiển thị ảnh mới
6. **Không cần reload trang** - tất cả diễn ra tự động!

**Khi Cần Đồng Bộ Ngay:**
1. **Nhấn nút 🔄 Refresh** trong panel tự động đồng bộ
2. **Đợi xử lý** (1-2 phút cho 335 fabric codes)
3. **Xem kết quả** trong thống kê

## 🔄 **Cập Nhật UI Tự Động**

### ✨ **Cách Hoạt Động:**

**🎯 Khi Tìm Thấy Ảnh Mới:**
1. **Auto-sync phát hiện** ảnh mới trên Cloudinary
2. **Cập nhật cache** trong memory
3. **Gửi signal** đến các UI components
4. **Invalidate React Query cache** để force refresh
5. **UI tự động re-render** với dữ liệu mới

**📊 Các Phần UI Được Cập Nhật:**
- ✅ **Trạng thái ảnh**: Số "Có ảnh" và "Chưa có ảnh"
- ✅ **Danh sách vải**: Hiển thị ảnh mới trong grid
- ✅ **Auto-sync panel**: Thống kê và counter
- ✅ **Fabric cards**: Ảnh mới xuất hiện ngay lập tức

**⚡ Realtime Updates:**
- **Không cần F5** - Tự động refresh
- **Không cần nhấn button** - Hoàn toàn tự động
- **Instant feedback** - Thấy kết quả ngay

## 🔔 **Thông Báo Browser**

### 📱 **Cách Bật Thông Báo:**

1. **Lần đầu**: Browser sẽ hỏi quyền thông báo
2. **Nhấn "Allow"** để cho phép
3. **Khi có ảnh mới**: Sẽ hiện notification desktop

### 📋 **Nội Dung Thông Báo:**
```
🖼️ Tìm thấy ảnh mới!
Đã tìm thấy 3 ảnh mới cho các mẫu vải
```

## 📊 **Thống Kê & Monitoring**

### 📈 **Các Chỉ Số:**

**1. Đã Kiểm Tra:**
- Tổng số fabric codes đã được kiểm tra
- Reset về 0 khi restart app

**2. Ảnh Mới Tìm Thấy:**
- Tổng số ảnh mới được phát hiện
- Tích lũy theo thời gian

**3. Lỗi:**
- Hiển thị lỗi gần nhất (nếu có)
- Tự động retry khi gặp lỗi

### 🔄 **Reset Thống Kê:**
- **Nhấn "Reset thống kê"** trong panel cài đặt
- Đặt lại tất cả số liệu về 0

## 🛠️ **Troubleshooting**

### ❌ **Vấn Đề: Tự động đồng bộ không hoạt động**
**Giải pháp:**
1. Kiểm tra đèn LED có xanh không
2. Nhấn nút ▶️ để bắt đầu
3. Kiểm tra cài đặt "Bật tự động đồng bộ"

### ❌ **Vấn Đề: Không tìm thấy ảnh mới**
**Giải pháp:**
1. Kiểm tra tên file trên Cloudinary có đúng fabric code không
2. Nhấn 🔄 để đồng bộ thủ công
3. Kiểm tra console log (F12) để xem lỗi

### ❌ **Vấn Đề: Thông báo không hiện**
**Giải pháp:**
1. Kiểm tra quyền notification trong browser
2. Bật "Thông báo khi có ảnh mới" trong cài đặt
3. Test bằng cách nhấn 🔄 sau khi upload ảnh mới

### ❌ **Vấn Đề: Tần suất quá nhanh/chậm**
**Giải pháp:**
1. Mở panel cài đặt (⚙️)
2. Thay đổi "Tần suất (phút)"
3. Hệ thống sẽ tự động restart với tần suất mới

## 💡 **Tips & Best Practices**

### 🎯 **Khuyến Nghị:**

**1. Tần Suất Tối Ưu:**
- **Development**: 2-5 phút (để test nhanh)
- **Production**: 10-15 phút (tiết kiệm tài nguyên)

**2. Thông Báo:**
- **Bật** khi đang làm việc với ảnh
- **Tắt** khi không cần theo dõi

**3. Monitoring:**
- Kiểm tra thống kê định kỳ
- Reset thống kê hàng tuần

### ⚡ **Performance:**
- Tự động đồng bộ chạy trong background
- Không ảnh hưởng đến hiệu suất web app
- Tự động retry khi gặp lỗi

## 🎉 **Kết Quả Mong Đợi**

### ✅ **Trước Đây (Thủ Công):**
```
1. Upload ảnh lên Cloudinary
2. Nhấn "Đồng bộ" → "Làm mới trạng thái ảnh"
3. Đợi xử lý
4. Reload trang để xem kết quả
```

### ✅ **Bây Giờ (Tự Động):**
```
1. Upload ảnh lên Cloudinary
2. Đợi tối đa 5 phút
3. Nhận thông báo "Tìm thấy ảnh mới!"
4. Số liệu tự động cập nhật
```

**🎯 Tiết kiệm thời gian và công sức, đảm bảo dữ liệu luôn được cập nhật!**

---

**📞 Hỗ trợ:** Nếu có vấn đề, kiểm tra console log (F12) và báo cáo lỗi cụ thể.
