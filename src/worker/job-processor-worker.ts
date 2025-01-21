import { startJobProcessor } from '../services/job-processor';
import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('\nIniciando processador de vagas...');
console.log('Configurações:');
console.log('-------------');
console.log('REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
console.log('REDIS_PORT:', process.env.REDIS_PORT || '6379');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || 'localhost');
console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT || '5432');
console.log('POSTGRES_DB: jobcrawler');
console.log('API_BASE_URL:', process.env.API_BASE_URL || 'http://localhost:3001');
console.log('-------------\n');

// Função para executar o processamento periodicamente
async function runProcessor() {
  try {
    console.log(`\n[${new Date().toISOString()}] Iniciando ciclo de processamento...`);
    await startJobProcessor();
    console.log(`[${new Date().toISOString()}] Ciclo de processamento concluído`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro durante o processamento:`, error);
  }

  // Agenda próxima execução em 1 hora
  const nextRun = new Date(Date.now() + 60 * 60 * 1000);
  console.log(`\nPróxima execução agendada para: ${nextRun.toLocaleString()}\n`);
  setTimeout(runProcessor, 60 * 60 * 1000);
}

// Inicia o processamento
runProcessor();

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', () => {
  console.log('\nRecebido sinal SIGTERM');
  console.log('Encerrando processador de vagas...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nRecebido sinal SIGINT');
  console.log('Encerrando processador de vagas...');
  process.exit(0);
}); 