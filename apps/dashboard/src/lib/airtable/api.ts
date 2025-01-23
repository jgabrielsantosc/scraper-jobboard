import axios from 'axios';
import { browserClient } from '@/lib/supabase/client';

interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export async function listBases(apiKey: string): Promise<AirtableBase[]> {
  try {
    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data.bases;
  } catch (error) {
    console.error('Erro ao listar bases do Airtable:', error);
    throw new Error('Falha ao listar bases do Airtable');
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await listBases(apiKey);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getAirtableConfig(userId: string) {
  try {
    const { data, error } = await browserClient.rpc('get_api_key', {
      p_user_id: userId,
      p_name: 'airtable'
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao obter configuração do Airtable:', error);
    throw new Error('Falha ao obter configuração do Airtable');
  }
}

export async function getBaseSchema(apiKey: string, baseId: string) {
  try {
    const response = await axios.get(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter schema da base:', error);
    throw new Error('Falha ao obter schema da base');
  }
} 