# 🌍 Custom Domain Setup Guide

Ninh ơi, đây là hướng dẫn setup domain riêng cho web app.

## 📋 Bước 1: Chọn và Mua Domain

### 1.1. Recommended Domain Providers
- **Namecheap** (khuyến nghị): Giá tốt, dễ quản lý
- **GoDaddy**: Phổ biến, nhiều tính năng
- **Cloudflare**: Giá gốc, tích hợp CDN
- **Google Domains**: Đơn giản, tích hợp Google services

### 1.2. Domain Suggestions
```
khovaiton.com
khovaiton.vn
fabricinventory.com
vaitonkho.com
```

### 1.3. Domain Pricing (Annual)
- `.com`: $10-15/year
- `.vn`: $15-25/year
- `.net`: $12-18/year
- `.org`: $10-15/year

## ⚙️ Bước 2: Configure DNS Records

### 2.1. Vercel DNS Configuration
Sau khi deploy lên Vercel:

1. **Vercel Dashboard** → Project → Settings → Domains
2. Add domain: `your-domain.com`
3. Vercel sẽ cung cấp DNS records

### 2.2. DNS Records cần thêm
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 2.3. Namecheap DNS Setup
1. Login Namecheap → Domain List
2. Click "Manage" → Advanced DNS
3. Add records:
   ```
   Type: CNAME Record
   Host: @
   Value: cname.vercel-dns.com
   TTL: Automatic
   
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

### 2.4. Cloudflare DNS Setup
1. Add site to Cloudflare
2. Update nameservers tại domain provider
3. Add DNS records:
   ```
   Type: CNAME
   Name: @
   Content: cname.vercel-dns.com
   Proxy: Orange cloud (Proxied)
   
   Type: CNAME
   Name: www
   Content: cname.vercel-dns.com
   Proxy: Orange cloud (Proxied)
   ```

## 🔒 Bước 3: SSL Certificate

### 3.1. Automatic SSL (Vercel)
- Vercel tự động tạo SSL certificate
- Let's Encrypt certificate
- Auto-renewal
- Available sau 5-10 phút

### 3.2. Cloudflare SSL (Nếu dùng Cloudflare)
1. SSL/TLS → Overview
2. Chọn "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

## 📊 Bước 4: Performance Optimization

### 4.1. CDN Configuration
```javascript
// Vercel Edge Network tự động
// Global CDN với 40+ locations
// Automatic image optimization
```

### 4.2. Caching Strategy
```javascript
// Static assets: 1 year
// API responses: 1 hour
// Images: 30 days
// HTML: No cache (for updates)
```

### 4.3. Compression
```javascript
// Gzip compression: Enabled
// Brotli compression: Enabled
// Image optimization: WebP/AVIF
```

## 🔧 Bước 5: Advanced Configuration

### 5.1. Subdomain Setup
```
api.your-domain.com → API server
cdn.your-domain.com → Static assets
admin.your-domain.com → Admin panel
```

### 5.2. Email Setup
```
MX Records for email:
Priority: 10
Value: mail.your-domain.com

Or use Google Workspace:
Priority: 1
Value: aspmx.l.google.com
```

### 5.3. Security Headers
```javascript
// Vercel automatically adds:
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

## 🧪 Bước 6: Testing & Verification

### 6.1. DNS Propagation Check
```bash
# Check DNS propagation
nslookup your-domain.com
dig your-domain.com

# Online tools:
# https://dnschecker.org/
# https://whatsmydns.net/
```

### 6.2. SSL Certificate Check
```bash
# Check SSL
openssl s_client -connect your-domain.com:443

# Online tools:
# https://www.ssllabs.com/ssltest/
```

### 6.3. Performance Testing
```bash
# PageSpeed Insights
https://pagespeed.web.dev/

# GTmetrix
https://gtmetrix.com/

# WebPageTest
https://www.webpagetest.org/
```

## 📈 Bước 7: Monitoring & Analytics

### 7.1. Vercel Analytics
```javascript
// Enable in Vercel dashboard
// Real User Monitoring (RUM)
// Core Web Vitals
// Traffic analytics
```

### 7.2. Google Analytics
```javascript
// Add GA4 tracking
// Monitor user behavior
// Track conversions
// Performance insights
```

### 7.3. Uptime Monitoring
```javascript
// UptimeRobot (free)
// Pingdom
// StatusCake
// Monitor 24/7 availability
```

## 🚨 Troubleshooting

### Common Issues:

**Domain not resolving**
- Check DNS propagation (24-48 hours)
- Verify CNAME records
- Clear DNS cache: `ipconfig /flushdns`

**SSL Certificate errors**
- Wait for certificate generation (5-10 minutes)
- Check domain verification
- Try force refresh: Ctrl+F5

**Performance issues**
- Enable Cloudflare if needed
- Optimize images
- Check Vercel Edge Network

**Email not working**
- Configure MX records
- Use email provider (Gmail, Outlook)
- Test with mail-tester.com

## 💰 Cost Estimation

### Monthly Costs:
```
Domain: $1-2/month
Vercel Pro: $20/month (if needed)
Cloudflare Pro: $20/month (optional)
Email: $6/month (Google Workspace)

Total: $7-48/month depending on features
```

### Free Tier Limits:
```
Vercel Hobby: 
- 100GB bandwidth
- 1000 serverless functions
- Custom domains: Unlimited

Cloudflare Free:
- Unlimited bandwidth
- Basic DDoS protection
- 3 Page Rules
```

## 📋 Domain Setup Checklist

- [ ] Domain purchased
- [ ] DNS records configured
- [ ] Domain added to Vercel
- [ ] SSL certificate active
- [ ] WWW redirect working
- [ ] Performance optimized
- [ ] Analytics setup
- [ ] Monitoring configured
- [ ] Email configured (optional)
- [ ] Backup DNS configured

## 🎯 Post-Setup Tasks

### Immediate:
1. Test all functionality
2. Check mobile responsiveness
3. Verify Google Drive sync
4. Monitor error logs

### Ongoing:
1. Renew domain annually
2. Monitor performance
3. Update DNS if needed
4. Review security settings

---

**🎉 Domain setup completed!**

Your app will be live at: `https://your-domain.com`
