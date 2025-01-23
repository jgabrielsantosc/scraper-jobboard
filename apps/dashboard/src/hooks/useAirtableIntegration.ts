import { useState, useEffect } from 'react'
import { browserClient } from '@/lib/supabase/client'
import { saveApiKey, getApiKey } from '@/lib/supabase/apiKeys'

export function useAirtableIntegration() {
  const [isLoading, setIsLoading] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadApiKey() {
      try {
        const { data: { session } } = await browserClient.auth.getSession()
        if (!session?.user) {
          if (mounted) setError(new Error('Usuário não autenticado'))
          return
        }

        const key = await getApiKey(session.user.id, 'airtable')
        if (mounted) setApiKey(key)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Erro desconhecido'))
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadApiKey()
    return () => { mounted = false }
  }, [])

  return {
    apiKey,
    isLoading,
    error,
    updateApiKey: async (key: string) => {
      const { data: { session } } = await browserClient.auth.getSession()
      if (!session?.user) throw new Error('Usuário não autenticado')

      setIsLoading(true)
      try {
        await saveApiKey(session.user.id, key, 'airtable')
        setApiKey(key)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao atualizar API key'))
        throw err
      } finally {
        setIsLoading(false)
      }
    }
  }
} 