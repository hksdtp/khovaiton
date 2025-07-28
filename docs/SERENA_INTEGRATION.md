# Serena Integration Guide - Kho Vải Tồn

## Tổng quan

Serena là một coding agent toolkit mạnh mẽ đã được tích hợp vào dự án Kho Vải Tồn để hỗ trợ phát triển và bảo trì ứng dụng.

## Tính năng chính

### 🔧 Khả năng cốt lõi
- **Semantic code retrieval**: Tìm kiếm và phân tích code thông minh
- **Code editing**: Chỉnh sửa code ở mức symbol
- **Shell execution**: Thực thi lệnh terminal
- **Project management**: Quản lý dự án và memories
- **Testing support**: Hỗ trợ chạy test và kiểm tra lỗi

### 🎯 Phù hợp với dự án
- Hỗ trợ TypeScript/React
- Tích hợp với Vite build system
- Hiểu cấu trúc component-based
- Hỗ trợ Tailwind CSS
- Tương thích với Vercel deployment

## Cài đặt và Cấu hình

### Phương pháp 1: Claude Desktop (Khuyến nghị)

```bash
# Chạy script setup tự động
./scripts/setup-serena.sh
```

Sau đó:
1. Restart Claude Desktop
2. Mở conversation mới
3. Chạy lệnh: "read Serena's initial instructions"

### Phương pháp 2: Claude Code

```bash
# Chạy script setup cho Claude Code
./scripts/setup-claude-code.sh
```

Sau đó:
1. Khởi động Claude Code: `claude`
2. Chạy: `/mcp__serena__initial_instructions`

### Phương pháp 3: Manual Setup

```bash
# Cài đặt Serena
uvx --from git+https://github.com/oraios/serena serena-mcp-server

# Index project
uvx --from git+https://github.com/oraios/serena index-project
```

## Sử dụng Serena

### Lệnh cơ bản

```
# Kích hoạt project
"Activate the khovaiton project"

# Xem cấu trúc project
"Show me the project structure"

# Phân tích component
"Analyze the FabricInventory component"

# Chạy development server
"Start the development server"

# Kiểm tra lỗi TypeScript
"Check for TypeScript errors"

# Chạy tests
"Run the test suite"
```

### Workflow phát triển

1. **Phân tích code**:
   ```
   "Help me understand the Cloudinary integration"
   "Show me how the fabric filtering works"
   "Analyze the Google Sheets service"
   ```

2. **Debugging**:
   ```
   "Check for any console errors"
   "Run linting and show issues"
   "Test the image upload functionality"
   ```

3. **Refactoring**:
   ```
   "Help me refactor the FabricCard component"
   "Optimize the image loading performance"
   "Add error handling to the API calls"
   ```

4. **Testing**:
   ```
   "Write tests for the fabric filtering logic"
   "Test the Cloudinary image upload"
   "Run coverage report"
   ```

## Cấu hình Project

### File cấu hình chính
- `.serena/project.yml`: Cấu hình project-specific
- `~/.serena/serena_config.yml`: Cấu hình global

### Cấu trúc quan trọng
```
src/
├── components/          # React components
├── features/           # Feature modules
├── services/           # API services
├── shared/            # Shared utilities
└── data/              # Static data

scripts/               # Build và utility scripts
public/               # Static assets
```

## Dashboard và Monitoring

Serena cung cấp web dashboard tại: `http://localhost:24282/dashboard/`

### Tính năng dashboard:
- Xem logs real-time
- Monitor tool usage
- Quản lý memories
- Shutdown Serena server

## Memories và Context

Serena tự động tạo memories cho project:
- Cấu trúc codebase
- Patterns thường dùng
- Integration details
- Best practices

### Quản lý memories:
```
"Show me the project memories"
"Create a memory about the new feature"
"Update the deployment memory"
```

## Best Practices

### 1. Workflow Development
- Luôn bắt đầu từ clean git state
- Sử dụng Serena để phân tích trước khi code
- Chạy tests sau mỗi thay đổi
- Commit thường xuyên

### 2. Code Quality
- Sử dụng Serena để check linting
- Format code trước commit
- Review TypeScript errors
- Maintain test coverage

### 3. Deployment
- Test local trước khi deploy
- Sử dụng Serena để build production
- Verify Vercel deployment
- Monitor production logs

## Troubleshooting

### Lỗi thường gặp

1. **Language server không khởi động**:
   ```bash
   # Restart language server
   "Restart the TypeScript language server"
   ```

2. **Dashboard không mở**:
   - Check port 24282 có bị conflict
   - Restart Serena server

3. **Tools không hoạt động**:
   - Verify project activation
   - Check Serena logs
   - Restart Claude Desktop/Code

### Debug commands
```
"Show current Serena configuration"
"Check active project status"
"Display tool usage statistics"
"Show recent error logs"
```

## Tích hợp với Workflow hiện tại

### Development
- Serena hỗ trợ `npm run dev`
- Tự động detect file changes
- Integration với Vite HMR

### Testing
- Chạy Vitest tests
- Coverage reporting
- Component testing

### Deployment
- Build production với Vite
- Deploy to Vercel
- Environment validation

## Lợi ích cho Dự án

1. **Tăng hiệu quả phát triển**: AI-powered code analysis
2. **Giảm bugs**: Automated testing và validation
3. **Cải thiện code quality**: Linting và formatting
4. **Faster debugging**: Intelligent error detection
5. **Better documentation**: Auto-generated insights

## Hỗ trợ

- **Documentation**: [Serena GitHub](https://github.com/oraios/serena)
- **Issues**: Report qua GitHub issues
- **Community**: Discord/GitHub discussions

---

*Serena được tích hợp để hỗ trợ phát triển Kho Vải Tồn một cách hiệu quả và chuyên nghiệp.*
