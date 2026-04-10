/**
 * Push SendGrid-related env vars to the linked Vercel project.
 * Values: this repo's .env.local first, else TRUSTY_DOTENV (default: Trusty_uusi/.env.local).
 *
 * Usage (from repo root):
 *   node scripts/sync-sendgrid-to-vercel.mjs
 *
 * Requires: vercel CLI logged in, .vercel/project.json (vercel link).
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// erocase_proggis → timo_dev → DEVELOPMENT → Trusty_finance/Trusty_uusi
const DEFAULT_TRUSTY_DOTENV = join(
  dirname(dirname(root)),
  'Trusty_finance',
  'Trusty_uusi',
  '.env.local'
)

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const o = {}
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    let v = t.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    o[k] = v
  }
  return o
}

function vercelAdd(name, value, environment, sensitive) {
  const args = ['env', 'add', name, environment, '--force']
  // Vercel disallows --sensitive for the `development` target
  if (sensitive && environment !== 'development') args.push('--sensitive')
  const r = spawnSync('vercel', args, {
    cwd: root,
    input: value,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })
  if (r.status !== 0) {
    process.stderr.write(r.stderr || r.stdout || `vercel env add failed: ${name} ${environment}\n`)
    process.exit(r.status || 1)
  }
}

const localPath = join(root, '.env.local')
const trustyPath = process.env.TRUSTY_DOTENV || DEFAULT_TRUSTY_DOTENV

const local = parseEnvFile(localPath)
const trusty = parseEnvFile(trustyPath)

const apiKey = local.SENDGRID_API_KEY || trusty.SENDGRID_API_KEY
const sender =
  local.SENDER_EMAIL?.trim() ||
  local.SENDGRID_FROM_EMAIL?.trim() ||
  trusty.SENDER_EMAIL?.trim() ||
  trusty.SENDGRID_FROM_EMAIL?.trim()
const internalSecret =
  local.EMAIL_INTERNAL_SECRET?.trim() || trusty.EMAIL_INTERNAL_SECRET?.trim()

if (!apiKey) {
  console.error('Missing SENDGRID_API_KEY in .env.local or Trusty .env.local (set TRUSTY_DOTENV if path differs).')
  process.exit(1)
}
if (!sender) {
  console.error('Missing SENDER_EMAIL / SENDGRID_FROM_EMAIL in .env.local or Trusty .env.local.')
  process.exit(1)
}

const environments = ['production', 'preview', 'development']

for (const env of environments) {
  vercelAdd('SENDGRID_API_KEY', apiKey, env, true)
  vercelAdd('SENDER_EMAIL', sender, env, false)
}

if (internalSecret) {
  for (const env of environments) {
    vercelAdd('EMAIL_INTERNAL_SECRET', internalSecret, env, true)
  }
  console.log('Also synced EMAIL_INTERNAL_SECRET.')
}

console.log('Synced SENDGRID_API_KEY and SENDER_EMAIL to Vercel:', environments.join(', '))
console.log('Redeploy the project for new env to apply to existing deployments.')
