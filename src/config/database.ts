import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Testar conexão
Promise.resolve(
  supabase.from('empresas').select('count').single()
)
.then(() => {
  console.log('Conexão com Supabase estabelecida');
})
.catch((error: Error) => {
  console.error('Erro ao conectar ao Supabase:', error.message);
});
