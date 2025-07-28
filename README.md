# Kho Vải Tồn - Fabric Inventory Management System

Hệ thống quản lý kho vải tồn hiện đại được xây dựng với React, TypeScript và các công nghệ tiên tiến nhất.

## 🤖 AI-Powered Development với Serena

Dự án này đã được tích hợp với **Serena** - một coding agent toolkit mạnh mẽ để hỗ trợ phát triển và bảo trì ứng dụng.

- 🧠 **Semantic Code Analysis**: Phân tích code thông minh ở mức symbol
- 🔧 **Intelligent Code Editing**: Chỉnh sửa code với AI assistance
- 🚀 **Automated Development**: Tự động hóa các tác vụ phát triển
- 📚 **Project Memory**: Lưu trữ và tái sử dụng kiến thức về project

👉 **[Xem hướng dẫn Serena](./SERENA_QUICK_START.md)** | **[Chi tiết tích hợp](./docs/SERENA_INTEGRATION.md)**

## ✨ Tính năng chính

- 🔍 **Tìm kiếm thông minh**: Tìm kiếm theo mã vải, tên sản phẩm, vị trí kho
- 🏷️ **Phân loại chi tiết**: Lọc theo loại vải, vị trí, trạng thái
- 📸 **Quản lý hình ảnh**: Upload và quản lý ảnh sản phẩm với Cloudinary
- ☁️ **Cloud Integration**: Tích hợp Cloudinary và Google Sheets
- 🔄 **Auto Image Mapping**: Map ảnh dựa trên mã vải tự động
- 📊 **Thống kê realtime**: Theo dõi tồn kho, trạng thái vải
- 🎨 **UI/UX hiện đại**: Glassmorphism design, animations mượt mà
- 📱 **Responsive**: Tối ưu cho mọi thiết bị

## 🏗️ Kiến trúc

### Cấu trúc thư mục
```
src/
├── app/                # Core application setup
│   ├── providers/      # Context providers (Query, Theme)
│   ├── router/         # React Router configuration
│   └── App.tsx         # Root component
│
├── features/           # Feature modules (domain-driven)
│   └── inventory/      # Fabric inventory feature
│       ├── api/        # API calls
│       ├── components/ # Feature components
│       ├── hooks/      # Custom hooks
│       ├── store/      # State management
│       ├── types/      # TypeScript types
│       └── index.ts    # Public API
│
├── shared/             # Shared across features
│   ├── components/     # Reusable components
│   ├── hooks/          # Shared hooks
│   ├── utils/          # Utilities
│   ├── types/          # Shared types
│   └── mocks/          # Mock data
│
├── common/             # Design system & layouts
│   ├── design-system/  # UI primitives
│   └── layouts/        # App layouts
│
├── infrastructure/     # Technical concerns
│   ├── api/            # API client
│   ├── storage/        # Storage utilities
│   └── monitoring/     # Error tracking
│
└── lib/                # Third-party configs
    ├── react-query/    # TanStack Query
    └── react-hook-form/ # Form handling
```

## 🛠️ Tech Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety (strict mode)
- **Vite** - Build tool với HMR

### State Management
- **TanStack Query** - Server state management
- **Zustand** - Client state management

### UI/UX
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Glassmorphism** - Modern UI design

### Development
- **ESLint + Prettier** - Code quality
- **Husky + lint-staged** - Pre-commit hooks
- **Vitest** - Testing framework

## 🚀 Bắt đầu

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd khovaiton

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Sync ảnh từ Google Drive (Ninh ơi!)
./scripts/quick_sync.sh
```

### Scripts có sẵn
```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run type-check   # Kiểm tra TypeScript
npm run lint         # Chạy ESLint
npm run lint:fix     # Fix ESLint errors
npm run test         # Chạy tests
npm run test:coverage # Test coverage report
```

## 📊 Performance

### Yêu cầu đạt được
- ✅ Bundle size < 200KB (gzipped)
- ✅ First Contentful Paint < 1.5s
- ✅ TypeScript strict mode
- ✅ Code splitting tự động
- ✅ Lazy loading cho routes

### Tối ưu hóa
- **Code Splitting**: Tự động với Vite
- **Lazy Loading**: React.lazy cho components
- **Memoization**: React.memo cho expensive components
- **Bundle Analysis**: `npm run build` để xem chi tiết

## 🧪 Testing

### Coverage yêu cầu: ≥80%
```bash
npm run test:coverage
```

### Test structure
- Unit tests cho utilities và hooks
- Component tests với React Testing Library
- Integration tests cho features

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3001
```

### TypeScript
- Strict mode enabled
- Path mapping configured
- Exact optional property types

## 📝 Coding Standards

### Dependency Rules
- Features không import trực tiếp từ nhau
- Features chỉ sử dụng shared/common/infrastructure
- Mỗi feature có public API qua index.ts

### Code Quality
- ESLint + Prettier enforced
- Pre-commit hooks
- TypeScript strict mode
- 80%+ test coverage

## 🚀 Deployment

### Build production
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

## 📈 Roadmap

- [ ] Advanced filtering và sorting
- [ ] Export/Import Excel
- [ ] Barcode scanning
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## 🚀 **PRODUCTION DEPLOYMENT**

### **🎯 Ready to Deploy!**
```bash
# Build for production
npm run build:production

# Deploy to Vercel
vercel --prod
```

### **📋 Quick Deployment Guide**
1. **Setup Google Drive API** (5 min) → [Guide](./docs/GOOGLE_DRIVE_API_SETUP.md)
2. **Deploy to Vercel** (10 min) → [Guide](./docs/DEPLOYMENT_GUIDE.md)
3. **Configure Domain** (15 min) → [Guide](./docs/DOMAIN_SETUP.md)
4. **Go Live!** → [Final Steps](./docs/FINAL_DEPLOYMENT_STEPS.md)

**Total time: ~45 minutes to go live! 🎉**

## ☁️ Google Drive Integration

### **Production (Online Sync)**
- ✅ **Auto-sync on startup**
- ✅ **Periodic sync** (30 minutes)
- ✅ **Real-time image loading**
- ✅ **Error handling & monitoring**

### **Development (Local Sync)**
```bash
# Sync tất cả ảnh từ Google Drive
./scripts/quick_sync.sh

# Test Drive access
python3 scripts/test_drive_access.py
```

### **Google Drive Configuration**
- **Folder**: https://drive.google.com/drive/folders/1YiRnl2CfccL6rH98S8UlWexgckV_dnbU
- **File naming**: Exact fabric code match
- **Formats**: .jpg, .png, .webp
- **API**: Google Drive API v3

### **Documentation**
- 🚀 [Final Deployment Steps](./docs/FINAL_DEPLOYMENT_STEPS.md)
- 🔑 [Google Drive API Setup](./docs/GOOGLE_DRIVE_API_SETUP.md)
- 🌐 [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- 🌍 [Domain Setup](./docs/DOMAIN_SETUP.md)
- 📘 [Local Image Import](./HUONG_DAN_IMPORT_ANH.md)
- ☁️ [Google Drive Guide](./HUONG_DAN_GOOGLE_DRIVE.md)
- 🤖 [Serena AI Integration](./docs/SERENA_INTEGRATION.md)

## 🤖 Serena AI Development Assistant

Dự án này sử dụng **Serena** - một coding agent toolkit mạnh mẽ để tăng tốc phát triển:

### 🚀 Quick Start với Serena

```bash
# Setup Serena với Claude Desktop (Khuyến nghị)
./scripts/setup-serena.sh

# Hoặc setup với Claude Code
./scripts/setup-claude-code.sh
```

### 💡 Lệnh Serena hữu ích

```
# Kích hoạt project
"Activate the khovaiton project"

# Phân tích codebase
"Show me the project structure"
"Help me understand the React components"
"Analyze the Cloudinary integration"

# Development workflow
"Run the development server"
"Check for TypeScript errors"
"Run the test suite"
"Show me any linting issues"

# Code assistance
"Help me refactor this component"
"Add error handling to this function"
"Write tests for the fabric filtering logic"
```

### 🌐 Serena Dashboard

Khi Serena đang chạy, bạn có thể truy cập dashboard tại:
**http://localhost:24282/dashboard/**

### 📚 Tài liệu Serena

- **[Quick Start Guide](./SERENA_QUICK_START.md)** - Bắt đầu nhanh với Serena
- **[Integration Guide](./docs/SERENA_INTEGRATION.md)** - Hướng dẫn tích hợp chi tiết
- **[Serena GitHub](https://github.com/oraios/serena)** - Repository chính thức

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.
