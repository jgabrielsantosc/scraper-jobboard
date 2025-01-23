'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

// Exporta uma única instância do cliente para uso em toda a aplicação
export const browserClient = createClientComponentClient<Database>() 