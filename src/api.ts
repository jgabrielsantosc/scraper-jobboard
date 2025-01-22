import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ExpressHandler } from './types/types';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { env } from './config/env';
import { swaggerDocument } from './config/swagger';
import empresaRoutes from './routes/empresa.routes';
import vagaRoutes from './routes/vaga.routes';
import statsRoutes from './routes/stats.routes';
import { StatsService } from './services/stats.service';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Variáveis de ambiente em api.ts:');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'Definido' : 'Não definido');
console.log('FIRECRAWL_API_URL:', process.env.FIRECRAWL_API_URL);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Definido' : 'Não definido');

process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/usr/local/share/playwright';

const api = express();

// Middlewares
api.use(express.json());
api.use(cors());

// Documentação Swagger
api.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas principais
api.use('/empresas', empresaRoutes);
api.use('/vagas', vagaRoutes);
api.use('/stats', statsRoutes);

// Endpoint para estatísticas
api.get('/stats', async (req, res) => {
  try {
    console.log('Buscando estatísticas...');
    
    const stats = await StatsService.getDashboardStats();
    console.log('Estatísticas completas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Erro detalhado ao buscar estatísticas:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Erro ao buscar estatísticas',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ error: 'Erro desconhecido ao buscar estatísticas' });
    }
  }
});

export default api;