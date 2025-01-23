describe('Signup Flow', () => {
  beforeEach(() => {
    // Setup default auth mocks
    cy.mockSupabaseAuth()
    cy.visit('/login')
    // Click the sign up button to switch to signup mode
    cy.contains('button', 'Sign up').click()
  })

  it('shows validation errors for invalid email format', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('.text-red-600').should('contain', 'Please enter a valid email address')
  })

  it('enforces password requirements', () => {
    cy.get('input[type="email"]').type('test@acme.com')
    
    // Test too short password
    cy.get('input[type="password"]').type('short')
    cy.get('.text-red-600').should('contain', 'Password must be at least 8 characters long')
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Clear and test password without uppercase
    cy.get('input[type="password"]').clear().type('password123!')
    cy.get('.text-red-600').should('contain', 'Password must contain at least one uppercase letter')
    
    // Clear and test password without number
    cy.get('input[type="password"]').clear().type('Password!')
    cy.get('.text-red-600').should('contain', 'Password must contain at least one number')
    
    // Clear and test password without special character
    cy.get('input[type="password"]').clear().type('Password123')
    cy.get('.text-red-600').should('contain', 'Password must contain at least one special character')
  })

  it('handles existing email signup', () => {
    cy.mockSupabaseAuth({ existingEmail: true })
    cy.get('input[type="email"]').type('existing@acme.com')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@signUpRequest')
    cy.get('.text-green-600').should('contain', 'Check your email for the confirmation link!')
  })

  it('successfully creates new account', () => {
    const testEmail = `test${Date.now()}@acme.com`
    cy.get('input[type="email"]').type(testEmail)
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@signUpRequest')
    cy.get('.text-green-600').should('contain', 'Check your email for the confirmation link!')
  })

  it('handles signup error', () => {
    cy.mockSupabaseAuth({ error: 'Unable to validate email address: invalid domain' })
    cy.get('input[type="email"]').type('test@invalid.com')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@signUpRequest')
    cy.get('.text-red-600').should('contain', 'Unable to validate email address: invalid domain')
  })

  it('allows navigation to login page', () => {
    cy.contains('button', 'Sign in').click()
    cy.get('h1').should('contain', 'Sign in to your account')
  })

  // it('allows Google sign in', () => {
  //   cy.contains('button', 'Sign in with Google').should('exist')
  //   cy.contains('button', 'Sign in with Google').should('not.be.disabled')
  //   cy.contains('button', 'Sign in with Google').click()
  //   cy.wait('@oAuthRequest')
  // })
}) 