# Civic Registration Flow

A React + Vite civic registration and field-operations application migrated from the original builder export to Supabase.

## Stack
- React 18 + Vite
- Supabase Auth, PostgreSQL, Storage and Realtime
- Tailwind CSS + Radix UI
- Vercel-ready web deployment

## Local development (PowerShell)

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

Set these values in `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Never put a Supabase service-role/secret key in this frontend project.

## Build

```powershell
npm run lint
npm run typecheck
npm run build
```

The production build is in `dist/` and can be deployed to Vercel.

## Backend

The Supabase schema is created separately in the Supabase SQL Editor. Realtime publication and final RLS hardening should be completed before production.

The application keeps the existing UI/component structure while its data/auth layer uses Supabase.
