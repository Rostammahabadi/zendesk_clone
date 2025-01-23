import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './styles/globals.css'
import { App } from './App'
import { initSentry } from './config/sentry'
// Initialize Sentry
initSentry();

// Wrap App with Sentry error boundary
const SentryApp = Sentry.withErrorBoundary(App, {
  fallback: (props) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <button 
          onClick={() => props.resetError()} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    </div>
  ),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryApp />
  </StrictMode>,
);
