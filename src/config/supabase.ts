import { createClient } from '@supabase/supabase-js';
import { env } from './env';

if (!env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL não está definida nas variáveis de ambiente');
}

if (!env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY não está definida nas variáveis de ambiente');
}

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
); 