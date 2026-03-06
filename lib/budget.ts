import { createSupabaseAdmin } from '@/lib/supabase-server'

const AI_PRICE_INPUT_PER_1M = parseFloat(process.env.AI_PRICE_INPUT_PER_1M || '0.10')
const AI_PRICE_OUTPUT_PER_1M = parseFloat(process.env.AI_PRICE_OUTPUT_PER_1M || '0.40')
const BUDGET_MARGIN_TARGET = parseFloat(process.env.BUDGET_MARGIN_TARGET || '0.50')
const SOFT_LIMIT_RATIO = parseFloat(process.env.SOFT_LIMIT_RATIO || '0.80')

const PAYG_HOURLY_RATE = 10 // EUR per hour
const STARTER_MONTHLY_PRICE = 100 // EUR per month
const STARTER_INCLUDED_HOURS = 15

export function estimateCost(tokensIn: number, tokensOut: number): number {
  const costIn = (tokensIn / 1_000_000) * AI_PRICE_INPUT_PER_1M
  const costOut = (tokensOut / 1_000_000) * AI_PRICE_OUTPUT_PER_1M
  return costIn + costOut
}

const FREE_DAILY_BUDGET_EUR = 2.0 // ~3 messages/day * 30 days for free tier

export function computeSessionBudget(
  plan: string,
  billableMinutes: number
): number {
  if (plan === 'free') {
    return FREE_DAILY_BUDGET_EUR
  }
  if (plan === 'payg') {
    return (billableMinutes / 60) * PAYG_HOURLY_RATE * BUDGET_MARGIN_TARGET
  }
  if (plan === 'starter' || plan === 'couple') {
    const includedMinutes = STARTER_INCLUDED_HOURS * 60
    if (billableMinutes <= includedMinutes) {
      return STARTER_MONTHLY_PRICE * BUDGET_MARGIN_TARGET
    }
    const overageMinutes = billableMinutes - includedMinutes
    const overageBudget = (overageMinutes / 60) * PAYG_HOURLY_RATE * BUDGET_MARGIN_TARGET
    return STARTER_MONTHLY_PRICE * BUDGET_MARGIN_TARGET + overageBudget
  }
  return 0
}

export function computeMaxOutputTokens(availableBudget: number): number {
  if (availableBudget <= 0) return 0
  const maxTokens = Math.floor((availableBudget / AI_PRICE_OUTPUT_PER_1M) * 1_000_000)
  return Math.min(maxTokens, 8192)
}

export function isSoftLimit(estimatedCost: number, budgetEur: number): boolean {
  if (budgetEur <= 0) return false
  return estimatedCost / budgetEur >= SOFT_LIMIT_RATIO
}

export function isHardLimit(estimatedCost: number, budgetEur: number): boolean {
  if (budgetEur <= 0) return true
  return estimatedCost >= budgetEur
}

export interface LedgerEntry {
  id: string
  user_id: string
  period_start: string
  period_end: string
  tokens_in: number
  tokens_out: number
  estimated_cost_eur: number
  budget_eur: number
  status: string
}

export async function getOrCreateLedger(
  userId: string,
  plan: string,
  periodStart: Date,
  periodEnd: Date
): Promise<LedgerEntry> {
  const supabase = await createSupabaseAdmin()

  const { data: existing } = await supabase
    .from('ai_usage_ledger')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .order('period_start', { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing as LedgerEntry

  const budgetEur = computeSessionBudget(plan, STARTER_INCLUDED_HOURS * 60)

  const { data: newEntry, error } = await supabase
    .from('ai_usage_ledger')
    .insert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      budget_eur: budgetEur,
    })
    .select()
    .single()

  if (error) throw error
  return newEntry as LedgerEntry
}

export async function updateLedger(
  ledgerId: string,
  tokensIn: number,
  tokensOut: number,
  cost: number
): Promise<LedgerEntry> {
  const supabase = await createSupabaseAdmin()

  const { data: current, error: fetchError } = await supabase
    .from('ai_usage_ledger')
    .select('*')
    .eq('id', ledgerId)
    .single()

  if (fetchError) throw fetchError

  const entry = current as LedgerEntry
  const newCost = entry.estimated_cost_eur + cost
  const newStatus = isHardLimit(newCost, entry.budget_eur)
    ? 'HARD_LIMIT'
    : isSoftLimit(newCost, entry.budget_eur)
      ? 'SOFT_LIMIT'
      : 'ACTIVE'

  const { data: result, error: updateError } = await supabase
    .from('ai_usage_ledger')
    .update({
      tokens_in: entry.tokens_in + tokensIn,
      tokens_out: entry.tokens_out + tokensOut,
      estimated_cost_eur: newCost,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ledgerId)
    .select()
    .single()

  if (updateError) throw updateError
  return result as LedgerEntry
}

export async function getAvailableBudget(
  userId: string
): Promise<{ available: number; budget: number; used: number; status: string }> {
  const supabase = await createSupabaseAdmin()

  const { data: ledger } = await supabase
    .from('ai_usage_ledger')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .order('period_start', { ascending: false })
    .limit(1)
    .single()

  if (!ledger) {
    return { available: 0, budget: 0, used: 0, status: 'NO_LEDGER' }
  }

  const entry = ledger as LedgerEntry
  const available = entry.budget_eur - entry.estimated_cost_eur

  return {
    available: Math.max(0, available),
    budget: entry.budget_eur,
    used: entry.estimated_cost_eur,
    status: entry.status,
  }
}
