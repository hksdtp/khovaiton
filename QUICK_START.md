# 🚀 Khởi động nhanh - Kho Vải Tồn

## Bước 1: Khởi động Docker containers

```bash
# Development mode (khuyến nghị cho phát triển)
./docker-start.sh dev

# Production mode
./docker-start.sh prod
```

## Bước 2: Kiểm tra trạng thái

```bash
# Kiểm tra health của tất cả services
./health-check.sh
```

## Bước 3: Truy cập ứng dụng

- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Các lệnh hữu ích

```bash
# Xem logs
./docker-start.sh logs

# Dừng containers
./docker-start.sh stop

# Restart
./docker-start.sh restart dev

# Dọn dẹp
./docker-start.sh clean
```

## Khắc phục sự cố nhanh

### Nếu browser không kết nối được:
```bash
./health-check.sh
docker restart khovaiton-frontend-dev
```

### Nếu port bị chiếm:
```bash
lsof -i :3004
lsof -i :3001
# Kill process nếu cần: kill -9 <PID>
```

### Rebuild từ đầu:
```bash
./docker-start.sh clean
./docker-start.sh dev
```

---

📖 **Xem thêm**: [DOCKER_README.md](./DOCKER_README.md) để biết chi tiết đầy đủ.
