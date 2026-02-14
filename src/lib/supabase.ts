import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kkzxrwunsxhuegakjqvf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrenhyd3Vuc3hodWVnYWtqcXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzE0MTQsImV4cCI6MjA4NjA0NzQxNH0.d3PZ1jRi1ial3mzF40sy0QdefteCvTYA6z4GMCENAAE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/erocase-chat`
