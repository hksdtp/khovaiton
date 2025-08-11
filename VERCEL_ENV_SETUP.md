# 🚀 Hướng Dẫn Cấu Hình Environment Variables Trên Vercel

## ❌ Vấn Đề Hiện Tại
```
[Error] ❌ Supabase connection failed: Invalid API key
```

## 🔧 Giải Pháp: Cấu Hình Environment Variables

### Bước 1: Truy Cập Vercel Dashboard
1. Mở https://vercel.com/dashboard
2. Tìm project **khovaiton**
3. Click vào project

### Bước 2: Cấu Hình Environment Variables
1. Click tab **Settings**
2. Click **Environment Variables** ở sidebar
3. Thêm các biến sau:

#### 🔑 Supabase Configuration (Quan Trọng Nhất)
```
VITE_SUPABASE_URL = https://zgrfqkytbmahxcbgpkxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs
```

#### 🖼️ Cloudinary Configuration
```
VITE_CLOUDINARY_CLOUD_NAME = dgaktc3fb
VITE_CLOUDINARY_API_KEY = 917768158798778
VITE_CLOUDINARY_API_SECRET = ZkCVC7alaaSgcnW5kVXYQbxL5uU
VITE_CLOUDINARY_UPLOAD_PRESET = fabric_images
```

#### ⚙️ App Configuration
```
VITE_APP_ENV = production
VITE_APP_NAME = Kho Vải Tôn
VITE_APP_VERSION = 1.0.0
VITE_FORCE_CLOUD_SYNC = true
VITE_ENABLE_BATCH_IMPORT = true
VITE_ENABLE_ANALYTICS = false
VITE_IMAGE_CACHE_TTL = 3600
VITE_MAX_IMAGE_SIZE = 10485760
VITE_ENABLE_CSP = true
```

### Bước 3: Chọn Environment
Cho mỗi biến, chọn:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### Bước 4: Redeploy
1. Sau khi thêm tất cả biến, click **Deployments** tab
2. Tìm deployment mới nhất
3. Click **⋯** (3 dots) → **Redeploy**
4. Hoặc đợi auto-deploy từ GitHub push

## 🧪 Kiểm Tra Kết Quả

### Cách 1: Xem Console Log
1. Mở app trên Vercel: https://khovaiton.vercel.app
2. Mở Developer Tools (F12)
3. Xem Console tab, tìm:
```
🔍 Environment check:
  VITE_SUPABASE_URL: https://zgrfqkytbmahxcbgpkxx.supabase.co
  VITE_SUPABASE_ANON_KEY: Set (eyJhbGciOiJIUzI1NiIsInR5...)
  Environment: production
```

### Cách 2: Test Tính Năng
1. Mở app
2. Thử thêm giá cho một sản phẩm
3. Mở tab mới → Kiểm tra giá đã đồng bộ
4. Xem ảnh có hiển thị không

## 🔍 Debug Nếu Vẫn Lỗi

### Kiểm Tra Build Log
1. Vào Vercel Dashboard → Deployments
2. Click vào deployment mới nhất
3. Xem **Build Logs** có lỗi gì không

### Kiểm Tra Function Log
1. Vào **Functions** tab
2. Xem có lỗi runtime không

### Test API Key Trực Tiếp
Mở browser console và chạy:
```javascript
fetch('https://zgrfqkytbmahxcbgpkxx.supabase.co/rest/v1/fabrics?select=count&limit=1', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncmZxa3l0Ym1haHhjYmdwa3h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNjI1MTAsImV4cCI6MjA2MTczODUxMH0.a6giZZFMrj6jBhLip3ShOFCyTHt5dbe31UDGCECh0Zs'
  }
}).then(r => r.json()).then(console.log)
```

Nếu trả về data → API key đúng
Nếu lỗi 401 → API key sai

## 📋 Checklist Hoàn Thành

- [ ] Thêm tất cả environment variables vào Vercel
- [ ] Chọn đúng environments (Production, Preview, Development)
- [ ] Redeploy app
- [ ] Kiểm tra console log không có lỗi 401
- [ ] Test thêm giá sản phẩm
- [ ] Test đồng bộ giữa tabs
- [ ] Kiểm tra ảnh hiển thị đúng

## 🎯 Kết Quả Mong Đợi

Sau khi cấu hình xong:
- ✅ App load được 602 fabrics từ Supabase
- ✅ 365 ảnh hiển thị từ Cloudinary
- ✅ Thêm/sửa giá đồng bộ real-time
- ✅ Không còn lỗi 401 API key

**Lưu ý:** Có thể mất 2-3 phút để deployment hoàn tất sau khi cấu hình env vars.
