import { startQueueProcessor } from '../services/job-queue-processor';
import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('\nIniciando processador de fila de vagas...');
console.log('Configurações:');
console.log('-------------');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
console.log('REDIS_PORT:', process.env.REDIS_PORT || '6379');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || 'localhost');
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT || '5432');
console.log('POSTGRES_DB: jobcrawler');
console.log('API_BASE_URL:', process.env.API_BASE_URL || 'http://localhost:3001');
console.log('-------------\n');

// Inicia o processador
startQueueProcessor().catch(error => {
  console.error('Erro fatal no processador de fila:', error);
  process.exit(1);
}); 