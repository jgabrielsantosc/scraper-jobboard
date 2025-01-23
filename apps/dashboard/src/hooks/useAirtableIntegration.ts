import { useState, useEffect, useCallback } from 'react'
import { browserClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { listBases, getBaseSchema } from '@/lib/airtable/api'
import type { Database } from '@/types/database.types'
import { useAuth } from './useAuth'
import { useNotification } from "@/hooks/use-notification"

type Integration = Database['public']['Tables']['integrations']['Row']
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
type Json = Database['public']['Tables']['integrations']['Row']['config']

interface AirtableConfig {
  apiKey: string;
  baseId?: string;
  tableName?: string;
  mappings?: {
    [key: string]: string; // campo_destino: campo_origem
  };
  type?: 'companies' | 'jobs';
}

interface AirtableIntegrationState {
  config: AirtableConfig | null;
  isLoading: boolean;
  error: Error | null;
  bases: any[];
  savedIntegrations: Integration[];
}

export function useAirtableIntegration() {
  const [state, setState] = useState<AirtableIntegrationState>({
    config: null,
    isLoading: true,
    error: null,
    bases: [],
    savedIntegrations: []
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const notification = useNotification();

  const loadIntegration = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Carregar todas as integrações do usuário
      const { data, error } = await browserClient
        .from('integrations')
        .select('*')
        .eq('provider', 'airtable')
        .eq('user_id', user.id);

      if (error) throw error;

      const integrations = data as unknown as Integration[];
      
      // Se houver integrações, carrega a última configuração ativa
      const lastActiveIntegration = integrations.find(i => i.is_active);
      
      if (lastActiveIntegration?.config) {
        const config = lastActiveIntegration.config as unknown as AirtableConfig;
        if (config.apiKey) {
          const bases = await listBases(config.apiKey);
          setState(prev => ({
            ...prev,
            config,
            bases,
            savedIntegrations: integrations,
            isLoading: false
          }));
          return;
        }
      }

      setState(prev => ({ 
        ...prev, 
        savedIntegrations: integrations,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadIntegration();
    }
  }, [user?.id, loadIntegration]);

  const updateApiKey = async (apiKey: string) => {
    if (!user?.id) return false;

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const bases = await notification.promise(
        listBases(apiKey),
        {
          loading: "Verificando chave API...",
          success: "Chave API válida!",
          error: "Chave API inválida"
        }
      );

      const config: AirtableConfig = { apiKey };
      
      const integrationData: IntegrationInsert = {
        user_id: user.id,
        provider: 'airtable',
        config: config as unknown as Json,
        is_active: true
      };

      await browserClient
        .from('integrations')
        .upsert(integrationData);

      setState(prev => ({
        ...prev,
        config,
        bases: Array.isArray(bases) ? bases : [bases],
        isLoading: false,
        error: null
      }));

      notification.success("Integração configurada", {
        description: "Sua integração com Airtable foi configurada com sucesso!"
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar integração:', error);
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false
      }));

      notification.error("Falha na configuração", {
        description: "Verifique sua chave API e tente novamente."
      });

      return false;
    }
  };

  const updateConfig = async (newConfig: Partial<AirtableConfig>) => {
    if (!user?.id || !state.config) return false;

    try {
      const updatedConfig = { ...state.config, ...newConfig };
      
      const integrationData: IntegrationInsert = {
        user_id: user.id,
        provider: 'airtable',
        config: updatedConfig as unknown as Json,
        is_active: true
      };

      const { error } = await browserClient
        .from('integrations')
        .upsert(integrationData);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        config: updatedConfig
      }));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar configuração.",
        variant: "destructive",
      });
      return false;
    }
  };

  const syncData = async (
    baseId: string, 
    tableId: string, 
    type: 'companies' | 'jobs',
    fieldMapping: Record<string, string>
  ) => {
    if (!user?.id || !state.config?.apiKey) return false;

    try {
      // 1. Atualizar configuração
      await updateConfig({
        baseId,
        tableName: tableId,
        type,
        mappings: fieldMapping
      });

      // 2. Iniciar sincronização
      const { error } = await browserClient.rpc('sync_airtable_data', {
        p_user_id: user.id,
        p_base_id: baseId,
        p_table_id: tableId,
        p_type: type,
        p_field_mapping: fieldMapping
      });

      if (error) throw error;

      notification.success("Sincronização iniciada", {
        description: "Os dados começarão a ser sincronizados em breve."
      });

      return true;
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      notification.error("Falha na sincronização", {
        description: "Não foi possível iniciar a sincronização dos dados."
      });
      return false;
    }
  };

  return {
    ...state,
    updateApiKey,
    updateConfig,
    syncData,
    loadIntegration
  };
} 