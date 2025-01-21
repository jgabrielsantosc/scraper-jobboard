import Redis from 'ioredis';
import { Pool } from 'pg';
import axios from 'axios';

// Configuração do Redis com retry
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// Configuração do PostgreSQL com retry
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'jobcrawler',
  password: process.env.POSTGRES_PASSWORD || 'jobcrawler123',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'jobcrawler',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexões
pool.on('connect', () => {
  console.log('Conectado ao PostgreSQL com sucesso');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
});

redis.on('connect', () => {
  console.log('Conectado ao Redis com sucesso');
});

redis.on('error', (err) => {
  console.error('Erro inesperado no Redis:', err);
});

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

interface JobData {
  url: string;
  empresa_id: number;
  status?: boolean;
}

async function processarVaga(jobData: JobData): Promise<void> {
  try {
    console.log(`Processando vaga: ${jobData.url}`);
    
    // Remover a vaga da fila antes de processar para evitar duplicação
    await redis.lrem('jobs_to_process', 0, JSON.stringify(jobData));
    console.log(`Vaga removida da fila: ${jobData.url}`);

    const jobResponse = await axios.post(`${API_BASE_URL}/job-ai-analysis`, {
      url: jobData.url
    });

    const jobInfo = jobResponse.data;

    // Verificar se a vaga já existe
    const vagaExistente = await pool.query(
      'SELECT id FROM vagas WHERE url = $1 AND empresa_id = $2',
      [jobData.url, jobData.empresa_id]
    );

    if (vagaExistente.rows.length > 0) {
      // Atualizar vaga existente
      await pool.query(
        `UPDATE vagas SET
          titulo = $1, area = $2, senioridade = $3,
          modelo_trabalho = $4, modelo_contrato = $5,
          localizacao = $6, descricao = $7, requisitos = $8,
          beneficios = $9, status = true, updated_at = NOW()
        WHERE url = $10 AND empresa_id = $11`,
        [
          jobInfo.titulo,
          jobInfo.area,
          jobInfo.senioridade,
          jobInfo.modelo_trabalho,
          jobInfo.modelo_contrato,
          JSON.stringify(jobInfo.localizacao || {}),
          jobInfo.descricao,
          JSON.stringify(jobInfo.requisitos || []),
          JSON.stringify(jobInfo.beneficios || []),
          jobData.url,
          jobData.empresa_id
        ]
      );
      console.log(`Vaga atualizada: ${jobData.url} - ${jobInfo.titulo}`);
    } else {
      // Inserir nova vaga
      await pool.query(
        `INSERT INTO vagas (
          empresa_id, url, titulo, area, senioridade,
          modelo_trabalho, modelo_contrato, localizacao,
          descricao, requisitos, beneficios, status,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())`,
        [
          jobData.empresa_id,
          jobData.url,
          jobInfo.titulo,
          jobInfo.area,
          jobInfo.senioridade,
          jobInfo.modelo_trabalho,
          jobInfo.modelo_contrato,
          JSON.stringify(jobInfo.localizacao || {}),
          jobInfo.descricao,
          JSON.stringify(jobInfo.requisitos || []),
          JSON.stringify(jobInfo.beneficios || [])
        ]
      );
      console.log(`Nova vaga inserida: ${jobData.url} - ${jobInfo.titulo}`);
    }
  } catch (error) {
    console.error(`Erro ao processar vaga ${jobData.url}:`, error);
    // Em caso de erro, coloca a vaga de volta na fila
    await redis.rpush('jobs_to_process', JSON.stringify(jobData));
    throw error;
  }
}

export async function startQueueProcessor() {
  console.log('\nIniciando processador de fila de vagas...');
  console.log('Configurações:');
  console.log('-------------');
  console.log('REDIS_HOST:', process.env.REDIS_HOST || 'localhost');
  console.log('REDIS_PORT:', process.env.REDIS_PORT || '6379');
  console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || 'localhost');
  console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT || '5432');
  console.log('POSTGRES_DB:', process.env.POSTGRES_DB || 'jobcrawler');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('-------------\n');

  let processedJobs = 0;
  let failedJobs = 0;
  let lastStatusUpdate = Date.now();

  while (true) {
    try {
      // Atualizar status a cada minuto
      if (Date.now() - lastStatusUpdate > 60000) {
        console.log('\nStatus do processador:');
        console.log(`Vagas processadas: ${processedJobs}`);
        console.log(`Falhas: ${failedJobs}`);
        const filaLength = await redis.llen('jobs_to_process');
        console.log(`Vagas na fila: ${filaLength}`);
        console.log('-------------\n');
        lastStatusUpdate = Date.now();
      }

      // Pega a próxima vaga da fila (bloqueia por 5 segundos esperando por novas vagas)
      const jobDataStr = await redis.blpop('jobs_to_process', 5);

      if (jobDataStr) {
        const jobData: JobData = JSON.parse(jobDataStr[1]);
        
        try {
          await processarVaga(jobData);
          processedJobs++;
          // Espera 1 segundo entre cada processamento
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          failedJobs++;
          console.error(`Erro ao processar vaga da fila:`, error);
          // Em caso de erro, coloca a vaga de volta na fila para tentar novamente depois
          await redis.rpush('jobs_to_process', JSON.stringify(jobData));
        }
      }
    } catch (error) {
      console.error('Erro no processador de fila:', error);
      // Espera 5 segundos antes de tentar novamente em caso de erro
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
} 