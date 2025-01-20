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

async function adicionarVagaNaFila(url: string, empresa_id: number): Promise<void> {
  try {
    const jobData: JobData = {
      url,
      empresa_id,
      status: true
    };

    // Adiciona a vaga na fila do Redis
    await redis.rpush('jobs_to_process', JSON.stringify(jobData));
    console.log(`Vaga adicionada à fila: ${url}`);
  } catch (error) {
    console.error(`Erro ao adicionar vaga na fila ${url}:`, error);
    throw error;
  }
}

async function processEmpresa(empresa_id: number, jobboard: string): Promise<void> {
  try {
    console.log(`\nProcessando empresa ${empresa_id} - ${jobboard}`);

    // 1. Extrair URLs das vagas do jobboard
    console.log('Extraindo URLs das vagas...');
    const urlsResponse = await axios.post(`${API_BASE_URL}/scraper-job`, {
      url: jobboard
    });

    console.log('Resposta recebida:', JSON.stringify(urlsResponse.data, null, 2));

    // Normaliza o retorno dos diferentes scrapers
    let novasUrls: string[] = [];
    if (Array.isArray(urlsResponse.data)) {
      console.log('Formato: Array direto de URLs');
      novasUrls = urlsResponse.data;
    } else if (urlsResponse.data.vagas) {
      console.log('Formato: Objeto com propriedade vagas');
      if (Array.isArray(urlsResponse.data.vagas)) {
        novasUrls = urlsResponse.data.vagas.map((vaga: any) => {
          console.log('Processando vaga:', vaga);
          return typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url;
        });
      }
    } else if (typeof urlsResponse.data === 'object') {
      console.log('Formato: Objeto com outras propriedades');
      const possibleUrlProps = ['urls', 'jobs', 'links', 'results'];
      for (const prop of possibleUrlProps) {
        if (Array.isArray(urlsResponse.data[prop])) {
          console.log(`Propriedade encontrada: ${prop}`);
          novasUrls = urlsResponse.data[prop].map((item: any) => {
            console.log('Processando item:', item);
            return typeof item === 'string' ? item : item.url_job || item.url;
          });
          break;
        }
      }
    }

    if (novasUrls.length === 0) {
      console.log('Nenhuma vaga encontrada ou formato de resposta não reconhecido:', urlsResponse.data);
      return;
    }

    console.log(`Encontradas ${novasUrls.length} vagas:`, novasUrls);

    // 2. Buscar vagas existentes da empresa
    const vagasExistentes = await pool.query(
      'SELECT url, id FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa_id]
    );

    const urlsExistentes = new Set(vagasExistentes.rows.map(row => row.url));
    console.log(`A empresa tem ${urlsExistentes.size} vagas ativas no banco`);

    // 3. Adicionar cada URL encontrada na fila de processamento
    for (const url of novasUrls) {
      try {
        await adicionarVagaNaFila(url, empresa_id);
        await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay entre cada adição
      } catch (error) {
        console.error(`Erro ao adicionar vaga ${url} na fila:`, error);
        continue;
      }
    }

    // 4. Desativar vagas que não estão mais no jobboard
    const urlsParaDesativar = Array.from(urlsExistentes).filter(url => !novasUrls.includes(url));
    if (urlsParaDesativar.length > 0) {
      await pool.query(
        'UPDATE vagas SET status = false WHERE url = ANY($1)',
        [urlsParaDesativar]
      );
      console.log(`${urlsParaDesativar.length} vagas desativadas`);
    }

    console.log(`Processamento da empresa ${empresa_id} concluído\n`);
  } catch (error) {
    console.error(`Erro ao processar empresa ${empresa_id}:`, error);
    throw error;
  }
}

export async function startJobProcessor() {
  try {
    console.log('Iniciando processamento de todas as empresas...\n');

    // Buscar todas as empresas ativas
    const empresas = await pool.query(
      'SELECT e.id, e.nome, e.jobboard FROM empresas e INNER JOIN rotinas r ON e.id = r.empresa_id WHERE r.ativo = true'
    );

    // Processar cada empresa sequencialmente
    for (const empresa of empresas.rows) {
      try {
        await processEmpresa(empresa.id, empresa.jobboard);
        
        // Atualizar última execução da rotina
        await pool.query(
          'UPDATE rotinas SET ultima_execucao = NOW() WHERE empresa_id = $1',
          [empresa.id]
        );

        // Esperar 5 segundos entre cada empresa
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Erro ao processar empresa ${empresa.nome}:`, error);
        continue; // Continua para a próxima empresa mesmo se houver erro
      }
    }

    console.log('\nProcessamento de todas as empresas concluído!');
  } catch (error) {
    console.error('Erro no processador de vagas:', error);
    throw error;
  }
} 