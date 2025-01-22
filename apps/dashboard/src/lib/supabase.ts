'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

// Removendo a validação da URL já que o createClientComponentClient
// gerencia isso internamente
export const supabase = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

// Log para debug (remover em produção)
if (process.env.NODE_ENV === 'development') {
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5) + '...')
} 