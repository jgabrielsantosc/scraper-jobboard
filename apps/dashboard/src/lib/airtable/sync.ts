import { airtable } from './client';
import { browserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

interface SyncConfig {
  baseId: string;
  tableId: string;
  mapping: Record<string, string>;
  type: 'companies' | 'jobs';
}

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];

export async function syncData(config: SyncConfig) {
  try {
    const records = await airtable(config.tableId)
      .select({
        view: 'Grid view',
      })
      .all();

    const transformedRecords = records.map(record => {
      const transformedRecord: Record<string, any> = {};
      
      Object.entries(config.mapping).forEach(([destField, sourceField]) => {
        if (sourceField) {
          transformedRecord[destField] = record.get(sourceField);
        }
      });

      // Adicionar campos obrigatórios
      if (config.type === 'companies') {
        transformedRecord.jobboard_type = transformedRecord.jobboard_type || 'airtable';
        transformedRecord.jobboard_url = transformedRecord.jobboard_url || '';
        transformedRecord.website = transformedRecord.website || '';
      } else {
        transformedRecord.url = transformedRecord.url || '';
      }

      return transformedRecord;
    });

    // Inserir registros no Supabase com tipagem correta
    const { data, error } = await browserClient
      .from(config.type)
      .upsert(transformedRecords as (CompanyInsert | JobInsert)[], {
        onConflict: 'id',
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erro na sincronização:', error);
    throw error;
  }
} 