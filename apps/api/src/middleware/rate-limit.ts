import rateLimit from 'express-rate-limit'
import { supabase } from '../lib/supabase'

// Função para verificar o plano do usuário pela API key
async function getUserPlanLimits(apiKey: string) {
  const { data } = await supabase
    .from('api_keys')
    .select('user_id')
    .eq('key', apiKey)
    .single()

  // Por padrão, limite de 100 requisições por minuto
  return {
    windowMs: 60 * 1000, // 1 minuto
    max: 100 // limite de requisições
  }
}

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: async (req) => {
    const apiKey = req.headers['x-api-key'] as string
    if (!apiKey) return 0 // Bloqueia se não tiver API key

    const limits = await getUserPlanLimits(apiKey)
    return limits.max
  },
  message: {
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}) 