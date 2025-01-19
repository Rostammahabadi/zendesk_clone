describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('redirects unauthenticated users to login', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
    cy.get('h1').should('contain', 'Sign in to your account')
  })

  it('shows validation errors on invalid login attempt', () => {
    cy.get('input[type="email"]').type('invalid@email')
    cy.get('input[type="password"]').type('short')
    cy.get('.text-red-600').should('be.visible')
  })

  it('should disable Sign In button when password does not meet requirements', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('short')
    cy.get('button[type="submit"]').should('be.disabled')
    
    // Verify error messages are shown
    cy.get('.text-red-600').should('contain', 'Password must be at least 8 characters long')
    cy.get('.text-red-600').should('contain', 'Password must contain at least one uppercase letter')
    cy.get('.text-red-600').should('contain', 'Password must contain at least one number')
    cy.get('.text-red-600').should('contain', 'Password must contain at least one special character')
  })

  it('should enable Sign In button when password meets all requirements', () => {
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('SecurePass123!')
    cy.get('button[type="submit"]').should('not.be.disabled')
    cy.get('.text-red-600').should('not.exist')
  })
}) 