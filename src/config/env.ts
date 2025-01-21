import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3001',
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/usr/local/share/playwright',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  
  // Credenciais
  FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  FIRECRAWL_API_URL: process.env.FIRECRAWL_API_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // Redis
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
  REDIS_USERNAME: process.env.REDIS_USERNAME || 'default',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_TLS: process.env.REDIS_TLS === 'true',
  
  // PostgreSQL
  POSTGRES_USER: process.env.POSTGRES_USER || 'jobcrawler',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'jobcrawler123',
  POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
  POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432'),
  POSTGRES_DB: process.env.POSTGRES_DB || 'jobcrawler'
};
