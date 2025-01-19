import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { App } from './App'
import { mockAuthSession, mockAuthError } from './test/helpers/auth'

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows protected content when authenticated', async () => {
    mockAuthSession()
    render(<App />)
    
    // Initially shows loading
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
    
    // Then shows protected content
    await waitFor(() => {
      expect(screen.getByText(/Countries/i)).toBeInTheDocument()
    })
  })

  it('redirects to login when not authenticated', async () => {
    mockAuthError()
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument()
    })
  })
}) 