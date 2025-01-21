import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ExpressHandler } from './types/types';
import { handleJobDetailsRequest } from './routes/scraper-job/unified-job-details';
import { unifiedUrlScraper } from './routes/crawler-url-jobboard/urls-scraper';
import { jobAIAnalyzerHandler } from './routes/scraper-job-ai/job-ai-analyzer';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { Pool } from 'pg';
import Redis from 'ioredis';
import axios from 'axios';
import { env } from './config/env';
import { swaggerDocument } from './config/swagger';
import empresaRoutes from './routes/empresa.routes';
import vagaRoutes from './routes/vaga.routes';
import statsRoutes from './routes/stats.routes';


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

// Configuração do Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'jobcrawler',
  password: process.env.POSTGRES_PASSWORD || 'jobcrawler123',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'jobcrawler',
});

// Rotas principais
api.use('/empresas', empresaRoutes);
api.use('/vagas', vagaRoutes);
api.use('/stats', statsRoutes);

// Rotas de scraping e análise
api.post('/job-details', handleJobDetailsRequest);
api.post('/scraper-job', unifiedUrlScraper);
api.post('/job-ai-analysis', jobAIAnalyzerHandler);

// Endpoint para estatísticas
api.get('/stats', async (req, res) => {
  try {
    console.log('Buscando estatísticas...');
    
    // Testar conexão com o banco
    await pool.query('SELECT NOW()');
    console.log('Conexão com PostgreSQL OK');
    
    // Testar conexão com Redis
    await redis.ping();
    console.log('Conexão com Redis OK');

    const [
      { total_empresas } = { total_empresas: 0 },
      { total_vagas } = { total_vagas: 0 },
      vagas_na_fila = 0
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total_empresas FROM empresas')
        .then(result => {
          console.log('Total empresas:', result.rows[0]);
          return result.rows[0];
        }),
      pool.query(`SELECT COUNT(*) as total_vagas FROM vagas`)
        .then(result => {
          console.log('Vagas stats:', result.rows[0]);
          return result.rows[0];
        }),
      redis.llen('jobs_to_process').then(length => {
        console.log('Tamanho da fila:', length);
        return length;
      })
    ]);

    // Buscar empresas ativas separadamente
    const { rows: [{ empresas_ativas = 0 }] } = await pool.query(`
      SELECT COUNT(DISTINCT e.id) as empresas_ativas 
      FROM empresas e 
      INNER JOIN rotinas r ON e.id = r.empresa_id 
      WHERE r.ativo = true
    `);
    console.log('Empresas ativas:', empresas_ativas);

    // Buscar vagas ativas separadamente
    const { rows: [{ vagas_ativas = 0 }] } = await pool.query(`
      SELECT COUNT(*) as vagas_ativas 
      FROM vagas v 
      WHERE v.status = true
    `);
    console.log('Vagas ativas:', vagas_ativas);

    const stats = {
      total_empresas,
      empresas_ativas,
      total_vagas,
      vagas_ativas,
      vagas_na_fila
    };
    
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

// Endpoint para listar empresas
api.get('/empresas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, 
        e.nome, 
        e.jobboard,
        e.created_at,
        e.updated_at,
        r.ultima_execucao,
        r.ativo as status,
        (
          SELECT COUNT(*) 
          FROM vagas v 
          WHERE v.empresa_id = e.id
        ) as total_vagas,
        (
          SELECT COUNT(*) 
          FROM vagas v 
          WHERE v.empresa_id = e.id 
          AND v.status = true
        ) as vagas_ativas
      FROM empresas e 
      LEFT JOIN rotinas r ON e.id = r.empresa_id 
      ORDER BY e.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Endpoint para listar vagas
api.get('/vagas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id, 
        v.titulo,
        v.url,
        v.empresa_id,
        v.area,
        v.senioridade,
        v.modelo_trabalho,
        v.modelo_contrato,
        v.localizacao,
        v.status,
        v.data_importacao,
        v.created_at as criado_em, 
        v.updated_at as atualizado_em,
        e.nome as empresa_nome,
        e.jobboard
      FROM vagas v 
      JOIN empresas e ON v.empresa_id = e.id 
      ORDER BY v.id DESC 
      LIMIT 100
    `);

    // Formatar os dados para o frontend
    const vagas = result.rows.map(vaga => ({
      id: vaga.id,
      url: vaga.url || `${vaga.jobboard}/jobs/${vaga.id}`, // Usar URL existente ou gerar uma
      empresa_id: vaga.empresa_id,
      empresa_nome: vaga.empresa_nome,
      titulo: vaga.titulo,
      area: vaga.area,
      senioridade: vaga.senioridade,
      modelo_trabalho: vaga.modelo_trabalho,
      status: vaga.status,
      criado_em: vaga.criado_em,
      atualizado_em: vaga.atualizado_em
    }));

    res.json(vagas);
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
});

// Endpoint para listar fila de processamento
api.get('/fila', async (req, res) => {
  try {
    const filaLength = await redis.llen('jobs_to_process');
    const fila = await redis.lrange('jobs_to_process', 0, filaLength - 1);
    
    const filaProcessada = fila.map(item => {
      const dados = JSON.parse(item);
      return {
        ...dados,
        adicionado_em: new Date().toISOString() // Em produção, seria ideal armazenar o timestamp junto com os dados
      };
    });
    
    res.json(filaProcessada);
  } catch (error) {
    console.error('Erro ao buscar fila:', error);
    res.status(500).json({ error: 'Erro ao buscar fila' });
  }
});

// Endpoint para buscar logs (mock - em produção seria integrado com um sistema de logs)
api.get('/logs', async (req, res) => {
  try {
    const logs = [
      `[${new Date().toISOString()}] Iniciando processamento de todas as empresas...`,
      `[${new Date().toISOString()}] Processando empresa Clara (ID: 1)`,
      `[${new Date().toISOString()}] Encontradas 38 vagas`,
      `[${new Date().toISOString()}] Adicionando vagas à fila de processamento...`
    ];
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs' });
  }
});

interface VagaData {
  titulo: string;
  area?: string;
  senioridade?: string;
  modelo_trabalho?: string;
  modelo_contrato?: string;
  localizacao?: {
    cidade?: string;
    estado?: string;
    pais?: string;
  };
  descricao?: string;
  requisitos?: string[];
  beneficios?: string[];
}

// Endpoint para processar vagas de uma empresa
const processarVagasHandler: ExpressHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar informações da empresa
    const { rows: [empresa] } = await pool.query(
      'SELECT id, nome, jobboard FROM empresas WHERE id = $1',
      [id]
    );

    if (!empresa) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    console.log(`Processando vagas da empresa ${empresa.nome} (${empresa.jobboard})`);

    // 1. Extrair URLs das vagas
    const urlsResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/scraper-job`, {
      url: empresa.jobboard
    });

    // Normalizar o retorno dos diferentes scrapers
    let novasUrls: string[] = [];
    if (Array.isArray(urlsResponse.data)) {
      novasUrls = urlsResponse.data;
    } else if (urlsResponse.data.vagas) {
      novasUrls = urlsResponse.data.vagas.map((vaga: any) => 
        typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url
      );
    }

    // 2. Buscar vagas existentes
    const { rows: vagasExistentes } = await pool.query(
      'SELECT url FROM vagas WHERE empresa_id = $1',
      [empresa.id]
    );
    const urlsExistentes = new Set(vagasExistentes.map(v => v.url));

    // 3. Filtrar apenas URLs novas
    const urlsNovas = novasUrls.filter(url => !urlsExistentes.has(url));
    console.log(`Encontradas ${urlsNovas.length} novas vagas`);

    // 4. Adicionar novas vagas à fila de processamento
    for (const url of urlsNovas) {
      const jobData = {
        url,
        empresa_id: empresa.id,
        status: true
      };
      await redis.rpush('jobs_to_process', JSON.stringify(jobData));
      
      // Iniciar o processamento da vaga com IA
      try {
        const aiResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/job-ai-analysis`, {
          url
        });
        
        // Inserir a vaga no banco com os dados da IA
        const vagaData = aiResponse.data as VagaData;
        await pool.query(`
          INSERT INTO vagas (
            empresa_id, url, titulo, area, senioridade, 
            modelo_trabalho, modelo_contrato, localizacao, 
            descricao, requisitos, beneficios, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        `, [
          empresa.id,
          url,
          vagaData.titulo || 'Sem título',
          vagaData.area || null,
          vagaData.senioridade || null,
          vagaData.modelo_trabalho || null,
          vagaData.modelo_contrato || null,
          JSON.stringify(vagaData.localizacao || {}),
          vagaData.descricao || '',
          JSON.stringify(vagaData.requisitos || []),
          JSON.stringify(vagaData.beneficios || [])
        ]);
      } catch (error) {
        console.error(`Erro ao processar vaga ${url} com IA:`, error);
      }
    }

    // 5. Atualizar última execução da rotina
    await pool.query(
      'UPDATE rotinas SET ultima_execucao = NOW() WHERE empresa_id = $1',
      [empresa.id]
    );

    res.json({
      message: `Processamento iniciado para ${urlsNovas.length} novas vagas`,
      total_vagas: novasUrls.length,
      novas_vagas: urlsNovas.length
    });
    return;
  } catch (error) {
    console.error('Erro ao processar vagas:', error);
    res.status(500).json({ error: 'Erro ao processar vagas' });
    return;
  }
};

api.post('/empresas/:id/processar-vagas', processarVagasHandler);

// 1. Rota para extrair URLs das vagas de uma empresa
api.get('/empresas/:id/vagas/extrair-urls', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar informações da empresa
    const { rows: [empresa] } = await pool.query(
      'SELECT id, nome, jobboard FROM empresas WHERE id = $1',
      [id]
    );

    if (!empresa) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    console.log(`Extraindo URLs de vagas da empresa ${empresa.nome} (${empresa.jobboard})`);

    // Extrair URLs das vagas
    const urlsResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/scraper-job`, {
      url: empresa.jobboard
    });

    // Normalizar o retorno dos diferentes scrapers
    let urlsExtraidas: string[] = [];
    if (Array.isArray(urlsResponse.data)) {
      urlsExtraidas = urlsResponse.data;
    } else if (urlsResponse.data.vagas) {
      urlsExtraidas = urlsResponse.data.vagas.map((vaga: any) => 
        typeof vaga === 'string' ? vaga : vaga.url_job || vaga.url
      );
    }

    // Buscar vagas ativas da empresa
    const { rows: vagasAtivas } = await pool.query(
      'SELECT id, url FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa.id]
    );

    // Identificar vagas que não estão mais disponíveis
    const urlsAtivas = new Set(urlsExtraidas);
    const vagasDesativadas = vagasAtivas.filter(vaga => !urlsAtivas.has(vaga.url));

    // Desativar vagas que não estão mais disponíveis
    if (vagasDesativadas.length > 0) {
      await pool.query(
        'UPDATE vagas SET status = false WHERE id = ANY($1)',
        [vagasDesativadas.map(v => v.id)]
      );
    }

    // Identificar novas URLs
    const urlsExistentes = new Set(vagasAtivas.map(v => v.url));
    const urlsNovas: string[] = urlsExtraidas.filter((url: string) => !urlsExistentes.has(url));

    res.json({
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      total_urls_extraidas: urlsExtraidas.length,
      urls_novas: urlsNovas,
      vagas_desativadas: vagasDesativadas.length
    });
  } catch (error) {
    console.error('Erro ao extrair URLs:', error);
    res.status(500).json({ error: 'Erro ao extrair URLs das vagas' });
  }
});

// 2. Rota para processar uma vaga específica
api.post('/vagas/processar', async (req, res) => {
  try {
    const { url, empresa_id } = req.body;

    if (!url || !empresa_id) {
      res.status(400).json({ error: 'URL e empresa_id são obrigatórios' });
      return;
    }

    // Verificar se a vaga já existe
    const { rows: [vagaExistente] } = await pool.query(
      'SELECT id FROM vagas WHERE url = $1 AND empresa_id = $2',
      [url, empresa_id]
    );

    if (vagaExistente) {
      res.status(409).json({ error: 'Vaga já existe', vaga_id: vagaExistente.id });
      return;
    }

    // Processar vaga com IA
    const aiResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/job-ai-analysis`, {
      url
    });

    // Inserir vaga no banco
    const vagaData = aiResponse.data as VagaData;
    const { rows: [novaVaga] } = await pool.query(`
      INSERT INTO vagas (
        empresa_id, url, titulo, area, senioridade, 
        modelo_trabalho, modelo_contrato, localizacao, 
        descricao, requisitos, beneficios, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
      RETURNING id
    `, [
      empresa_id,
      url,
      vagaData.titulo || 'Sem título',
      vagaData.area || null,
      vagaData.senioridade || null,
      vagaData.modelo_trabalho || null,
      vagaData.modelo_contrato || null,
      JSON.stringify(vagaData.localizacao || {}),
      vagaData.descricao || '',
      JSON.stringify(vagaData.requisitos || []),
      JSON.stringify(vagaData.beneficios || [])
    ]);

    res.json({
      message: 'Vaga processada com sucesso',
      vaga_id: novaVaga.id,
      dados: vagaData
    });
  } catch (error) {
    console.error('Erro ao processar vaga:', error);
    res.status(500).json({ error: 'Erro ao processar vaga' });
  }
});

// Rota para processar vagas de uma empresa
api.get('/empresas/:id/vagas/processar', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscar informações da empresa
    const { rows: [empresa] } = await pool.query(
      'SELECT id, nome, jobboard FROM empresas WHERE id = $1',
      [id]
    );

    if (!empresa) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    console.log(`Processando vagas da empresa ${empresa.nome} (${empresa.jobboard})`);

    // 2. Extrair URLs usando a rota existente
    const urlsResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/scraper-job`, {
      url: empresa.jobboard
    });

    // 3. Buscar vagas ativas da empresa
    const { rows: vagasAtivas } = await pool.query(
      'SELECT id, url FROM vagas WHERE empresa_id = $1 AND status = true',
      [empresa.id]
    );

    // 4. Identificar vagas que não estão mais disponíveis
    const urlsExtraidas = Array.isArray(urlsResponse.data) ? urlsResponse.data : 
                         urlsResponse.data.vagas?.map((v: any) => typeof v === 'string' ? v : v.url_job || v.url) || [];
    
    const urlsAtivas = new Set(urlsExtraidas);
    const vagasDesativadas = vagasAtivas.filter(vaga => !urlsAtivas.has(vaga.url));

    // 5. Desativar vagas que não estão mais disponíveis
    if (vagasDesativadas.length > 0) {
      await pool.query(
        'UPDATE vagas SET status = false WHERE id = ANY($1)',
        [vagasDesativadas.map(v => v.id)]
      );
    }

    // 6. Identificar novas URLs
    const urlsExistentes = new Set(vagasAtivas.map(v => v.url));
    const urlsNovas: string[] = urlsExtraidas.filter((url: string) => !urlsExistentes.has(url));

    console.log(`Encontradas ${urlsNovas.length} novas vagas para processar`);

    // 7. Processar cada nova vaga
    const vagasProcessadas: Array<{ id: number; url: string; titulo: string }> = [];
    const erros: Array<{ url: string; erro: string }> = [];

    urlsNovas.forEach(async (url: string) => {
      try {
        // Usar a rota existente de análise com IA
        const aiResponse = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/job-ai-analysis`, {
          url
        });

        // Inserir a vaga no banco
        const vagaData = aiResponse.data as VagaData;
        const { rows: [novaVaga] } = await pool.query(`
          INSERT INTO vagas (
            empresa_id, url, titulo, area, senioridade, 
            modelo_trabalho, modelo_contrato, localizacao, 
            descricao, requisitos, beneficios, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
          RETURNING id
        `, [
          empresa.id,
          url, // Garantindo que a URL seja sempre salva
          vagaData.titulo || 'Sem título',
          vagaData.area || null,
          vagaData.senioridade || null,
          vagaData.modelo_trabalho || null,
          vagaData.modelo_contrato || null,
          JSON.stringify(vagaData.localizacao || {}),
          vagaData.descricao || '',
          JSON.stringify(vagaData.requisitos || []),
          JSON.stringify(vagaData.beneficios || [])
        ]);

        vagasProcessadas.push({
          id: novaVaga.id,
          url, // Incluindo a URL no retorno
          titulo: vagaData.titulo || 'Sem título'
        });
      } catch (error: unknown) {
        console.error(`Erro ao processar vaga ${url}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        erros.push({ url, erro: errorMessage });
      }
    });

    // 8. Atualizar última execução da rotina
    await pool.query(
      'UPDATE rotinas SET ultima_execucao = NOW() WHERE empresa_id = $1',
      [empresa.id]
    );

    // Aguardar todas as vagas serem processadas
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      total_urls_extraidas: urlsExtraidas.length,
      vagas_novas_processadas: vagasProcessadas,
      vagas_desativadas: vagasDesativadas.length,
      erros: erros.length > 0 ? erros : undefined
    });
  } catch (error) {
    console.error('Erro ao processar vagas:', error);
    res.status(500).json({ error: 'Erro ao processar vagas' });
  }
});

// Endpoint para buscar empresa por ID
api.get('/empresas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar informações da empresa com rotina
    const { rows: [empresa] } = await pool.query(`
      SELECT 
        e.id, 
        e.nome, 
        e.jobboard,
        e.created_at,
        e.updated_at,
        r.ultima_execucao,
        r.ativo as status,
        (
          SELECT COUNT(*) 
          FROM vagas v 
          WHERE v.empresa_id = e.id
        ) as total_vagas,
        (
          SELECT COUNT(*) 
          FROM vagas v 
          WHERE v.empresa_id = e.id 
          AND v.status = true
        ) as vagas_ativas
      FROM empresas e 
      LEFT JOIN rotinas r ON e.id = r.empresa_id 
      WHERE e.id = $1
    `, [id]);

    if (!empresa) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
});

// Endpoint para buscar vagas de uma empresa
api.get('/empresas/:id/vagas', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        v.id, 
        v.titulo,
        v.url,
        v.empresa_id,
        v.area,
        v.senioridade,
        v.modelo_trabalho,
        v.modelo_contrato,
        v.localizacao,
        v.descricao,
        v.requisitos,
        v.beneficios,
        v.status,
        v.created_at,
        v.updated_at,
        e.nome as empresa_nome,
        e.jobboard
      FROM vagas v 
      JOIN empresas e ON v.empresa_id = e.id 
      WHERE v.empresa_id = $1
      ORDER BY v.id DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar vagas da empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar vagas da empresa' });
  }
});

// Middleware de tratamento de erros
api.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'JSON inválido' });
  } else {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
const server = api.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
  console.log('NODE_ENV:', env.NODE_ENV);
  console.log('PLAYWRIGHT_BROWSERS_PATH:', env.PLAYWRIGHT_BROWSERS_PATH);
});

export default api;