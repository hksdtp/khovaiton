# 🔑 Google Drive API Setup Guide

Ninh ơi, đây là hướng dẫn chi tiết để setup Google Drive API cho production.

## 📋 Bước 1: Tạo Google Cloud Project

### 1.1. Truy cập Google Cloud Console
1. Mở https://console.cloud.google.com/
2. Đăng nhập bằng Google account
3. Click "Select a project" → "New Project"

### 1.2. Tạo Project mới
```
Project Name: Kho Vải Tôn
Project ID: kho-vai-ton-[random-id]
Organization: (để trống nếu personal)
Location: (để mặc định)
```

### 1.3. Enable Google Drive API
1. Trong project vừa tạo, vào "APIs & Services" → "Library"
2. Tìm "Google Drive API"
3. Click "Enable"

## 🔐 Bước 2: Tạo API Credentials

### 2.1. Tạo API Key
1. Vào "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy API Key (sẽ dùng trong .env)

### 2.2. Restrict API Key (Bảo mật)
1. Click vào API Key vừa tạo
2. Trong "API restrictions":
   - Select "Restrict key"
   - Chọn "Google Drive API"
3. Trong "Application restrictions":
   - Chọn "HTTP referrers"
   - Thêm domains:
     ```
     https://your-domain.com/*
     https://*.vercel.app/*
     http://localhost:3000/*
     ```

### 2.3. Configure OAuth (Nếu cần)
Nếu muốn user login để access private files:
1. Click "Create Credentials" → "OAuth client ID"
2. Chọn "Web application"
3. Thêm authorized origins:
   ```
   https://your-domain.com
   https://kho-vai-ton.vercel.app
   ```

## 📁 Bước 3: Configure Drive Folder

### 3.1. Kiểm tra Folder Permission
1. Mở Google Drive folder: 
   https://drive.google.com/drive/folders/1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
2. Right click → "Share"
3. Đảm bảo setting: "Anyone with the link" → "Viewer"

### 3.2. Test API Access
```bash
# Test với curl
curl "https://www.googleapis.com/drive/v3/files?q='1YiRnl2CfccL6rH98S8UlWexgckV_dnbU'+in+parents&key=YOUR_API_KEY"
```

## 🔧 Bước 4: Configure Environment

### 4.1. Local Development (.env.local)
```bash
VITE_GOOGLE_DRIVE_FOLDER_ID=1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
VITE_GOOGLE_DRIVE_API_KEY=your_api_key_here
```

### 4.2. Vercel Production
Trong Vercel dashboard:
1. Project Settings → Environment Variables
2. Thêm:
   ```
   VITE_GOOGLE_DRIVE_FOLDER_ID = 1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
   VITE_GOOGLE_DRIVE_API_KEY = your_api_key_here
   ```

## 🧪 Bước 5: Testing

### 5.1. Test Script
```typescript
// Test API connection
import { checkFolderAccess, getFolderInfo } from './googleDriveApiService'

async function testApi() {
  try {
    const hasAccess = await checkFolderAccess()
    console.log('Folder access:', hasAccess)
    
    if (hasAccess) {
      const info = await getFolderInfo()
      console.log('Folder info:', info)
    }
  } catch (error) {
    console.error('API test failed:', error)
  }
}
```

### 5.2. Browser Console Test
```javascript
// Paste vào browser console
fetch('https://www.googleapis.com/drive/v3/files?q="1YiRnl2CfccL6rH98S8UlWexgckV_dnbU"+in+parents&key=YOUR_API_KEY')
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
```

## 📊 Bước 6: Monitoring & Quotas

### 6.1. Check API Usage
1. Google Cloud Console → "APIs & Services" → "Dashboard"
2. Monitor requests/day, errors
3. Set up alerts nếu cần

### 6.2. Quota Limits
- **Queries per day**: 1,000,000,000
- **Queries per 100 seconds**: 1,000
- **Queries per 100 seconds per user**: 100

### 6.3. Error Handling
```typescript
// Handle common errors
try {
  const files = await getDriveApiFiles()
} catch (error) {
  if (error.message.includes('403')) {
    // Quota exceeded or permission denied
  } else if (error.message.includes('404')) {
    // Folder not found
  } else if (error.message.includes('429')) {
    // Rate limit exceeded
  }
}
```

## 🔒 Bước 7: Security Best Practices

### 7.1. API Key Security
- ✅ Restrict by HTTP referrer
- ✅ Restrict to specific APIs
- ✅ Rotate keys định kỳ
- ❌ Không commit vào Git

### 7.2. CORS Configuration
```typescript
// Trong service
const headers = {
  'Origin': window.location.origin,
  'Referer': window.location.href
}
```

### 7.3. Rate Limiting
```typescript
// Implement client-side rate limiting
const rateLimiter = {
  requests: 0,
  resetTime: Date.now() + 100000, // 100 seconds
  
  async checkLimit() {
    if (Date.now() > this.resetTime) {
      this.requests = 0
      this.resetTime = Date.now() + 100000
    }
    
    if (this.requests >= 90) { // Leave buffer
      throw new Error('Rate limit exceeded')
    }
    
    this.requests++
  }
}
```

## 🚨 Troubleshooting

### Common Errors:

**403 Forbidden**
- Check API key restrictions
- Verify folder permissions
- Check quota limits

**404 Not Found**
- Verify folder ID
- Check if folder exists
- Ensure folder is not deleted

**429 Too Many Requests**
- Implement rate limiting
- Add retry with exponential backoff

**CORS Errors**
- Add domain to API key restrictions
- Check referrer headers

## 📞 Support

Nếu gặp vấn đề:
1. Check Google Cloud Console logs
2. Verify API key permissions
3. Test với curl command
4. Check browser network tab
