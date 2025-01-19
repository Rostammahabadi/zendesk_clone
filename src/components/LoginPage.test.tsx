import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginPage } from './LoginPage'
import { mockAuthSession } from '../test/helpers/auth'
import { BrowserRouter } from 'react-router-dom'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthSession()
  })

  it('handles successful login', async () => {
    renderWithRouter(<LoginPage />)
    
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'SecurePass123!' }
    })
    
    fireEvent.click(screen.getByTestId('submit-button'))
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
    })
  })
}) 