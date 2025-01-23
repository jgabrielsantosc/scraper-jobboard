import axios from 'axios';
import { browserClient } from '@/lib/supabase/client';

export interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  description?: string;
  options?: {
    choices?: Array<{
      name: string;
      id: string;
    }>;
    precision?: number;
    symbol?: string;
  };
}

interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
  description?: string;
  views: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface AirtableBaseSchema {
  tables: AirtableTable[];
}

interface AirtableListBasesResponse {
  bases: AirtableBase[];
}

interface AirtableGetSchemaResponse {
  tables: AirtableTable[];
}

const AIRTABLE_API_URL = 'https://api.airtable.com/v0/meta';

export async function listBases(apiKey: string): Promise<AirtableBase[]> {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/bases`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Falha ao listar bases do Airtable: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json() as AirtableListBasesResponse;
    
    if (!data?.bases || !Array.isArray(data.bases)) {
      throw new Error('Formato de resposta inválido do Airtable');
    }

    return data.bases.filter((base): base is AirtableBase => {
      return typeof base.id === 'string' && 
             typeof base.name === 'string' &&
             base.permissionLevel !== 'none';
    });
  } catch (error) {
    console.error('Erro ao listar bases:', error);
    throw error;
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const bases = await listBases(apiKey);
    return Array.isArray(bases) && bases.length > 0;
  } catch (error) {
    return false;
  }
}

export async function getBaseSchema(apiKey: string, baseId: string): Promise<AirtableBaseSchema> {
  try {
    const response = await fetch(`${AIRTABLE_API_URL}/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Falha ao obter schema da base: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json() as AirtableGetSchemaResponse;
    
    if (!data?.tables || !Array.isArray(data.tables)) {
      throw new Error('Formato de resposta inválido do Airtable');
    }

    return {
      tables: data.tables.filter((table): table is AirtableTable => {
        return typeof table.id === 'string' &&
               typeof table.name === 'string' &&
               Array.isArray(table.fields) &&
               table.fields.every(field => 
                 typeof field.id === 'string' && 
                 typeof field.name === 'string' &&
                 typeof field.type === 'string'
               );
      }),
    };
  } catch (error) {
    console.error('Erro ao obter schema:', error);
    throw error;
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