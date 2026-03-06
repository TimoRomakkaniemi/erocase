# Demo user

Demo-käyttäjä ohittaa maksujärjestelmän ja voi käyttää chattia ilman tilausta.

**Kirjautuminen:**
- Sähköposti: `timo@demo.solvia.fi`
- Salasana: (sama kuin .env.local → `DEMO_USER_PASSWORD`)

**Luonti (yksi kerta):**

1. Aseta `.env.local`:
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase Dashboard → Settings → API → service_role key
   - `DEMO_USER_EMAIL=timo@demo.solvia.fi`
   - `DEMO_USER_PASSWORD=***REDACTED***`

2. Aja:
   ```bash
   npm run create-demo-user
   ```

3. Vercelissä aseta myös `DEMO_USER_EMAIL=timo@demo.solvia.fi`, jotta API tunnistaa demon ja ohittaa maksutarkistuksen.
