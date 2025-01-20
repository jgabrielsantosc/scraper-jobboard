import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ExpressHandler } from './types';
import { handleJobDetailsRequest } from './routes/unified-job-details';
import { unifiedUrlScraper } from './routes/urls-scraper';
import { jobAIAnalyzerHandler } from './routes/job-ai-analyzer';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { Pool } from 'pg';
import Redis from 'ioredis';


// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Variáveis de ambiente em api.ts:');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'Definido' : 'Não definido');
console.log('FIRECRAWL_API_URL:', process.env.FIRECRAWL_API_URL);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Definido' : 'Não definido');

process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/usr/local/share/playwright';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

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

// Swagger configuration
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Job Scraper API',
    version: '1.0.0',
    description: 'API para coletar informações de vagas de diferentes plataformas'
  },
  paths: {
    '/scraper-job': {
      post: {
        summary: 'Coletar informações de vagas de qualquer job board',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do job board'
                  }
                },
                required: ['url']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Informações das vagas coletadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalVagas: {
                      type: 'integer'
                    },
                    vagas: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url_job: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida ou job board não suportado'
          },
          '500': {
            description: 'Erro ao processar a requisição'
          }
        }
      }
    },
    '/job-details': {
      post: {
        summary: 'Coletar informações detalhadas de uma vaga',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga no job board'
                  }
                },
                required: ['url']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Informações da vaga coletadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    location: { type: 'string' },
                    description: { type: 'string' },
                    // Outros campos específicos de cada job board...
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida ou job board não suportado'
          },
          '500': {
            description: 'Erro ao processar a requisição'
          }
        }
      }
    },
    '/job-ai-analysis': {
      post: {
        summary: 'Analisa uma vaga usando IA para extrair informações estruturadas',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga para análise'
                  }
                },
                required: ['url']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Análise da vaga realizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    originalData: {
                      type: 'object',
                      description: 'Dados originais da vaga'
                    },
                    aiAnalysis: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        company: { type: 'string' },
                        location: { type: 'string' },
                        description: { type: 'string' },
                        requirements: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        benefits: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        seniority: { type: 'string' },
                        salary: {
                          type: 'object',
                          properties: {
                            min: { type: 'number' },
                            max: { type: 'number' },
                            currency: { type: 'string' }
                          }
                        },
                        workModel: { type: 'string' },
                        contractType: { type: 'string' },
                        technologies: {
                          type: 'array',
                          items: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida ou job board não suportado'
          },
          '500': {
            description: 'Erro ao processar a requisição'
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota única para processar detalhes de qualquer job board
app.post('/job-details', handleJobDetailsRequest);

// Rota única para processar qualquer job board
app.post('/scraper-job', unifiedUrlScraper);

// Nova rota para análise com IA
app.post('/job-ai-analysis', jobAIAnalyzerHandler);

// Endpoint para estatísticas
app.get('/stats', async (req, res) => {
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
app.get('/empresas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, 
        e.nome, 
        e.site,
        e.linkedin,
        e.jobboard,
        e.created_at,
        e.updated_at,
        r.ultima_execucao,
        r.ativo as status
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
app.get('/vagas', async (req, res) => {
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
app.get('/fila', async (req, res) => {
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
app.get('/logs', async (req, res) => {
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

// Middleware de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'JSON inválido' });
  } else {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const server = app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

console.log('Iniciando aplicação...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);
console.log('PORT:', process.env.PORT);