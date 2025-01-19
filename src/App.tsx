import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './components/LoginPage'
import { AuthCallback } from './components/AuthCallback'
import { CountriesList } from './components/CountriesList'
import { ProtectedRoute } from './components/ProtectedRoute'
import { supabase } from './lib/supabaseClient'
import * as Sentry from "@sentry/react";

const SentryErrorBoundary = Sentry.ErrorBoundary;

export const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkSession()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return (
    <SentryErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/auth-code-error" element={
            <div>Authentication error. Please try again.</div>
          } />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } />
          <Route 
            path="/" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CountriesList />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SentryErrorBoundary>
  )
}

const ErrorFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  </div>
);
