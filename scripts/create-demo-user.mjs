/**
 * Creates the demo user that bypasses the payment system.
 * Run: node scripts/create-demo-user.mjs
 * Requires in .env.local: SUPABASE_SERVICE_ROLE_KEY, DEMO_USER_EMAIL, DEMO_USER_PASSWORD
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

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

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.DEMO_USER_EMAIL || 'timo@demo.solvia.fi'
const password = process.env.DEMO_USER_PASSWORD || ''

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!password) {
  console.error('Missing DEMO_USER_PASSWORD in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (found) {
    await supabase.auth.admin.updateUserById(found.id, { password })
    console.log('Demo user already exists, password updated.')
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) {
      console.error('Create user error:', error.message)
      process.exit(1)
    }
    console.log('Demo user created:', data.user?.id)
  }

  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!user) {
    console.error('Could not find user after create')
    process.exit(1)
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        plan: 'starter',
        plan_status: 'active',
        included_minutes_remaining: 900,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

  if (profileError) {
    console.error('Profile update error:', profileError.message)
    process.exit(1)
  }
  console.log('Profile set to starter (demo bypass).')
  console.log('')
  console.log('Demo login:')
  console.log('  Email:', email)
  console.log('  Password: (from DEMO_USER_PASSWORD)')
  console.log('')
  console.log('Set DEMO_USER_EMAIL=' + email + ' in Vercel/env so the API also bypasses payment for this user.')
}

main()
