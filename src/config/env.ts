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
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://xmunzrqufzoxrtgplzam.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdW56cnF1ZnpveHJ0Z3BsemFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MDM5NTEsImV4cCI6MjA1MzA3OTk1MX0.0-XIvQiUSeRD1AYFuqJhDa04OoKOLeSaIF_0oO_-gzY'
};
