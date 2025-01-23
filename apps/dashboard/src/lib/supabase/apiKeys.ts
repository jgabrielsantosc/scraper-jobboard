import { browserClient } from './client'
import type { Database } from '@/types/database.types'

type SaveApiKeyFunction = Database['public']['Functions']['save_api_key']
type GetApiKeyFunction = Database['public']['Functions']['get_api_key']

export async function saveApiKey(
  userId: string, 
  apiKey: string, 
  name: string
): Promise<SaveApiKeyFunction['Returns']> {
  try {
    const { data, error } = await browserClient.rpc('save_api_key', {
      p_user_id: userId,
      p_key: apiKey,
      p_name: name
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao salvar API key:', error)
    throw error
  }
}

export async function getApiKey(
  userId: string, 
  name: string
): Promise<GetApiKeyFunction['Returns'] | null> {
  try {
    const { data, error } = await browserClient.rpc('get_api_key', {
      p_user_id: userId,
      p_name: name
    })

    if (error) return null
    return data
  } catch (error) {
    console.error('Erro ao buscar API key:', error)
    return null
  }
} 