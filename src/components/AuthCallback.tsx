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

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        
        if (sessionError) throw sessionError
        if (!sessionData.session) {
          throw new Error('No session established')
        }

        // Get the user's email domain
        const userEmail = sessionData.session.user.email
        if (!userEmail) {
          throw new Error('No email found in user profile')
        }

        const emailDomain = userEmail.split('@')[1]

        // Check if the domain exists in our companies table
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('domain')
          .eq('domain', emailDomain)

        if (companiesError) throw companiesError

        // If no company found with this domain, sign out and redirect to error
        if (!companies || companies.length === 0) {
          await supabase.auth.signOut()
          navigate('/login?error=invalid_domain')
          return
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin" />
          <p className="text-lg text-gray-600">Verifying your account...</p>
        </div>
      </div>
    </div>
  )
} 