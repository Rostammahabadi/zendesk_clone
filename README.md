# Modern Help Desk System

A comprehensive help desk solution built with React, TypeScript, and Supabase, featuring AI-powered customer support capabilities.

## Features

- 🎫 Full-featured ticket management system
- 🤖 AI-powered customer assistant
- 🔐 Secure authentication with Supabase
- 👥 Multi-team support
- 🏢 Multi-company support
- 🏷️ Custom tagging system
- 📝 Rich text editing with Draft.js
- 🎨 Modern UI with Tailwind CSS
- 🌙 Dark mode support
- ⌨️ Full keyboard accessibility
- ⚡ Built with Vite + React + TypeScript

## Tech Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Draft.js (Rich Text Editing)
  - Sonner (Toast Notifications)
  - Lucide Icons
  
- **Backend:**
  - Supabase
  - Drizzle ORM
  - LangChain (AI Integration)
  
- **Infrastructure:**
  - AWS Amplify (Deployment)
  - Sentry (Error Tracking)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# .env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
```

3. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── homepage/
│   │   ├── CustomerAssistant.tsx
│   │   └── ChatBot.tsx
│   ├── tickets/
│   │   ├── TicketDetail.tsx
│   │   └── TicketList.tsx
│   └── common/
├── db/
│   └── schema/
│       └── tickets.ts
├── lib/
│   └── supabaseClient.ts
├── config/
│   └── env.ts
└── routes/
    └── index.tsx

langserve/           # AI Service
├── app/
│   └── server.py
└── Dockerfile
```

## Database Schema

The system uses a comprehensive database schema that includes:

- Companies (Multi-tenant support)
- Teams
- Users
- Tickets
- Tags
- Ticket Messages
- Ticket Events
- FAQs

## Development Guidelines

1. **Styling:**
   - Use Tailwind classes exclusively
   - Ensure dark mode compatibility
   - Follow responsive design principles

2. **Components:**
   - Keep components focused on single responsibility
   - Use named exports
   - Implement keyboard accessibility

3. **State Management:**
   - Utilize React Context for global state
   - Use hooks for shared logic
   - Implement proper error boundaries

4. **Database Operations:**
   - Use Drizzle ORM for database interactions
   - Implement proper error handling
   - Optimize queries for performance

## Testing

The project includes both unit and end-to-end testing:

### Unit Tests (Vitest)
```bash
npm test
npm run test:watch
npm run test:coverage
```

### End-to-End Tests (Cypress)
```bash
npm run cypress:open
npm run cypress:run
```

## AI Integration

The system includes an AI-powered customer assistant built with LangChain, featuring:

- Natural language ticket creation
- Automated FAQ suggestions
- Intelligent ticket routing
- Context-aware responses

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## License

MIT
