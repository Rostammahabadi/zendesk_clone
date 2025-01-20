import { supabase } from '../../lib/supabaseClient'
import { vi } from 'vitest'
import { AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js'

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockSession = {
  access_token: 'fake-token',
  refresh_token: 'fake-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser
}

export const mockAuthSession = () => {
  // Mock getSession
  vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: { session: mockSession },
    error: null
  })

  // Mock onAuthStateChange
  vi.spyOn(supabase.auth, 'onAuthStateChange').mockImplementation(
    (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
      callback('SIGNED_IN', mockSession)
      return {
        data: { subscription: { id: 'mock-sub', callback: () => {}, unsubscribe: () => {} } },
        error: null
      }
    }
  )

  // Mock signInWithPassword
  vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({
    data: { user: mockUser, session: mockSession },
    error: null
  })

  // Mock setSession for AuthCallback
  vi.spyOn(supabase.auth, 'setSession').mockResolvedValue({
    data: { 
      user: mockUser,
      session: mockSession 
    },
    error: null
  })
}

export const mockAuthError = () => {
  vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: { session: null },
    error: new AuthError('Auth error', 400, 'invalid_credentials')
  })
} 