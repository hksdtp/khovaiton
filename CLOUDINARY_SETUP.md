# 🌤️ CLOUDINARY SETUP GUIDE

## 📋 Bước 1: Tạo Cloudinary Account

### 1.1 Đăng ký account:
1. Vào: https://cloudinary.com/users/register/free
2. Đăng ký với email
3. Verify email
4. Login vào dashboard

### 1.2 Lấy credentials:
1. Vào Dashboard: https://console.cloudinary.com/
2. Copy thông tin sau:
   ```
   Cloud Name: [YOUR_CLOUD_NAME]
   API Key: [YOUR_API_KEY] 
   API Secret: [YOUR_API_SECRET]
   ```

### 1.3 Configure upload settings:
1. Vào Settings → Upload
2. Enable "Unsigned uploads" 
3. Tạo upload preset:
   - Name: `fabric_images`
   - Mode: `Unsigned`
   - Folder: `fabrics/`
   - Allowed formats: `jpg,jpeg,png`
   - Max file size: `5MB`
   - Auto optimization: `Enabled`

## 📋 Bước 2: Environment Variables

Tạo file `.env.local` (nếu chưa có):

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=fabric_images

# Optional: API Secret (for server-side operations)
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 📋 Bước 3: Install Dependencies

```bash
npm install cloudinary @cloudinary/react @cloudinary/url-gen
```

## 🎯 Expected Results:

✅ Free tier limits:
- Storage: 25GB (enough for 5000+ optimized images)
- Bandwidth: 25GB/month
- Transformations: 25,000/month
- Admin API calls: 500/hour

✅ Features included:
- Auto image optimization
- Global CDN delivery
- Direct browser uploads
- Mobile camera integration
- No CORS issues
- Real-time transformations

## 🔗 Useful Links:

- Dashboard: https://console.cloudinary.com/
- Documentation: https://cloudinary.com/documentation/react_integration
- Upload Widget: https://cloudinary.com/documentation/upload_widget
- React SDK: https://cloudinary.com/documentation/react_sdk

## 📱 Mobile Upload Support:

Cloudinary upload widget supports:
- Camera capture on mobile
- Photo library selection
- Drag & drop on desktop
- Multiple file upload
- Progress indicators
- Error handling

## 🎨 Auto Optimization:

Cloudinary automatically:
- Converts to optimal format (WebP, AVIF)
- Compresses images (80% size reduction typical)
- Generates responsive sizes
- Adds progressive loading
- Applies smart cropping if needed

## 🔒 Security Features:

- Unsigned uploads (safe for client-side)
- Upload presets (control what can be uploaded)
- Folder organization
- Access control
- Transformation restrictions
