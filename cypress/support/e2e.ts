/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent TypeScript errors in test files
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here
      login(email: string, password: string): Chainable<void>
      // Add more custom commands as needed
    }
  }
} 