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

## Supabase Auth -sähköpostit (vahvistus, magic link, salasanan palautus)

Nämä viestit **eivät** kulje Next.js:n `lib/sendgrid.ts` -kautta. Ne lähettää **Supabase Auth**. Jos vahvistuspostia ei tule, syy on lähes aina:

1. **Custom SMTP puuttuu** — Supabasen oletuslähetys on rajattu (osoitteet, määrät). Tuotannossa tarvitaan oma SMTP.
2. **Väärä redirect-URL** — Authentication → URL Configuration: Site URL ja Redirect URLs (esim. `https://<vercel-app>/auth/callback`).

### Kytkentä: SendGrid → Supabase SMTP

Käytä **samaa** `SENDGRID_API_KEY`-avainta ja **vahvistettua** lähettäjää kuin `SENDER_EMAIL` / SendGrid Single Sender.

1. [Supabase Dashboard](https://supabase.com/dashboard) → oma projekti → **Project Settings** → **Authentication**.
2. Etsi **SMTP Settings** (tai **Custom SMTP**) ja **Enable custom SMTP**.
3. Täytä (SendGridin [SMTP-dokumentaation](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api) mukaan):

   | Kenttä | Arvo |
   |--------|------|
   | Host | `smtp.sendgrid.net` |
   | Port | `587` |
   | Username | `apikey` (kirjaimellisesti tämä sana) |
   | Password | SendGrid **API Key** (sama kuin `SENDGRID_API_KEY`) |
   | Sender email | Sama kuin SendGridissä vahvistettu osoite (esim. `SENDER_EMAIL`) |
   | Sender name | Esim. `Solvia` |

4. Tallenna ja testaa: **Authentication** → **Email Templates** → lähetä testi tai rekisteröidy uudelleen.

Virallinen ohje: [Send emails with custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

### Kehitys ilman sähköpostia

Jos et halua säätää SMTP:ää heti: **Authentication** → **Providers** → **Email** → poista käytöstä **Confirm email** (vain dev/testi). Silloin `signUp` voi palauttaa istunnon ilman postivahvistusta — **älä jätä päälle tuotantoon**, jos et halua avointa rekisteröitymistä.

### Missä vahvistus näkyy tietokannassa?

Oikea lähde on **`auth.users.email_confirmed_at`** (Supabase Auth). Taulussa **`public.profiles`** ei aiemmin ollut vahvistuskenttää — migraatio **`011_profile_email_confirmed.sql`** lisää sarakkeen `email_confirmed_at` ja pitää sen synkassa `auth.users`-rivin kanssa (rekisteröityminen + kun käyttäjä vahvistaa sähköpostin). Admin-sivu **Users** näyttää sarakkeen **Email verified** (Yes / Pending). Aja migraatio pilvitietokantaan (`supabase db query` / Dashboard SQL / `db push`).
