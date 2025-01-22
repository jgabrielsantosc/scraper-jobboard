import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { handleJobDetailsRequest } from './routes/unified-job-details';
import { unifiedUrlScraper } from './routes/urls-scraper';
import { jobAIAnalyzerHandler } from './routes/job-ai-analyzer';
import dotenv from 'dotenv';
import path from 'path';
import { apiLimiter } from './middleware/rate-limit'
import type { ExpressHandler } from './types';
import { apiLogger } from './middleware/logger'

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

// Swagger configuration
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Job Scraper API',
    version: '1.0.0',
    description: 'API para coletar informações de vagas de diferentes plataformas. Limite de 100 requisições por minuto por API key.'
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key'
      }
    }
  },
  security: [
    { ApiKeyAuth: [] }
  ],
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
app.use(apiLogger);

// Rotas sem middleware de autenticação (já está nos handlers)
app.post('/job-details', handleJobDetailsRequest);
app.post('/scraper-job', unifiedUrlScraper);
app.post('/job-ai-analysis', jobAIAnalyzerHandler);

// Middleware de tratamento de erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'JSON inválido' });
  } else {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export const server = app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

console.log('Iniciando aplicação...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);
console.log('PORT:', process.env.PORT);