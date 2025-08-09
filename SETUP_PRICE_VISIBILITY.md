# Hướng dẫn Setup tính năng Giá và Ẩn/Hiện sản phẩm

## 🎯 Tính năng mới

### 1. **Quản lý giá sản phẩm**
- ✅ Thêm, sửa, xóa giá bán cho từng sản phẩm
- ✅ Ghi chú về giá (VD: "Giá sỉ", "Giá lẻ", "Giá khuyến mãi")
- ✅ Hiển thị giá định dạng VND
- ✅ Lọc sản phẩm theo có giá/chưa có giá

### 2. **Ẩn/Hiện sản phẩm**
- ✅ Ẩn sản phẩm tạm thời khỏi danh sách chính
- ✅ Hiển thị lại sản phẩm đã ẩn
- ✅ Lọc để xem sản phẩm đã ẩn
- ✅ Batch operations (ẩn/hiện nhiều sản phẩm cùng lúc)

### 3. **Đồng bộ Database**
- ✅ Tự động lưu vào Supabase
- ✅ Real-time updates
- ✅ Error handling và fallback

## 🛠️ Setup Database (Supabase)

### Bước 1: Tạo Supabase Project
1. Đăng ký tại https://supabase.com
2. Tạo project mới
3. Lấy URL và anon key từ Settings > API

### Bước 2: Tạo bảng fabrics
```sql
-- Tạo bảng fabrics với các trường mới
CREATE TABLE fabrics (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(50),
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  location TEXT,
  status VARCHAR(20) DEFAULT 'available',
  image TEXT,
  
  -- Trường mới cho giá
  price DECIMAL(15,2),
  price_note TEXT,
  price_updated_at TIMESTAMP,
  
  -- Trường mới cho ẩn/hiện
  is_hidden BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tạo index cho performance
CREATE INDEX idx_fabrics_code ON fabrics(code);
CREATE INDEX idx_fabrics_status ON fabrics(status);
CREATE INDEX idx_fabrics_is_hidden ON fabrics(is_hidden);
CREATE INDEX idx_fabrics_price ON fabrics(price);

-- Enable Row Level Security (RLS)
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho read (public)
CREATE POLICY "Allow public read" ON fabrics
  FOR SELECT USING (true);

-- Tạo policy cho write (authenticated users)
CREATE POLICY "Allow authenticated write" ON fabrics
  FOR ALL USING (auth.role() = 'authenticated');
```

### Bước 3: Cấu hình Environment Variables
```bash
# Copy .env.example thành .env
cp .env.example .env

# Điền thông tin Supabase vào .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🚀 Cách sử dụng

### 1. **Quản lý giá sản phẩm**

#### Trên Fabric Card:
- Click icon 💰 để thêm/sửa giá
- Giá sẽ hiển thị màu xanh dưới thông tin sản phẩm

#### Trong Detail Modal:
- Phần "Giá bán" với form đầy đủ
- Có thể thêm ghi chú về giá
- Nút "Xóa giá" để xóa giá hiện tại

### 2. **Ẩn/Hiện sản phẩm**

#### Trên Fabric Card:
- Click icon 👁️ để ẩn sản phẩm
- Click icon 🚫👁️ để hiện sản phẩm đã ẩn

#### Trong Detail Modal:
- Phần "Hiển thị sản phẩm" với trạng thái rõ ràng
- Nút "Ẩn"/"Hiện" với mô tả chi tiết

### 3. **Lọc và tìm kiếm**

#### Filter Panel:
- **Trạng thái giá**: Tất cả / Có giá / Chưa có giá
- **Hiển thị sản phẩm đã ẩn**: Checkbox để bao gồm sản phẩm ẩn

## 🔧 Technical Details

### Components mới:
- `PriceManager.tsx` - Quản lý giá sản phẩm
- `VisibilityManager.tsx` - Quản lý ẩn/hiện
- `fabricUpdateService.ts` - Service đồng bộ database

### Database Schema:
```typescript
interface Fabric {
  // ... existing fields
  price?: number
  priceNote?: string
  priceUpdatedAt?: Date
  isHidden?: boolean
}
```

### API Endpoints:
- `updatePrice(fabricId, price, note)` - Cập nhật giá
- `updateVisibility(fabricId, isHidden)` - Cập nhật ẩn/hiện
- `batchUpdateVisibility(fabricIds, isHidden)` - Batch update

## 🧪 Testing Guide

### **Fixed Issues:**
✅ **Database Connection Error**: "Failed to fetch" error has been resolved with proper error handling and localStorage fallback
✅ **Marketing Page Filtering**: Hidden products are completely removed from marketing page (not just dimmed)
✅ **Sales Page Access**: Hidden products remain accessible in sales/inventory page with management controls
✅ **User-Friendly Errors**: Technical errors replaced with clear Vietnamese messages

### **Test Scenarios:**

#### 1. **Test Price Management:**
- Go to sales page: http://localhost:5175/
- Click "💰 Thêm giá" on any product → Should open price form directly
- Enter price (e.g., "150000") → Should auto-format to "150,000"
- Save → Should show success message and display price prominently
- Click edit icon next to price → Should pre-fill current price
- Test "Xóa giá" button → Should remove price after confirmation

#### 2. **Test Visibility Management:**
- On sales page, click 👁️ icon to hide a product
- Should show success message (with warning if in mock mode)
- Product should show "ĐÃ ẨN" badge and appear dimmed
- Go to marketing page: http://localhost:5175/marketing
- Hidden product should be **completely absent** (not just dimmed)
- Return to sales page and click 🚫👁️ to unhide
- Product should reappear on marketing page

#### 3. **Test Marketing vs Sales Behavior:**
- **Marketing Page** (`/marketing`):
  - No price/visibility management controls visible
  - Only shows non-hidden products
  - Clean customer-facing view
- **Sales Page** (`/`):
  - Full management controls visible
  - Can see hidden products (with filter)
  - Complete admin functionality

#### 4. **Test Error Handling:**
- Without Supabase configured (current state):
  - Should show "⚠️ Database not configured" warnings
  - Changes saved to localStorage temporarily
  - User-friendly Vietnamese error messages
- With network issues:
  - Should show "Không thể kết nối đến database" instead of technical errors

#### 5. **Test Filter Panel:**
- **Trạng thái giá**: Filter by "Có giá" / "Chưa có giá"
- **Hiển thị sản phẩm đã ẩn**: Checkbox to include hidden products
- Filters should work correctly on both pages

## 🐛 Troubleshooting

### Database Connection (Fixed):
- ✅ No more "Failed to fetch" errors
- ✅ Graceful fallback to localStorage in mock mode
- ✅ Clear error messages in Vietnamese

### Mock Mode (Current State):
- App runs in localStorage mode when Supabase not configured
- Changes persist until browser data is cleared
- Console shows "Supabase configured: false"
- Success messages include warning about temporary storage

### Setup Real Database:
1. Follow Supabase setup in this file
2. Add credentials to `.env`
3. Changes will persist permanently

## 📝 Notes

- Tất cả thay đổi đều được log trong console
- App tự động refresh sau khi cập nhật
- Có error handling và user feedback
- Responsive design cho mobile
- Accessible với keyboard navigation
