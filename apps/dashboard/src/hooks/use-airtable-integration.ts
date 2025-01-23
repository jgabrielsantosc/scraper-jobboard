import { useCallback, useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Database } from '@/types/database.types'
import { AirtableField, listBases } from '@/lib/airtable/api'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type SyncJob = Database['public']['Tables']['sync_jobs']['Row']
type SyncJobInsert = Database['public']['Tables']['sync_jobs']['Insert']
type Integration = Database['public']['Tables']['integrations']['Row']
type IntegrationInsert = Database['public']['Tables']['integrations']['Insert']

interface AirtableConfig {
  baseId: string
  tableId: string
  type: 'companies' | 'jobs'
  fieldMapping: Record<string, string>
}

interface NotificationHandlers {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

type RealtimePayload = RealtimePostgresChangesPayload<SyncJob>

export function useAirtableIntegration() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentJob, setCurrentJob] = useState<SyncJob | null>(null)
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null)
  const supabase = useSupabaseClient<Database>()
  const user = useUser()

  const loadSavedApiKey = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data: apiKey, error } = await supabase.rpc('get_api_key', {
        p_user_id: user.id,
        p_name: 'airtable'
      })

      if (error) {
        console.error('Erro ao carregar API key:', error)
        return
      }

      if (apiKey) {
        setSavedApiKey(apiKey)
      }
    } catch (error) {
      console.error('Erro ao carregar API key:', error)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    loadSavedApiKey()
  }, [loadSavedApiKey])

  const updateApiKey = useCallback(async (apiKey: string): Promise<boolean> => {
    if (!user?.id) return false

    setIsLoading(true)
    
    try {
      // Validar a API key tentando listar as bases
      const bases = await listBases(apiKey)
      
      if (!Array.isArray(bases) || bases.length === 0) {
        throw new Error('API Key inválida')
      }

      // Salvar a API key usando a função RPC
      const { error } = await supabase.rpc('save_api_key', {
        p_user_id: user.id,
        p_key: apiKey,
        p_name: 'airtable'
      })

      if (error) throw error

      setSavedApiKey(apiKey)
      return true
    } catch (error) {
      console.error('Erro ao atualizar API key:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, supabase])

  const subscribeToJobUpdates = useCallback(
    (jobId: string, handlers?: NotificationHandlers) => {
      const channel = supabase
        .channel(`sync_job:${jobId}`)
        .on<RealtimePayload>(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: 'sync_jobs',
            filter: `id=eq.${jobId}`,
          },
          (payload) => {
            if (!payload.new) return
            const job = payload.new as SyncJob
            setCurrentJob(job)

            // Notificar usuário sobre mudanças importantes
            if (job.status === 'completed') {
              handlers?.onSuccess?.(
                `${job.processed_records} registros processados com sucesso`
              )
            } else if (job.status === 'error') {
              handlers?.onError?.(
                job.error_message || 'Erro desconhecido'
              )
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    },
    [supabase]
  )

  const startSync = useCallback(
    async (
      config: AirtableConfig, 
      metadata: Record<string, any>,
      handlers?: NotificationHandlers
    ) => {
      if (!user) {
        handlers?.onError?.('Você precisa estar logado para sincronizar dados')
        return
      }

      try {
        setIsLoading(true)

        const { data: syncJobId, error } = await supabase.rpc('start_airtable_sync', {
          p_user_id: user.id,
          p_base_id: config.baseId,
          p_table_id: config.tableId,
          p_type: config.type,
          p_field_mapping: config.fieldMapping,
          p_metadata: metadata,
        })

        if (error) throw error

        // Iniciar monitoramento do job
        subscribeToJobUpdates(syncJobId, handlers)

        handlers?.onSuccess?.('Os dados serão sincronizados em segundo plano')

        return syncJobId
      } catch (error) {
        console.error('Erro ao iniciar sincronização:', error)
        handlers?.onError?.(
          error instanceof Error ? error.message : 'Erro desconhecido'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, user, subscribeToJobUpdates]
  )

  const getCurrentJob = useCallback(
    async (jobId: string) => {
      const { data: job, error } = await supabase
        .from('sync_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Erro ao buscar job:', error)
        return null
      }

      return job
    },
    [supabase]
  )

  const getRecentJobs = useCallback(
    async (limit = 5) => {
      if (!user) return []

      const { data: jobs, error } = await supabase
        .from('sync_jobs')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'airtable')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Erro ao buscar jobs recentes:', error)
        return []
      }

      return jobs
    },
    [supabase, user]
  )

  return {
    updateApiKey,
    startSync,
    getCurrentJob,
    getRecentJobs,
    isLoading,
    currentJob,
    savedApiKey,
    loadSavedApiKey
  }
} 