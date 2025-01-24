import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import * as Sentry from "@sentry/react";

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

interface Company {
  id: string;
  name: string;
}

export const AuthCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [_, setUserProfile] = useState<UserProfile | null>(null);

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
        const emailDomain = session.user.email?.split('@')[1].toLowerCase()
        if (!emailDomain) {
          throw new Error('Invalid email format')
        }

        // Check if company exists with this domain
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('domain', emailDomain)
          .single() as { data: Company | null; error: any }

        // Ignore PGRST116 (not found) error as it's expected for new domains
        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError
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

        // If user already has a profile, navigate to their dashboard
        if (existingProfile) {
          // Also update their metadata to ensure it's in sync
          await supabase.auth.updateUser({
            data: { 
              role: existingProfile.role.toLowerCase(),
              company_id: existingProfile.company_id
            }
          })

          // Clear cached user data to force a fresh fetch
          localStorage.removeItem('userData')

          if (existingProfile.role === 'agent') {
            navigate('/agent/dashboard')
          } else if (existingProfile.role === 'admin') {
            navigate('/admin/dashboard')
          } else if (existingProfile.role === 'customer') {
            navigate('/customer/dashboard')
          } else {
            navigate('/dashboard')
          }
          return
        }

        // For new users:
        if (company) {
          // Company exists - create user profile and show onboarding
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              company_id: company.id,
              role: 'agent'
            })
            .select()
            .single()

          if (createError) throw createError

          // Update user metadata right after creating profile
          await supabase.auth.updateUser({
            data: { 
              role: 'agent',
              company_id: company.id
            }
          })

          // Clear cached user data to force a fresh fetch
          localStorage.removeItem('userData')

          setUserProfile(newProfile)
          navigate('/onboarding')
        } else {
          // No company exists - redirect to signup walkthrough
          navigate('/signup')
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

    // Only run if we have either hash or search params
    if (location.hash || location.search) {
      handleCallback()
    }
  }, [navigate]) // Only depend on navigate since we access location inside

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
    </>
  )
} 