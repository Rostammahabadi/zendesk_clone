import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export const AuthCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken) {
        console.error('No access token found')
        navigate('/auth/auth-code-error')
        return
      }

      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        
        if (error) throw error
        if (data.session) {
          navigate('/')
        } else {
          throw new Error('No session established')
        }
      } catch (error) {
        console.error('Auth error:', error)
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