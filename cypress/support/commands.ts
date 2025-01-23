/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>
    mockSupabaseAuth(options?: {
      signUpSuccess?: boolean
      existingEmail?: boolean
      loginSuccess?: boolean
      error?: string
    }): Chainable<void>
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('mockSupabaseAuth', (options = {}) => {
  const {
    signUpSuccess = true,
    existingEmail = false,
    loginSuccess = true,
    error = null
  } = options

  const mockUserId = 'c2b952a7-b333-4f77-bea5-d23e8ddaf4ff'
  const mockEmail = 'sarah.chen@company.com'
  const mockCompanyId = 'fc4e47ce-e1d8-480d-bc3f-787f46f77b1a'

  // Mock signup endpoint with redirect_to parameter
  cy.intercept('POST', '**/auth/v1/signup*', (req) => {
    if (error) {
      req.reply({
        statusCode: 400,
        body: {
          error: error,
          message: error
        }
      })
    } else if (existingEmail) {
      // Supabase returns 200 for existing emails to prevent email enumeration
      req.reply({
        statusCode: 200,
        body: {
          "id": mockUserId,
          "aud": "authenticated",
          "role": "",
          "email": mockEmail,
          "phone": "",
          "confirmation_sent_at": "2025-01-23T12:48:08.311062852Z",
          "app_metadata": {
            "provider": "email",
            "providers": [
              "email"
            ]
          },
          "user_metadata": {},
          "identities": [],
          "created_at": "2025-01-23T12:48:08.311062852Z",
          "updated_at": "2025-01-23T12:48:08.311062852Z",
          "is_anonymous": false
        }
      })
    } else if (signUpSuccess) {
      req.reply({
        statusCode: 200,
        body: {
          user: {
            id: mockUserId,
            email: req.body?.email,
            created_at: new Date().toISOString()
          },
          session: null
        }
      })
    }
  }).as('signUpRequest')

  // Mock login endpoint
  cy.intercept('POST', '**/auth/v1/token*', (req) => {
    if (!loginSuccess) {
      req.reply({
        statusCode: 400,
        body: {
          error: 'Invalid login credentials',
          message: 'Invalid login credentials'
        }
      })
    } else {
      req.reply({
        statusCode: 200,
        body: {
          access_token: 'fake-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'fake-refresh-token',
          user: {
            id: mockUserId,
            aud: "authenticated",
            role: "authenticated",
            email: mockEmail,
            email_confirmed_at: "2025-01-23T13:02:58.055409Z",
            phone: "",
            confirmed_at: "2025-01-23T13:02:58.055409Z",
            last_sign_in_at: "2025-01-23T13:03:06.989448Z",
            app_metadata: {
              provider: "email",
              providers: ["email"]
            },
            user_metadata: {
              email_verified: true
            },
            identities: [
              {
                identity_id: "e60dea55-5dd3-4dad-b4fb-2f814e373bf2",
                id: mockUserId,
                user_id: mockUserId,
                identity_data: {
                  email: mockEmail,
                  email_verified: false,
                  phone_verified: false,
                  sub: mockUserId
                },
                provider: "email",
                last_sign_in_at: "2025-01-21T18:16:49.319465Z",
                created_at: "2025-01-21T18:16:49.319524Z",
                updated_at: "2025-01-21T18:16:49.319524Z",
                email: mockEmail
              }
            ],
            created_at: "2025-01-21T18:16:49.308725Z",
            updated_at: "2025-01-23T13:03:06.994116Z",
            is_anonymous: false
          }
        }
      })
    }
  }).as('loginRequest')

  // Mock get user endpoint for session check
  cy.intercept('GET', '**/auth/v1/user', (req) => {
    if (!loginSuccess) {
      req.reply({
        statusCode: 401,
        body: {
          error: 'Unauthorized',
          message: 'Unauthorized'
        }
      })
    } else {
      req.reply({
        statusCode: 200,
        body: {
          id: mockUserId,
          aud: "authenticated",
          role: "authenticated",
          email: mockEmail,
          email_confirmed_at: "2025-01-23T13:02:58.055409Z",
          phone: "",
          confirmed_at: "2025-01-23T13:02:58.055409Z",
          last_sign_in_at: "2025-01-23T13:03:06.989448Z",
          app_metadata: {
            provider: "email",
            providers: ["email"]
          },
          user_metadata: {
            email_verified: true
          },
          identities: [
            {
              identity_id: "e60dea55-5dd3-4dad-b4fb-2f814e373bf2",
              id: mockUserId,
              user_id: mockUserId,
              identity_data: {
                email: mockEmail,
                email_verified: false,
                phone_verified: false,
                sub: mockUserId
              },
              provider: "email",
              last_sign_in_at: "2025-01-21T18:16:49.319465Z",
              created_at: "2025-01-21T18:16:49.319524Z",
              updated_at: "2025-01-21T18:16:49.319524Z",
              email: mockEmail
            }
          ],
          created_at: "2025-01-21T18:16:49.308725Z",
          updated_at: "2025-01-23T13:03:06.994116Z",
          is_anonymous: false
        }
      })
    }
  }).as('getUser')

  // Mock the first users table query
  cy.intercept('GET', '**/rest/v1/users?select=*&id=eq.test-user-id', {
    statusCode: 200,
    body: [{
      id: mockUserId,
      aud: "authenticated",
      role: "authenticated",
      email: mockEmail,
      email_confirmed_at: "2025-01-23T13:02:58.055409Z",
      phone: "",
      confirmed_at: "2025-01-23T13:02:58.055409Z",
      last_sign_in_at: "2025-01-23T13:03:06.989448Z",
      app_metadata: {
        provider: "email",
        providers: ["email"]
      },
      user_metadata: {
        email_verified: true
      },
      identities: [{
        identity_id: "e60dea55-5dd3-4dad-b4fb-2f814e373bf2",
        id: mockUserId,
        user_id: mockUserId,
        identity_data: {
          email: mockEmail,
          email_verified: false,
          phone_verified: false,
          sub: mockUserId
        },
        provider: "email",
        last_sign_in_at: "2025-01-21T18:16:49.319465Z",
        created_at: "2025-01-21T18:16:49.319524Z",
        updated_at: "2025-01-21T18:16:49.319524Z",
        email: mockEmail
      }],
      created_at: "2025-01-21T18:16:49.308725Z",
      updated_at: "2025-01-23T13:03:06.994116Z",
      is_anonymous: false
    }]
  }).as('getUserFirst')

  // Mock the second users table query
  cy.intercept('GET', `**/rest/v1/users?select=*&id=eq.${mockUserId}`, {
    statusCode: 200,
    body: [{
      id: mockUserId,
      email: mockEmail,
      first_name: "Sarah",
      last_name: "Chen",
      role: "agent",
      company_id: mockCompanyId,
      created_at: "2025-01-21T18:19:50.026081+00:00",
      updated_at: "2025-01-21T18:19:50.026081+00:00",
      title: null,
      avatar_url: null,
      phone_number: null
    }]
  }).as('getUserSecond')

  // Mock OAuth sign in with redirect_to parameter
  cy.intercept('POST', '**/auth/v1/authorize*', {
    statusCode: 200,
    body: {
      provider: 'google',
      url: 'https://accounts.google.com/o/oauth2/v2/auth'
    }
  }).as('oAuthRequest')
}) 