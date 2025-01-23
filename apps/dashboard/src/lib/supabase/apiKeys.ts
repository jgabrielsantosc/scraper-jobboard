import { createClient } from '@supabase/supabase-js';
import type { Database } from './../../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function saveApiKey(userId: string, apiKey: string, baseId: string) {
  console.log('📥 Iniciando saveApiKey...', { userId, baseIdExists: !!baseId });

  try {
    console.log('🔐 Chamando RPC store_secret...');
    const { data, error } = await supabase.rpc('store_secret', {
      secret_name: `airtable_key_${userId}`,
      secret_value: apiKey,
      secret_metadata: {
        base_id: baseId,
        user_id: userId,
        service: 'airtable',
        created_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('❌ Erro no store_secret:', {
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('✅ Chave salva com sucesso:', { result: data });
    return data;
  } catch (error) {
    console.error('❌ Erro ao processar saveApiKey:', error);
    throw new Error(
      error instanceof Error 
        ? `Falha ao salvar chave: ${error.message}`
        : 'Falha ao salvar chave da API'
    );
  }
}

export async function getApiKey(userId: string): Promise<string | null> {
  console.log('🔍 Buscando API key para usuário:', userId);

  try {
    const { data, error } = await supabase.rpc('get_secret', {
      secret_name: `airtable_key_${userId}`
    });

    if (error) {
      console.error('❌ Erro ao buscar chave:', {
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details
      });
      return null;
    }

    console.log('✅ Chave recuperada com sucesso');
    return data;
  } catch (error) {
    console.error('❌ Erro ao processar getApiKey:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return null;
  }
} 