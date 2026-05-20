import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL  ?? ''
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = URL && KEY ? createClient(URL, KEY) : null

export const SUPABASE_READY = !!supabase

// ── Sync helpers ─────────────────────────────────────────────────────────────

export async function pushData(code: string, data: object): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase
    .from('sync_data')
    .upsert({ code, data, updated_at: new Date().toISOString() }, { onConflict: 'code' })
  return !error
}

export async function pullData(code: string): Promise<object | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('sync_data')
    .select('data, updated_at')
    .eq('code', code)
    .single()
  if (error || !data) return null
  return data.data as object
}
