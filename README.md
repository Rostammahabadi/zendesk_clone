# Countries List with Authentication

A modern web application built with React, TypeScript, and Supabase that displays a list of countries with secure authentication.

## Features

- 🔐 Secure authentication with Supabase
- 📧 Email/Password sign in/up
- 🔑 Google OAuth integration
- 🌍 Countries list display
- 🎨 Modern UI with Tailwind CSS
- ⚡ Built with Vite + React + TypeScript

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
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_SENTRY_DSN=your_sentry_dsn
```

3. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack

- React 18
- TypeScript
- Vite
- Supabase
- Tailwind CSS
- React Router DOM

## Project Structure

```
src/
├── components/
│   ├── LoginPage.tsx     # Authentication UI
│   ├── CountriesList.tsx # Main countries display
│   ├── AuthCallback.tsx  # OAuth handling
│   └── ProtectedRoute.tsx
├── lib/
│   └── supabaseClient.ts # Supabase config
├── config/
│   └── env.ts           # Environment config
└── App.tsx              # Main component
```

## Deployment

This project is configured for deployment with AWS Amplify. The `amplify.yml` file contains the necessary build settings.

## Development

1. Components use Tailwind CSS for styling
2. Authentication is handled through Supabase
3. Protected routes ensure authenticated access
4. Environment variables manage configuration
5. TypeScript ensures type safety

## License

MIT
