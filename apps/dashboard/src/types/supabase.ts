import { AuthError } from '@supabase/supabase-js'

export interface SupabaseError extends AuthError {
  message: string
} 