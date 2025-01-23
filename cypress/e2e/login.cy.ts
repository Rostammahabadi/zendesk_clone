describe('Login Flow', () => {
  beforeEach(() => {
    cy.mockSupabaseAuth()
    cy.visit('/login')
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

  it('handles invalid credentials', () => {
    cy.mockSupabaseAuth({ loginSuccess: false })
    cy.get('input[type="email"]').type('test@acme.com')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginRequest')
    cy.get('.text-red-600').should('contain', 'Invalid login credentials')
  })

  it('successfully logs in as admin', () => {
    cy.get('input[type="email"]').type('admin@acme.com')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginRequest')
    cy.wait('@getUser')
    cy.url().should('include', '/admin/dashboard')
  })

  it('successfully logs in as agent', () => {
    // Mock response with agent role
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        user_metadata: {
          role: 'agent'
        }
      }
    }).as('getUser')

    cy.get('input[type="email"]').type('agent@acme.com')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginRequest')
    cy.wait('@getUser')
    cy.url().should('include', '/agent/dashboard')
  })

  it('successfully logs in as customer', () => {
    // Mock response with customer role
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: {
        id: 'test-user-id',
        user_metadata: {
          role: 'customer'
        }
      }
    }).as('getUser')

    cy.get('input[type="email"]').type('customer@acme.com')
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginRequest')
    cy.wait('@getUser')
    cy.url().should('include', '/customer/dashboard')
  })

  it('allows navigation to signup page', () => {
    cy.contains('button', 'Sign up').click()
    cy.get('h1').should('contain', 'Create your account')
  })

  it('allows Google sign in', () => {
    cy.contains('button', 'Sign in with Google').should('exist')
    cy.contains('button', 'Sign in with Google').should('not.be.disabled')
    cy.contains('button', 'Sign in with Google').click()
    cy.wait('@oAuthRequest')
  })

  it('shows password when toggle is clicked', () => {
    cy.get('input[type="password"]').type('ValidPass123!')
    cy.get('input[type="password"]').should('have.attr', 'type', 'password')
    cy.get('button').contains('Show password').click()
    cy.get('input[type="text"]').should('have.value', 'ValidPass123!')
  })
}) 