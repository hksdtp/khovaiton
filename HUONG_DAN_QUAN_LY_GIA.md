# 🏷️ Hướng Dẫn Quản Lý Giá Sản Phẩm

## ✨ Tính Năng Đã Có Sẵn

Dự án của bạn đã có đầy đủ hệ thống quản lý giá với khả năng đồng bộ giữa các thiết bị!

### 🎯 Các Tính Năng Chính:

1. **Thêm/Sửa Giá Trực Tiếp**
   - Click vào sản phẩm chưa có giá → Hiện nút "Thêm giá"
   - Click vào sản phẩm đã có giá → Hiện nút "Sửa giá"
   - Nhập giá bằng VND với định dạng tự động (VD: 150000 → 150.000 ₫)

2. **Ghi Chú Giá**
   - Thêm ghi chú cho giá (VD: "Giá sỉ", "Giá lẻ", "Khuyến mãi")
   - Hiển thị thời gian cập nhật giá

3. **Đồng Bộ Giữa Thiết Bị**
   - Dữ liệu được lưu vào Supabase database
   - Tự động đồng bộ khi mở app trên thiết bị khác
   - Backup tạm thời trong localStorage nếu mất kết nối

## 🚀 Cách Sử Dụng

### Bước 1: Thêm Giá Cho Sản Phẩm
1. Mở app tại: http://localhost:3010
2. Tìm sản phẩm cần thêm giá
3. Click vào sản phẩm → Modal chi tiết mở ra
4. Click nút **"Thêm giá"** (màu xanh với icon 💰)
5. Nhập giá và ghi chú (tùy chọn)
6. Click **"Lưu"**

### Bước 2: Kiểm Tra Đồng Bộ
1. Mở app trên thiết bị khác hoặc tab mới
2. Tìm sản phẩm vừa cập nhật giá
3. Giá sẽ hiển thị ngay lập tức

### Bước 3: Sửa/Xóa Giá
1. Click vào sản phẩm đã có giá
2. Click nút **"Sửa"** bên cạnh giá hiển thị
3. Thay đổi giá hoặc để trống để xóa giá
4. Click **"Lưu"**

## 🎨 Giao Diện

### Hiển Thị Giá:
- **Có giá**: Khung màu xanh với giá định dạng VND
- **Chưa có giá**: Khung màu xám với text "Chưa có giá - Click để thêm"
- **Ghi chú**: Hiển thị dưới giá (nếu có)
- **Thời gian**: Hiển thị thời gian cập nhật cuối

### Trang Marketing vs Sales:
- **Trang Marketing** (`/marketing`): Chỉ hiển thị sản phẩm có giá
- **Trang Sales** (`/`): Hiển thị tất cả sản phẩm + quản lý giá

## 🔧 Kỹ Thuật

### Database Schema:
```sql
-- Các trường giá trong bảng fabrics
price: number (nullable)           -- Giá bán (VND)
price_note: text (nullable)        -- Ghi chú về giá  
price_updated_at: timestamp        -- Thời gian cập nhật
updated_at: timestamp              -- Thời gian cập nhật chung
```

### Components:
- `PriceManager.tsx`: Component quản lý giá
- `FabricCard.tsx`: Hiển thị giá trên card
- `fabricUpdateService.ts`: Service đồng bộ database

## 🎉 Kết Luận

Hệ thống quản lý giá đã hoàn chỉnh và sẵn sàng sử dụng! 

**Ưu điểm:**
✅ Thêm/sửa giá trực tiếp trên giao diện
✅ Đồng bộ tự động giữa các thiết bị  
✅ Giao diện thân thiện, dễ sử dụng
✅ Backup dữ liệu an toàn
✅ Hiển thị giá đẹp mắt với định dạng VND

**Sử dụng ngay:** Mở http://localhost:3010 và bắt đầu thêm giá cho sản phẩm!
