// Import commands.js using ES2015 syntax:
import './commands'

// Augment Cypress namespace with custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      // Add your custom commands here, for example:
      // login(email: string, password: string): Chainable<void>
    }
  }
} 