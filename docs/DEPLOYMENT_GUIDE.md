# 🚀 Deployment Guide - Vercel

Ninh ơi, đây là hướng dẫn chi tiết để deploy lên Vercel với domain riêng.

## 📋 Bước 1: Chuẩn bị Google Drive API

### 1.1. Tạo Google Cloud Project
1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới: "Kho Vải Tôn"
3. Enable Google Drive API
4. Tạo API Key trong "Credentials"
5. Restrict API Key:
   - API restrictions: Google Drive API
   - HTTP referrers: `https://your-domain.com/*`, `https://*.vercel.app/*`

### 1.2. Lưu API Key
```
VITE_GOOGLE_DRIVE_API_KEY=your_api_key_here
```

## 🌐 Bước 2: Deploy lên Vercel

### 2.1. Tạo Vercel Account
1. Truy cập: https://vercel.com/
2. Sign up với GitHub account
3. Connect GitHub repository

### 2.2. Deploy từ GitHub
1. Push code lên GitHub repository
2. Import project từ Vercel dashboard
3. Configure build settings:
   ```
   Framework Preset: Vite
   Build Command: npm run build:production
   Output Directory: dist
   Install Command: npm install
   ```

### 2.3. Hoặc Deploy từ CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## ⚙️ Bước 3: Configure Environment Variables

### 3.1. Trong Vercel Dashboard
Project Settings → Environment Variables:

```
VITE_APP_ENV = production
VITE_APP_NAME = Kho Vải Tôn
VITE_APP_VERSION = 1.0.0
VITE_GOOGLE_DRIVE_FOLDER_ID = 1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
VITE_GOOGLE_DRIVE_API_KEY = your_api_key_here
VITE_ENABLE_GOOGLE_DRIVE_SYNC = true
VITE_ENABLE_BATCH_IMPORT = true
VITE_ENABLE_REAL_TIME_SYNC = true
VITE_ENABLE_ANALYTICS = true
VITE_IMAGE_CACHE_TTL = 3600
VITE_API_TIMEOUT = 10000
VITE_MAX_IMAGE_SIZE = 10485760
VITE_ENABLE_CSP = true
```

### 3.2. Hoặc dùng CLI
```bash
# Setup environment variables
./scripts/setup-vercel-env.sh
```

## 🌍 Bước 4: Setup Custom Domain

### 4.1. Trong Vercel Dashboard
1. Project Settings → Domains
2. Add domain: `your-domain.com`
3. Configure DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   
   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   ```

### 4.2. SSL Certificate
- Vercel tự động tạo SSL certificate
- HTTPS sẽ available sau 5-10 phút

## 🔧 Bước 5: Optimize Performance

### 5.1. Vercel Configuration
File `vercel.json` đã được tạo với:
- Static file caching
- Security headers
- Route optimization

### 5.2. Image Optimization
```javascript
// Sử dụng Vercel Image Optimization
import Image from 'next/image'

// Hoặc optimize manual
const optimizedImageUrl = `/_vercel/image?url=${imageUrl}&w=800&q=75`
```

## 📊 Bước 6: Monitoring & Analytics

### 6.1. Vercel Analytics
1. Enable trong Project Settings
2. Monitor performance metrics
3. Track user interactions

### 6.2. Error Monitoring
```javascript
// Setup error tracking
window.addEventListener('error', (event) => {
  console.error('Production error:', event.error)
  // Send to monitoring service
})
```

## 🔄 Bước 7: Auto-Deploy Setup

### 7.1. GitHub Integration
1. Connect GitHub repository
2. Enable auto-deploy on push
3. Configure branch protection

### 7.2. Deploy Hooks
```bash
# Webhook URL for manual deploys
curl -X POST https://api.vercel.com/v1/integrations/deploy/your-hook-id
```

## 🧪 Bước 8: Testing Production

### 8.1. Functionality Tests
- [ ] Google Drive sync works
- [ ] Image loading works
- [ ] Search & filters work
- [ ] Mobile responsive
- [ ] Performance < 3s load time

### 8.2. Security Tests
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] API keys not exposed
- [ ] CORS configured correctly

## 🚨 Troubleshooting

### Common Issues:

**Build Fails**
```bash
# Check build locally
npm run build:production

# Check logs in Vercel dashboard
```

**Environment Variables Not Working**
- Verify variable names (must start with VITE_)
- Check deployment logs
- Redeploy after adding variables

**Google Drive API Errors**
- Verify API key restrictions
- Check folder permissions
- Monitor quota usage

**Domain Not Working**
- Check DNS propagation (24-48 hours)
- Verify CNAME records
- Check SSL certificate status

## 📋 Deployment Checklist

- [ ] Google Cloud project created
- [ ] Google Drive API enabled
- [ ] API key created and restricted
- [ ] Vercel account setup
- [ ] Repository connected
- [ ] Environment variables configured
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Production testing completed
- [ ] Monitoring setup
- [ ] Auto-deploy configured

## 🎯 Post-Deployment

### Immediate Tasks:
1. Test all functionality
2. Monitor error logs
3. Check performance metrics
4. Verify Google Drive sync

### Ongoing Maintenance:
1. Monitor API quotas
2. Update dependencies monthly
3. Review security settings
4. Backup configuration

---

**🎉 Congratulations! Your app is now live!**

Live URL: `https://your-domain.com`
Vercel Dashboard: `https://vercel.com/dashboard`
