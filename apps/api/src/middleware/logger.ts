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
      const logData: ApiLog = {
        method: req.method,
        route: req.path,
        response_status: res.statusCode,
        processing_time_ms: Date.now() - startTime,
        ip_address: req.ip,
        request_headers: req.headers,
        request_body: req.body,
        response_body: res.locals.responseBody ? JSON.parse(res.locals.responseBody) : null,
        error_message: res.locals.error,
        source_system: 'api',
        metadata: {
          user_agent: req.get('user-agent'),
          query_params: req.query,
          api_version: '1.0'
        }
      }

      await supabase.from('api_logs').insert(logData)
    } catch (error) {
      console.error('Erro ao registrar log:', error)
    }
  })

  next()
} 