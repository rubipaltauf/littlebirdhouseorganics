# Little Birdhouse Organics

Vite + React + TypeScript starter for GitHub Pages, with Supabase-backed auth and an admin CRM shell.

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the Supabase values from your Supabase project.
3. Run `npm install`.
4. Run `npm run dev`.

## Supabase setup

1. Create a Supabase project and enable Authentication > Email/Password.
2. In Supabase, open Project Settings > API and copy the Project URL and the public API key shown there. On newer projects this may be labeled as a publishable key instead of an `anon` key.
3. Add those values to `.env` locally and also to GitHub repository secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Open the Supabase SQL editor and run the SQL from [supabase/migrations/0001_initial.sql](supabase/migrations/0001_initial.sql).
5. To grant admin access for the CRM, insert a row into `public.admin_roles` for the signed-in admin account.

```sql
insert into public.admin_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'your-admin-email@example.com';
```

6. Start the app and sign in at `/admin/login` with the same admin email/password.

If you have not created the database tables yet, the app will still build, but it will not be able to authenticate or load CRM data until the Supabase project is configured and the SQL migration is applied.

## Build

```bash
npm run build
```

## Deploy

Push to `main` and GitHub Actions will publish `dist/` to GitHub Pages.

