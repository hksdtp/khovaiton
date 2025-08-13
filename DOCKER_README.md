# 🐳 Docker Setup cho Kho Vải Tồn

Hướng dẫn chi tiết để chạy ứng dụng Kho Vải Tồn với Docker.

## 📋 Yêu cầu hệ thống

- Docker Desktop (phiên bản 20.10 trở lên)
- Docker Compose (phiên bản 2.0 trở lên)
- Ít nhất 4GB RAM trống
- Ít nhất 2GB dung lượng ổ cứng

## 🚀 Khởi động nhanh

### 1. Môi trường phát triển (Development)
```bash
# Sử dụng script tự động
./docker-start.sh dev

# Hoặc chạy trực tiếp
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Môi trường sản xuất (Production)
```bash
# Sử dụng script tự động
./docker-start.sh prod

# Hoặc chạy trực tiếp
docker-compose up --build
```

## 🔧 Cấu trúc Docker

### Services (Dịch vụ)

1. **Frontend** (React + Vite)
   - Port: 3004
   - Nginx reverse proxy
   - Tối ưu cho production

2. **Backend** (Express.js)
   - Port: 3001
   - Mock API server
   - Health check endpoint

### Files cấu hình

- `Dockerfile` - Frontend production build
- `Dockerfile.dev` - Frontend development
- `Dockerfile.server` - Backend production
- `Dockerfile.server.dev` - Backend development
- `docker-compose.yml` - Production environment
- `docker-compose.dev.yml` - Development environment
- `nginx.conf` - Nginx configuration
- `.dockerignore` - Loại trừ files không cần thiết

## 📝 Các lệnh Docker hữu ích

### Quản lý containers
```bash
# Kiểm tra health của tất cả services
./health-check.sh

# Xem trạng thái containers
docker-compose ps

# Xem logs
./docker-start.sh logs
# hoặc
docker-compose logs -f

# Dừng tất cả services
./docker-start.sh stop

# Restart services
./docker-start.sh restart

# Dọn dẹp (xóa containers, images, volumes)
./docker-start.sh clean
```

### Debug và troubleshooting
```bash
# Vào container frontend
docker exec -it khovaiton-frontend-dev sh

# Vào container backend
docker exec -it khovaiton-backend-dev sh

# Xem logs của service cụ thể
docker-compose logs frontend
docker-compose logs backend

# Rebuild containers
docker-compose up --build --force-recreate
```

## 🌐 Endpoints

### Development
- Frontend: http://localhost:3004
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Production
- Application: http://localhost:3004
- Backend API: http://localhost:3001 (proxied through Nginx)
- Health check: http://localhost:3004/api/health

## 🔍 Monitoring và Health Checks

Cả hai services đều có health checks tự động:
- Kiểm tra mỗi 30 giây
- Timeout 10 giây
- Retry 3 lần nếu fail

```bash
# Kiểm tra health status
docker-compose ps
```

## 🛠️ Customization

### Environment Variables

Tạo file `.env` để override các biến môi trường:

```env
# Frontend
VITE_API_URL=http://localhost:3001
NODE_ENV=development

# Backend
PORT=3001
NODE_ENV=development
```

### Ports

Để thay đổi ports, sửa trong `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Thay đổi port frontend
  backend:
    ports:
      - "8001:3001"  # Thay đổi port backend
```

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Safari/Browser không thể kết nối localhost:3004**
   ```bash
   # Kiểm tra health của services
   ./health-check.sh

   # Restart frontend container
   docker restart khovaiton-frontend-dev

   # Kiểm tra Vite server logs
   docker logs khovaiton-frontend-dev
   ```

2. **Port đã được sử dụng**
   ```bash
   # Kiểm tra process đang dùng port
   lsof -i :3004
   lsof -i :3001

   # Kill process
   kill -9 <PID>
   ```

3. **Docker không khởi động được**
   ```bash
   # Restart Docker Desktop
   # Hoặc kiểm tra Docker daemon
   docker info
   ```

4. **Build fails**
   ```bash
   # Xóa cache và rebuild
   docker system prune -a
   docker-compose build --no-cache
   ```

5. **Container không healthy**
   ```bash
   # Kiểm tra logs
   docker-compose logs <service-name>

   # Kiểm tra health endpoint
   curl http://localhost:3001/api/health
   ```

### Performance tuning

1. **Tăng memory cho Docker Desktop**
   - Settings → Resources → Memory → 4GB+

2. **Enable BuildKit**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

3. **Use multi-stage builds** (đã được implement)

## 📚 Tài liệu tham khảo

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Vite Docker Guide](https://vitejs.dev/guide/static-deploy.html)

## 🤝 Đóng góp

Khi thêm features mới:
1. Update Dockerfile nếu cần dependencies mới
2. Update docker-compose.yml nếu cần services mới
3. Test cả development và production builds
4. Update documentation này
