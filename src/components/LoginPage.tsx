import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface AuthError {
  message: string
}

interface ValidationErrors {
  email?: string
  password?: string[]
}

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSignUp, setIsSignUp] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)')
    }
    return errors
  }

  // Validate inputs as user types
  useEffect(() => {
    const errors: ValidationErrors = {}
    
    if (email && !validateEmail(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (password) {
      const passwordErrors = validatePassword(password)
      if (passwordErrors.length > 0) {
        errors.password = passwordErrors
      }
    }

    setValidationErrors(errors)
  }, [email, password])

  const isFormValid = (): boolean => {
    return (
      email.length > 0 &&
      password.length > 0 &&
      validateEmail(email) &&
      validatePassword(password).length === 0
    )
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        
        setSuccessMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error) {
      setError((error as AuthError).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (error) {
      setError((error as AuthError).message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-sm">
        <div className="text-center">
          
          {/* Logo */}
          <div className="mt-0 mb-4 flex justify-center">
            <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.777 38.979h-6.758A2.021 2.021 0 0 0 15.998 41v41.355c0 1.116.905 2.021 2.021 2.021h40.753a2.021 2.021 0 0 0 2.021-2.021V41a2.021 2.021 0 0 0-2.021-2.021H43.326V28.354H62.77a8.648 8.648 0 0 1 8.648 8.648v49.351a8.648 8.648 0 0 1-8.648 8.648H14.021a8.648 8.648 0 0 1-8.648-8.648V37.002a8.648 8.648 0 0 1 8.648-8.648h10.756v10.625z" fill="url(#logo-gradient)" />
              <path d="M75.223 61.021h6.758A2.021 2.021 0 0 0 84.002 59V17.646a2.021 2.021 0 0 0-2.021-2.021H41.228a2.021 2.021 0 0 0-2.021 2.021V59c0 1.116.905 2.021 2.021 2.021h15.446v10.625H37.23a8.648 8.648 0 0 1-8.648-8.648v-49.35A8.648 8.648 0 0 1 37.23 5h48.749a8.648 8.648 0 0 1 8.648 8.648v49.351a8.648 8.648 0 0 1-8.648 8.648H75.223V61.021z" fill="url(#logo-gradient)" />
              <defs>
                <linearGradient id="logo-gradient" x1="5" y1="95" x2="95" y2="5" gradientUnits="userSpaceOnUse">
                  <stop offset="0.05" stopColor="#85a2f5" />
                  <stop offset="0.95" stopColor="#134be7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* ASSISTLY Text */}
          <h2 className="text-5xl font-bold text-gray-900 mb-8">ASSISTLY</h2>

          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h1>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setSuccessMessage(null)
                setValidationErrors({})
              }}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
          {successMessage && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  validationErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900"
                >
                  {isPasswordVisible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <div className="mt-1 text-sm text-red-600">
                  {validationErrors.password.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'Sign up' : 'Sign in')}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  )
} 