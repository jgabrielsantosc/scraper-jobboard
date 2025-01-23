import { useState, useEffect, useCallback } from 'react'
import { browserClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { listBases, getBaseSchema } from '@/lib/airtable/api'
import type { Database } from '@/types/database.types'
import { useAuth } from './useAuth'
import { useNotification } from "@/hooks/use-notification"
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

type Integration = Database['public']['Tables']['integrations']['Row']
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']
type Json = Database['public']['Tables']['integrations']['Row']['config']
type SyncJob = Database['public']['Tables']['sync_jobs']['Row']

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
  currentJob: SyncJob | null;
  savedApiKey: string | null;
}

interface NotificationHandlers {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

type RealtimePayload = RealtimePostgresChangesPayload<SyncJob>

interface SyncAirtableDataParams {
  p_user_id: string;
  p_base_id: string;
  p_table_id: string;
  p_type: string;
  p_field_mapping: Json;
  p_metadata?: Record<string, any>;
}

interface AuthError {
  http_code: number;
  message: string;
}

interface ErrorResponse {
  error: AuthError;
}

const handleError = (error: unknown): ErrorResponse => {
  if (error instanceof Error) {
    return {
      error: {
        http_code: 500,
        message: error.message
      }
    };
  }
  return {
    error: {
      http_code: 500,
      message: 'Erro desconhecido'
    }
  };
};

export function useAirtableIntegration() {
  const [state, setState] = useState<AirtableIntegrationState>({
    config: null,
    isLoading: true,
    error: null,
    bases: [],
    savedIntegrations: [],
    currentJob: null,
    savedApiKey: null
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const notification = useNotification();

  // Log do status do usuário
  useEffect(() => {
    console.group('🔐 Status de Autenticação');
    if (user) {
      console.log('✅ Usuário autenticado:', {
        id: user.id,
        email: user.email,
        lastSignIn: user.last_sign_in_at
      });
    } else {
      console.log('❌ Usuário não autenticado');
    }
    console.groupEnd();
  }, [user]);

  const loadIntegration = useCallback(async () => {
    console.group('📥 Carregando Integrações');
    console.log('🔍 Verificando usuário...');

    if (!user?.id) {
      console.log('❌ Usuário não encontrado');
      console.groupEnd();
      const response = handleError(new Error('Você precisa estar logado para carregar as integrações'));
      setState(prev => ({
        ...prev,
        error: new Error(response.error.message),
        isLoading: false
      }));
      return;
    }

    console.log('✅ Usuário encontrado:', user.id);

    try {
      console.log('🔄 Buscando integrações do usuário...');
      const { data, error } = await browserClient
        .from('integrations')
        .select('*')
        .eq('provider', 'airtable')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao buscar integrações:', error);
        console.groupEnd();
        const response = handleError(error);
        setState(prev => ({
          ...prev,
          error: new Error(response.error.message),
          isLoading: false
        }));
        return;
      }

      const integrations = data as unknown as Integration[];
      console.log('✅ Integrações encontradas:', integrations.length);
      
      const lastActiveIntegration = integrations.find(i => i.is_active);
      console.log('🔍 Integração ativa:', lastActiveIntegration ? 'Sim' : 'Não');
      
      if (lastActiveIntegration?.config) {
        const config = lastActiveIntegration.config as unknown as AirtableConfig;
        if (config.apiKey) {
          try {
            console.log('🔄 Carregando bases do Airtable...');
            const bases = await listBases(config.apiKey);
            console.log('✅ Bases carregadas:', bases.length);
            setState(prev => ({
              ...prev,
              config,
              bases,
              savedIntegrations: integrations,
              savedApiKey: config.apiKey,
              isLoading: false,
              error: null
            }));
            console.groupEnd();
            return;
          } catch (error) {
            console.error('❌ Erro ao carregar bases:', error);
            console.groupEnd();
            const response = handleError(error);
            setState(prev => ({
              ...prev,
              error: new Error(response.error.message),
              isLoading: false
            }));
            return;
          }
        }
      }

      setState(prev => ({ 
        ...prev, 
        savedIntegrations: integrations,
        isLoading: false,
        error: null
      }));
      console.groupEnd();
    } catch (error) {
      console.error('❌ Erro geral:', error);
      console.groupEnd();
      const response = handleError(error);
      setState(prev => ({
        ...prev,
        error: new Error(response.error.message),
        isLoading: false
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadIntegration();
    }
  }, [user?.id, loadIntegration]);

  const updateApiKey = useCallback(async (apiKey: string) => {
    logger.group('Atualizando API Key')
    logger.auth('Verificando autenticação do usuário')

    if (!user?.id) {
      logger.error('Usuário não autenticado')
      throw new Error('Usuário não autenticado')
    }

    try {
      logger.api('POST', '/api/integrations/airtable/config', { userId: user.id })
      
      // Primeiro carrega as bases para validar a API key
      const bases = await listBases(apiKey)
      
      const { error } = await browserClient
        .from('integrations')
        .upsert({
          user_id: user.id,
          provider: 'airtable',
          config: { apiKey }
        });

      if (error) {
        logger.error('Erro ao salvar configuração', error)
        throw error
      }

      logger.success('API Key atualizada com sucesso')
      setState(prev => ({
        ...prev,
        config: { apiKey } as AirtableConfig,
        bases: Array.isArray(bases) ? bases : [bases],
        savedApiKey: apiKey,
        isLoading: false,
        error: null
      }))
      
      return true
    } catch (error) {
      logger.error('Falha ao atualizar API Key', error)
      throw error
    } finally {
      logger.groupEnd()
    }
  }, [user?.id]);

  const updateConfig = useCallback(async (newConfig: Partial<AirtableConfig>) => {
    if (!user?.id || !state.config) {
      const response = handleError(new Error('Você precisa estar logado e ter uma configuração válida'));
      toast({
        title: "Erro",
        description: response.error.message,
        variant: "destructive",
      });
      return false;
    }

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

      if (error) {
        const response = handleError(error);
        toast({
          title: "Erro",
          description: response.error.message,
          variant: "destructive",
        });
        return false;
      }

      setState(prev => ({
        ...prev,
        config: updatedConfig
      }));

      return true;
    } catch (error) {
      const response = handleError(error);
      toast({
        title: "Erro",
        description: response.error.message,
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, state.config, toast]);

  const subscribeToJobUpdates = useCallback(
    (jobId: string, handlers?: NotificationHandlers) => {
      const channel = browserClient
        .channel(`sync_job:${jobId}`)
        .on<RealtimePayload>(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sync_jobs',
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            if (!payload.new) return;
            const job = payload.new as SyncJob;
            setState(prev => ({ ...prev, currentJob: job }));

            if (job.status === 'completed') {
              handlers?.onSuccess?.(
                `${job.processed_records} registros processados com sucesso`
              );
            } else if (job.status === 'error') {
              handlers?.onError?.(
                job.error_message || 'Erro desconhecido'
              );
            }
          }
        )
        .subscribe();

      return () => {
        browserClient.removeChannel(channel);
      };
    },
    []
  );

  const startSync = useCallback(async (
    config: {
      baseId: string
      tableId: string
      type: string
      fieldMapping: Record<string, string>
    },
    metadata?: Record<string, any>,
    handlers?: NotificationHandlers
  ) => {
    logger.group('Iniciando processo de sincronização')
    logger.auth('Verificando autenticação do usuário')

    if (!user?.id || !state.config?.apiKey) {
      logger.error('Usuário não autenticado ou API Key não configurada')
      throw new Error('Você precisa estar logado e ter uma API key configurada')
    }

    try {
      logger.api('POST', '/api/integrations/airtable/sync', { 
        userId: user.id,
        config,
        metadata 
      })

      const { data: jobId, error } = await browserClient.rpc('sync_airtable_data', {
        p_user_id: user.id,
        p_base_id: config.baseId,
        p_table_id: config.tableId,
        p_type: config.type,
        p_field_mapping: config.fieldMapping as unknown as Json
      });

      if (error) {
        logger.error('Erro ao iniciar sincronização', error)
        handlers?.onError?.(error.message)
        throw error
      }

      if (typeof jobId === 'string') {
        logger.success('Job de sincronização criado', jobId)
        subscribeToJobUpdates(jobId)
        handlers?.onSuccess?.('Sincronização iniciada com sucesso')
        return jobId
      } else {
        logger.error('ID do job inválido')
        throw new Error('ID do job inválido')
      }
    } catch (error) {
      logger.error('Falha ao iniciar sincronização', error)
      throw error
    } finally {
      logger.groupEnd()
    }
  }, [user?.id, state.config?.apiKey, subscribeToJobUpdates]);

  return {
    ...state,
    updateApiKey,
    updateConfig,
    startSync,
    loadIntegration
  };
} 