import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase')
}

// Validar se a URL está no formato correto
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`URL do Supabase inválida: ${supabaseUrl}`)
}

console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5) + '...')

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 