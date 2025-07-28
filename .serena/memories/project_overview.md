# Kho Vải Tồn - Project Overview

## Project Description
Kho Vải Tồn is a React TypeScript web application for fabric inventory management with image support and customer lead capture.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM
- **Testing**: Vitest + Testing Library
- **Build**: Vite
- **Deployment**: Vercel

## Key Features
1. **Fabric Inventory Management**
   - Display fabric list with filtering
   - Image support via Cloudinary
   - Real-time search and filtering
   - Fabric type categorization

2. **Image Management**
   - Cloudinary integration for image storage
   - Image upload and replacement
   - Automatic image mapping by fabric codes
   - Image status tracking (with/without images)

3. **Customer Lead Capture**
   - Marketing forms with validation
   - Google Sheets integration for data storage
   - Lead tracking and management

4. **Data Sources**
   - Excel file import (anhhung.xlsx)
   - JSON data processing
   - Real-time data synchronization

## Architecture
```
src/
├── app/                 # App configuration and providers
├── components/          # Reusable UI components
├── features/           # Feature-specific modules
│   ├── inventory/      # Fabric inventory features
│   └── marketing/      # Marketing and lead capture
├── services/           # API and external service integrations
├── shared/             # Shared utilities and types
├── data/               # Static data and mappings
└── tools/              # Development and admin tools
```

## External Integrations
1. **Cloudinary**: Image storage and management
2. **Google Sheets**: Customer data storage
3. **Vercel**: Hosting and deployment

## Development Workflow
1. `npm run dev` - Start development server
2. `npm run test` - Run tests
3. `npm run lint:fix` - Fix linting issues
4. `npm run build` - Build for production
5. `npm run deploy` - Deploy to Vercel

## Important Files
- `src/main.tsx` - Application entry point
- `src/app/App.tsx` - Main app component
- `src/data/fabrics_data.json` - Fabric inventory data
- `src/services/cloudinaryService.ts` - Image management
- `src/services/googleSheetsService.ts` - Lead storage
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
