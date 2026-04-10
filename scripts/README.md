# Demo user

Demo-käyttäjä ohittaa maksujärjestelmän ja voi käyttää chattia ilman tilausta.

**Kirjautuminen:**
- Sähköposti: `timo@demo.solvia.fi`
- Salasana: sama kuin `.env.local` → `DEMO_USER_PASSWORD` (syötä kirjautumissivun salasanakenttään)

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

## SendGrid (Trusty_uusi -tyyli)

Kopioi `.env.local`iin vähintään:

- `SENDGRID_API_KEY` — SendGrid → API Keys  
- `SENDER_EMAIL` tai `SENDGRID_FROM_EMAIL` — **Single Sender** tai vahvistettu domain (SendGrid)

Valinnainen: `EMAIL_INTERNAL_SECRET` — `Authorization: Bearer <arvo>` sallii `POST /api/email/send` mille tahansa vastaanottajalle (cron/skriptit). Ilman sitä vain kirjautunut käyttäjä voi lähettää **omaan** sähköpostiinsa.

Testi:

```bash
npm run send-email-sendgrid -- --to sinun@email.com --subject "Testi" --html "<p>Toimii</p>"
```

Sovelluskoodi: `lib/sendgrid.ts` (`sendMail`), reitti `POST /api/email/send`. Katso `.env.example`.

### Vercel

Tuotantoon: aja (kirjautunut `vercel` CLI + linkitetty projekti):

```bash
npm run sync-sendgrid-vercel
```

Skripti lukee arvot tämän repun `.env.local`-tiedostosta, ja jos puuttuu, polusta `../Trusty_finance/Trusty_uusi/.env.local` (tai `TRUSTY_DOTENV=/polku/.env.local`). Synkkaa `SENDGRID_API_KEY` ja `SENDER_EMAIL` ympäristöihin production, preview ja development. Uusi deploy tarvitaan, jotta muuttujat tulevat käyttöön.

Valinnainen `EMAIL_INTERNAL_SECRET` synkataan samalla, jos se löytyy jommastakummasta `.env.local`-tiedostosta.
