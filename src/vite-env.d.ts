/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID: string
  readonly VITE_GOOGLE_DRIVE_API_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_GOOGLE_DRIVE_SYNC: string
  readonly VITE_ENABLE_BATCH_IMPORT: string
  readonly VITE_ENABLE_REAL_TIME_SYNC: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_IMAGE_CACHE_TTL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_MAX_IMAGE_SIZE: string
  readonly VITE_ENABLE_CSP: string
  readonly VITE_ALLOWED_ORIGINS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
