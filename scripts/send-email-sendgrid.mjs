/**
 * Test SendGrid from CLI (Trusty_uusi: npm run send-email-sendgrid).
 * Usage: node scripts/send-email-sendgrid.mjs --to you@x.com --subject "Hi" --html "<p>Test</p>"
 * Requires .env.local: SENDGRID_API_KEY, SENDER_EMAIL (or SENDGRID_FROM_EMAIL).
 */
import { createRequire } from 'module'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const sgMail = require('@sendgrid/mail')

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) {
    console.error('.env.local not found')
    process.exit(1)
  }
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      const value = m[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1 || !process.argv[i + 1]) return ''
  return process.argv[i + 1]
}

loadEnv()

const apiKey = process.env.SENDGRID_API_KEY
const from = process.env.SENDGRID_FROM_EMAIL?.trim() || process.env.SENDER_EMAIL?.trim()
const to = arg('to')
const subject = arg('subject')
const html = arg('html')
const text = arg('text')

if (!apiKey) {
  console.error('SENDGRID_API_KEY missing')
  process.exit(1)
}
if (!from) {
  console.error('SENDER_EMAIL or SENDGRID_FROM_EMAIL missing')
  process.exit(1)
}
if (!to || !subject || (!html && !text)) {
  console.error('Usage: node scripts/send-email-sendgrid.mjs --to a@b.c --subject "S" (--html "<p>x</p>" | --text "plain")')
  process.exit(1)
}

sgMail.setApiKey(apiKey)

const msg = { to, from, subject, ...(html ? { html } : { text }) }

sgMail
  .send(msg)
  .then(([res]) => {
    console.log('Sent:', res.statusCode, res.headers['x-message-id'] || '')
  })
  .catch((err) => {
    console.error(err.response?.body || err)
    process.exit(1)
  })
