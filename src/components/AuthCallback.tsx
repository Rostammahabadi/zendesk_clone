import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import * as Sentry from "@sentry/react";

export const AuthCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (!accessToken) {
          const error = new Error('No access token found in callback URL')
          Sentry.captureException(error, {
            tags: { component: 'AuthCallback' }
          })
          navigate('/auth/auth-code-error')
          return
        }

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        
        if (error) throw error
        if (!data.session) {
          throw new Error('No session established')
        }
        
        navigate('/')
      } catch (error) {
        console.error('Auth callback error:', error)
        Sentry.captureException(error, {
          tags: { component: 'AuthCallback' },
          extra: { location: location.hash }
        })
        navigate('/auth/auth-code-error')
      }
    }

    if (location.hash) {
      handleCallback()
    }
  }, [location.hash, navigate])

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      Processing authentication...
    </div>
  )
} 