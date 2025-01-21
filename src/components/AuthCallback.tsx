import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import * as Sentry from "@sentry/react";
import { SignupWalkthrough } from './signup/SignupWalkthrough';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'agent' | 'customer';
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

export const AuthCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) {
          navigate('/login')
          return
        }

        // Get user's email domain
        const emailDomain = session.user.email?.split('@')[1]
        if (!emailDomain) {
          throw new Error('Invalid email format')
        }

        // Check if company exists with this domain
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('domain', emailDomain)

        if (companyError) throw companyError

        // If no company found with this domain, sign out and redirect to error
        if (!companies || companies.length === 0) {
          await supabase.auth.signOut()
          navigate('/login?error=invalid_domain')
          return
        }

        // Check if user already has a profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError
        }

        // If user doesn't have a profile, create one and show walkthrough
        if (!existingProfile) {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              company_id: companies[0].id,
              role: 'agent'
            })
            .select()
            .single()

          if (createError) throw createError
          setUserProfile(newProfile)
          setShowWalkthrough(true)
        } else {
          // Update user metadata with their role
          await supabase.auth.updateUser({
            data: { role: existingProfile.role.toLowerCase() }
          })
          
          // Navigate to appropriate dashboard
          navigate(`/${existingProfile.role.toLowerCase()}/dashboard`)
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        Sentry.captureException(error, {
          tags: { component: 'AuthCallback' },
          extra: { location: location.hash }
        })
        navigate('/auth/auth-code-error')
      }
    }

    if (location.hash || location.search) {
      handleCallback()
    }
  }, [location.hash, location.search, navigate])

  const handleWalkthroughComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      // Get user's role from users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userError) throw userError
      if (!user) throw new Error('User not found')

      // Update user metadata with role
      await supabase.auth.updateUser({
        data: { role: user.role.toLowerCase() }
      })

      // Navigate to role-specific dashboard
      navigate(`/${user.role.toLowerCase()}/dashboard`)
    } catch (error) {
      console.error('Error completing setup:', error)
      Sentry.captureException(error, {
        tags: { component: 'AuthCallback' }
      })
      // Navigate to default dashboard if role fetch fails
      navigate('/dashboard')
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin" />
            <p className="text-lg text-gray-600">Verifying your account...</p>
          </div>
        </div>
      </div>

      {userProfile && (
        <SignupWalkthrough 
          open={showWalkthrough} 
          onOpenChange={(open) => {
            setShowWalkthrough(open)
            if (!open) handleWalkthroughComplete()
          }}
          userProfile={userProfile}
        />
      )}
    </>
  )
} 