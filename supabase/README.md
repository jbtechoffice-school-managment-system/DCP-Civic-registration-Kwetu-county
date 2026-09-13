# Supabase backend

The database schema has been created in the Supabase project used for this migration.

The frontend expects:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The app intentionally does not contain a service-role/secret key.

Before production, finish:
1. Organization membership/RLS hardening.
2. Realtime publication for the required tables.
3. Storage policies for the private bucket.
4. Secure server-side invitation/import/export functions.
5. End-to-end RLS and authentication tests.
