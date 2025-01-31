interface EnvConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  googleClientId: string
  environment: 'development' | 'production' | 'test'
  sentryDsn: string
  langserverUrl: string
}

const getEnvironmentVariable = (key: string): string => {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export const env: EnvConfig = {
  supabaseUrl: getEnvironmentVariable('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnvironmentVariable('VITE_SUPABASE_ANON_KEY'),
  googleClientId: getEnvironmentVariable('VITE_GOOGLE_CLIENT_ID'),
  environment: (import.meta.env.MODE || 'development') as EnvConfig['environment'],
  sentryDsn: getEnvironmentVariable('VITE_SENTRY_DSN'),
  langserverUrl: getEnvironmentVariable('VITE_LANGSERVER_URL'),
} 