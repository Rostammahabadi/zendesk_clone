/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_LANGSERVER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
