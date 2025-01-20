import Redis from 'ioredis';
import { Pool } from 'pg';
import axios from 'axios';

// Configuração do Redis com retry
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
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
          titulo = $1, area = $2, sub_area = $3, senioridade = $4,
          modelo_trabalho = $5, modelo_contrato = $6, cidade = $7,
          estado = $8, pais = $9, descricao = $10, requisitos = $11,
          beneficios = $12, status = $13, updated_at = NOW()
        WHERE url = $14 AND empresa_id = $15`,
        [
          jobInfo.titulo,
          jobInfo.area,
          jobInfo.sub_area,
          jobInfo.senioridade,
          jobInfo.modelo_trabalho,
          jobInfo.modelo_contrato,
          jobInfo.localizacao.cidade,
          jobInfo.localizacao.estado,
          jobInfo.localizacao.pais,
          jobInfo.descricao,
          JSON.stringify(jobInfo.requisitos),
          JSON.stringify(jobInfo.beneficios),
          true,
          jobData.url,
          jobData.empresa_id
        ]
      );
      console.log(`Vaga atualizada: ${jobData.url}`);
    } else {
      // Inserir nova vaga
      await pool.query(
        `INSERT INTO vagas (
          empresa_id, url, titulo, area, sub_area, senioridade,
          modelo_trabalho, modelo_contrato, cidade, estado, pais,
          descricao, requisitos, beneficios, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())`,
        [
          jobData.empresa_id,
          jobData.url,
          jobInfo.titulo,
          jobInfo.area,
          jobInfo.sub_area,
          jobInfo.senioridade,
          jobInfo.modelo_trabalho,
          jobInfo.modelo_contrato,
          jobInfo.localizacao.cidade,
          jobInfo.localizacao.estado,
          jobInfo.localizacao.pais,
          jobInfo.descricao,
          JSON.stringify(jobInfo.requisitos),
          JSON.stringify(jobInfo.beneficios),
          true
        ]
      );
      console.log(`Nova vaga inserida: ${jobData.url}`);
    }
  } catch (error) {
    console.error(`Erro ao processar vaga ${jobData.url}:`, error);
    throw error;
  }
}

export async function startQueueProcessor() {
  console.log('Iniciando processador de fila de vagas...\n');

  while (true) {
    try {
      // Pega a próxima vaga da fila (bloqueia por 5 segundos esperando por novas vagas)
      const jobDataStr = await redis.blpop('jobs_to_process', 5);

      if (jobDataStr) {
        const jobData: JobData = JSON.parse(jobDataStr[1]);
        
        try {
          await processarVaga(jobData);
          // Espera 1 segundo entre cada processamento
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
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