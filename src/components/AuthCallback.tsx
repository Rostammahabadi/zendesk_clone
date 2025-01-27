import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import * as Sentry from "@sentry/react";
import { toast } from 'sonner'

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
  const [_, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('Session error:', sessionError)
          toast.error('Failed to get session')
          navigate('/login')
          return
        }
        
        if (!session) {
          console.error('No session found')
          navigate('/login')
          return
        }

        // Get user's email domain
        const emailDomain = session.user.email?.split('@')[1].toLowerCase()
        if (!emailDomain) {
          console.error('Invalid email format')
          toast.error('Invalid email format')
          navigate('/login')
          return
        }

        // First check if user already exists in our database
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user:', userError)
          toast.error('Failed to fetch user data')
          navigate('/login')
          return
        }

        if (existingUser) {
          // User exists - update metadata and redirect to appropriate dashboard
          try {
            await supabase.auth.updateUser({
              data: { 
                role: existingUser.role.toLowerCase(),
                company_id: existingUser.company_id
              }
            })

            // Clear cached user data to force a fresh fetch
            localStorage.removeItem('userData')

            // Redirect to appropriate dashboard
            if (existingUser.role === 'agent') {
              navigate('/agent/dashboard')
            } else if (existingUser.role === 'admin') {
              navigate('/admin/dashboard')
            } else if (existingUser.role === 'customer') {
              navigate('/customer/dashboard')
            } else {
              navigate('/dashboard')
            }
          } catch (updateError) {
            console.error('Error updating user:', updateError)
            toast.error('Failed to update user data')
            navigate('/login')
          }
          return
        }

        // Handle new user creation based on domain
        if (emailDomain === 'gauntletai.com') {
          // Get company ID for gauntletai.com
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('name', 'GauntletAI')
            .single()

          if (companyError) {
            console.error('Error fetching company:', companyError)
            toast.error('Failed to fetch company data')
            navigate('/login')
            return
          }

          // Create new gauntletai.com user as agent
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

          if (createError) {
            console.error('Error creating user:', createError)
            toast.error('Failed to create user')
            navigate('/login')
            return
          }

          // Update user metadata
          try {
            await supabase.auth.updateUser({
              data: { 
                role: 'agent',
                company_id: company.id
              }
            })

            // Add user role
            await supabase.from('user_roles').insert({
              user_id: newProfile.id,
              role: 'agent',
            })

            setUserProfile(newProfile)
          } catch (updateError) {
            console.error('Error updating user:', updateError)
            toast.error('Failed to update user data')
            navigate('/login')
          }
        } else {
          // Create new non-gauntletai.com user as customer
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email,
              role: 'customer'
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating user:', createError)
            toast.error('Failed to create user')
            navigate('/login')
            return
          }

          // Update user metadata
          try {
            await supabase.auth.updateUser({
              data: { 
                role: 'customer'
              }
            })

            // Add user role
            await supabase.from('user_roles').insert({
              user_id: newProfile.id,
              role: 'customer',
            })

            setUserProfile(newProfile)
          } catch (updateError) {
            console.error('Error updating user:', updateError)
            toast.error('Failed to update user data')
            navigate('/login')
          }
        }

        // All new users go to onboarding
        navigate('/onboarding')

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
    handleCallback()
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