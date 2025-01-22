import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type ApiLog = Database['public']['Tables']['api_logs']['Insert']

export const apiLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  const originalSend = res.send

  // Captura o corpo da resposta
  res.send = function (body) {
    res.locals.responseBody = body
    return originalSend.call(this, body)
  }

  // Quando a resposta terminar
  res.on('finish', async () => {
    try {
      const endTime = Date.now()
      const processingTime = endTime - startTime

      const logData: ApiLog = {
        method: req.method,
        path: req.path,
        status_code: res.statusCode,
        response_time: processingTime,
        ip_address: req.ip || 'unknown',
        request_body: req.body,
        response_body: res.locals.responseBody,
        user_agent: req.get('user-agent') || 'unknown'
      }

      await supabase.from('api_logs').insert(logData)
    } catch (error) {
      console.error('Erro ao registrar log:', error)
    }
  })

  next()
} 