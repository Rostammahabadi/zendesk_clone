import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { AuthCallback } from './AuthCallback'
import { mockAuthSession } from '../test/helpers/auth'
import { BrowserRouter } from 'react-router-dom'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('AuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthSession()
  })

  it('handles successful auth callback', async () => {
    window.location.hash = '#access_token=fake-token&refresh_token=fake-refresh'
    
    renderWithRouter(<AuthCallback />)
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
    })
  })
}) 