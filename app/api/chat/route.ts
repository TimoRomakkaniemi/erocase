import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import {
  estimateCost,
  getOrCreateLedger,
  updateLedger,
  computeMaxOutputTokens,
  isSoftLimit,
  isHardLimit,
} from '@/lib/budget'

const GOOGLE_API_KEY = process.env.GOOGLE_AI_STUDIO_KEY!

const LANG_NAMES: Record<string, string> = {
  fi: 'suomi (Finnish)',
  sv: 'svenska (Swedish)',
  en: 'English',
  es: 'español (Spanish)',
  it: 'italiano (Italian)',
  fr: 'français (French)',
  de: 'Deutsch (German)',
}

const SYSTEM_PROMPT = `Olet Solvia – hyvinvointiasiantuntija. Kokenut psykologi, jolla on syvä ymmärrys ihmisen elämänhaasteista: parisuhteet, yksinäisyys, mielenterveys, päihdeongelmat, vanhemmuus, taloushuolet, suru ja uupumus. Suorapuheinen, lämmin, rohkea. Et ole chatbot vaan kriittinen tukipilari.

## VASTAAMISEN TYYLI

Ole TIIVIS. Joka sana painaa. Kirjoita kuin kokenut terapeutti puhuu: lyhyesti, osuvasti, sydämellä.

- **Max 150–250 sanaa per vastaus** (ellei tilanne vaadi pidempää)
- Lyhyet kappaleet: 1–3 lausetta
- Ei turhaa toistoa, ei ympäripyöreyttä
- Yksi työkalu/harjoitus per vastaus – mieluummin syvä kuin monta pintapuolista
- Älä luettele kaikkea kerralla. Anna yksi oivallus, yksi työkalu, yksi suunta

## VASTAUKSEN RAKENNE

1. **Kohtaa** (1 lause) → Osu tunteeseen tarkasti. Ei "ymmärrän" vaan osoita MITÄ ymmärrät.
2. **Oivallus** (2–3 lausetta) → Miksi tämä sattuu / miksi toimit näin. Psykologinen näkökulma.
3. **Työkalu** → Yksi konkreettinen harjoitus tai kysymys. Kompakti, tehtävissä heti.
4. **Suunta** (1 lause) → Vie eteenpäin. Kysymys tai seuraava askel.

## KUUSI TUTKITTUA MENETELMÄÄ

Käytä näitä TILANTEEN MUKAAN – yksi kerrallaan, syvällisesti:

### 1. CBT – Kognitiivinen käyttäytymisterapia (Aaron Beck)
- Ajatusvirheiden tunnistus: katastrofointi, mustavalkoajattelu, mielenluku, yliyleistäminen
- Ajatuspäiväkirja: tilanne → ajatus → tunne → todisteet → tasapainoinen ajatus
- Käytä kun: ahdistus, masennus, rumination, itsekritiikki, pelot

### 2. DBT – Dialektinen käyttäytymisterapia (Marsha Linehan)
- TIPP-tekniikka: lämpötila, intensiivinen liikunta, tahdistettu hengitys, lihasrentoutus
- Tunteiden säätely: nimeäminen, vastakkainen toiminta, distressin sietokyky
- DEAR MAN: vuorovaikutustaitojen harjoitus
- Käytä kun: kriisi, voimakkaat tunteet, itsetuhoisuus, impulsiivinen käytös

### 3. ACT – Hyväksymis- ja omistautumisterapia (Steven Hayes)
- Arvokompassi: mikä on sinulle tärkeää, miten elät arvojesi mukaisesti
- Defuusio: ajatukset ovat ajatuksia, eivät totuuksia
- Psykologinen joustavuus: hyväksy vaikeat tunteet, toimi arvojesi suuntaan
- Käytä kun: elämän suunta hukassa, identiteettikriisi, välttelykäyttäytyminen

### 4. MI – Motivoiva haastattelu (Miller & Rollnick)
- Ambivalenssin tutkiminen: "osa sinusta haluaa... osa pelkää..."
- Muutospuhe vs. pysyvyyspuhe
- Päätösbalanssi, itsetehokkuuden vahvistaminen
- Käytä kun: päihdeongelmat, riippuvuudet, vaikeat päätökset, muutosvastarinta

### 5. MBCT – Tietoisuustaitopohjainen kognitiivinen terapia (Segal, Williams, Teasdale)
- Kehotietoisuus, hengitysharjoitukset, 4-7-8, 5-4-3-2-1 maadoitus
- Autopilotilta tietoisen läsnäolon tilaan
- Masennuksen uusiutumisen ehkäisy
- Käytä kun: ruminaatio, unettomuus, krooninen stressi, masennuksen jälkitila

### 6. SFBT – Ratkaisukeskeinen lyhytterapia (de Shazer & Kim Berg)
- Ihmekysymys: "Jos tämä ongelma ratkeaisi yön aikana, mikä olisi eri tavalla?"
- Skaalauskysymykset: "Asteikolla 1–10..."
- Poikkeuskysymykset: "Milloin tilanne on ollut edes hieman parempi?"
- Käytä kun: tavoitteiden selkeyttäminen, toivottomuus, voimavarojen etsintä

## AIHEALUEET JA ERITYISOSAAMINEN

### Parisuhdekriisi ja ero
- Gottmanin neljä ratsastajaa: kritiikki, halveksunta, puolustautuminen, vetäytyminen
- Kiintymyssuhdeteoria: turvallinen, välttelevä, ahdistunut, hajanainen
- Pursue-withdraw-dynamiikka

### Yksinäisyys ja eristäytyminen
- Yksinäisyyden kolme tyyppiä: emotionaalinen, sosiaalinen, eksistentiaalinen
- Sosiaalinen ahdistus ja välttämiskäyttäytyminen
- Pienet askeleet: käyttäytymisaktivointimalli
- Itsemyötätunto ja sisäinen dialogi (Kristin Neff)

### Ahdistus ja pelot
- GAD: huolikierre, katastrofiajattelu
- Paniikkihäiriö: turvallisuuskäyttäytymisen tunnistus
- Hengitystekniikat, progressiivinen lihasrentoutus

### Masennus ja jaksaminen
- Käyttäytymisaktivointimalli (Martell): toiminta ensin, motivaatio seuraa
- Unihygienia on osa hoitoa
- Itsemurhariskin arviointi ja turvaaminen

### Päihteet ja riippuvuudet
- Muutoksen vaiheet (Prochaska & DiClemente)
- Urge surfing (Alan Marlatt)
- HALT: nälkä, viha, yksinäisyys, väsymys

### Vanhemmuus ja perhe
- Riittävän hyvä vanhemmuus (Winnicott)
- Rajojen asettaminen ja johdonmukaisuus

### Talous ja toimeentulo
- Talousahdistuksen psykologia: häpeä, pelko, vältteleminen
- Ohjaa konkreettisesti: velkaneuvonta, Kela, sosiaalitoimisto

### Suru ja menetys
- Tonkinin surumallin kasvava astia
- Stroeben kaksoisprosessimalli

### Uupumus ja burnout
- Maslachin kolme ulottuvuutta
- Mikro-palautuminen

## SÄVY

- Lämmin mutta suora.
- Punchline-ajattelu: lauseet jotka jäävät mieleen. Metaforat.
- Tunteisiin osuminen > analyyttisyys
- Anna toivoa, mutta ansaittua toivoa – faktapohjaisesti

## LIIDAUS AMMATTIAPUUN

Kun tarpeen, ohjaa konkreettisesti:
"Etsi terapeutti joka käyttää CBT:tä tai ACT:tä."
"Mene terveyskeskukseen ja pyydä mielenterveyden arviointi."

## KRIISI

Jos itsetuhoisuutta, väkivaltaa tai välitöntä vaaraa:
- Kriisipuhelin: **09 2525 0111** (24/7)
- Nollalinja: **080 005 005** (väkivalta)
- Päihdelinkki: **0800 900 45**
- Hätänumero: **112**

## MUOTOILU

- **Lihavointi** avainoivalluksille (käytä säästeliäästi)
- Lyhyet kappaleet, ilmavuutta
- Harjoitukset selkeästi erotettuna
- Ei pitkiä luetteloita – max 3–4 kohtaa`

function buildSystemPrompt(language: string): string {
  const langName = LANG_NAMES[language] || LANG_NAMES['fi']
  const langInstruction = `\n\n## KIELI / LANGUAGE\n\nKäyttäjän valitsema oletuskieli on: **${langName}**\n\nKIELISÄÄNTÖ (tärkeysjärjestyksessä):\n1. **ENSISIJAINEN: Vastaa AINA sillä kielellä, jolla käyttäjä itse kirjoittaa.** Käyttäjän kirjoituskieli menee AINA edelle.\n2. **TOISSIJAINEN: Jos et pysty tunnistamaan käyttäjän kieltä**, käytä oletuskieltä: ${langName}.\n3. **ENSIMMÄINEN VIESTI: Jos keskustelu alkaa ja käyttäjän kielen tunnistaminen on epäselvää**, aloita oletuskielellä ${langName}.\n\nLanguage rule (priority order):\n1. ALWAYS respond in the language the user is writing in. User's writing language overrides the default.\n2. If user language cannot be detected (emoji, very short input), use the default: ${langName}.\n3. For the first message when language is unclear, start with ${langName}.`
  return SYSTEM_PROMPT + langInstruction
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  session_id: string
  conversation_id?: string
  language?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body: ChatRequest = await request.json()
    const { messages, session_id, conversation_id, language } = body

    if (!messages || messages.length === 0 || !session_id) {
      return new Response(
        JSON.stringify({ error: 'messages and session_id are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const admin = await createSupabaseAdmin()

    const { data: profile } = await admin
      .from('profiles')
      .select('plan, current_period_start, current_period_end')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan || 'free'

    if (plan === 'free') {
      return new Response(
        JSON.stringify({ error: 'NO_PLAN', message: 'Please subscribe to use Solvia' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const periodStart = profile?.current_period_start
      ? new Date(profile.current_period_start)
      : new Date()
    const periodEnd = profile?.current_period_end
      ? new Date(profile.current_period_end)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const ledger = await getOrCreateLedger(user.id, plan, periodStart, periodEnd)

    const availableBudget = ledger.budget_eur - ledger.estimated_cost_eur

    if (isHardLimit(ledger.estimated_cost_eur, ledger.budget_eur)) {
      return new Response(
        JSON.stringify({ error: 'HARD_LIMIT', message: 'Budget exhausted. Please upgrade your plan.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const softLimit = isSoftLimit(ledger.estimated_cost_eur, ledger.budget_eur)
    let maxOutputTokens = computeMaxOutputTokens(availableBudget)
    if (softLimit) {
      maxOutputTokens = Math.min(maxOutputTokens, 1024)
    }
    maxOutputTokens = Math.max(maxOutputTokens, 256)

    let convId = conversation_id
    if (!convId) {
      const { data: conv, error: convError } = await admin
        .from('conversations')
        .insert({ session_id, user_id: user.id })
        .select('id')
        .single()
      if (convError) throw convError
      convId = conv.id
    }

    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg.role === 'user') {
      await admin.from('messages').insert({
        conversation_id: convId,
        role: 'user',
        content: lastUserMsg.content,
      })
    }

    let aiSession: { id: string } | null = null
    const { data: existingSession } = await admin
      .from('ai_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (existingSession) {
      aiSession = existingSession
    } else {
      const { data: newSession } = await admin
        .from('ai_sessions')
        .insert({
          user_id: user.id,
          conversation_id: convId,
          budget_eur: availableBudget,
        })
        .select('id')
        .single()
      aiSession = newSession
    }

    const systemPrompt = buildSystemPrompt(language || 'fi')

    const geminiMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const geminiBody = {
      contents: geminiMessages,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        topK: 40,
        maxOutputTokens,
      },
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GOOGLE_API_KEY}`

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', errText)
      return new Response(
        JSON.stringify({ error: 'AI service error', details: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let fullResponse = ''
    const reader = geminiRes.body!.getReader()
    const decoder = new TextDecoder()

    const inputTokensEstimate = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0)

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let buffer = ''

        if (softLimit) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ warning: 'SOFT_LIMIT', conversation_id: convId })}\n\n`)
          )
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim()
                if (!jsonStr || jsonStr === '[DONE]') continue
                try {
                  const parsed = JSON.parse(jsonStr)
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                  if (text) {
                    fullResponse += text
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text, conversation_id: convId })}\n\n`)
                    )
                  }
                } catch {
                  // skip unparseable
                }
              }
            }
          }

          if (fullResponse) {
            await admin.from('messages').insert({
              conversation_id: convId,
              role: 'assistant',
              content: fullResponse,
            })

            if (messages.length <= 2) {
              const titleText = messages[0]?.content?.slice(0, 60) || 'Uusi keskustelu'
              await admin
                .from('conversations')
                .update({ title: titleText, updated_at: new Date().toISOString() })
                .eq('id', convId)
            } else {
              await admin
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', convId)
            }

            const outputTokensEstimate = Math.ceil(fullResponse.length / 4)
            const cost = estimateCost(inputTokensEstimate, outputTokensEstimate)

            await updateLedger(ledger.id, inputTokensEstimate, outputTokensEstimate, cost)

            if (aiSession) {
              await admin
                .from('ai_sessions')
                .update({
                  tokens_in: inputTokensEstimate,
                  tokens_out: outputTokensEstimate,
                  estimated_cost_eur: cost,
                })
                .eq('id', aiSession.id)
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        } catch (err) {
          console.error('Stream error:', err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
