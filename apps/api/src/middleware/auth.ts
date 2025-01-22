import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' })
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single()

  if (error || !data) {
    return res.status(401).json({ error: 'Invalid API key' })
  }

  next()
} 