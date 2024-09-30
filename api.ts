import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ExpressHandler } from './src/types';
import { scraperJobGupy } from './src/routes/job-scraper-gupy';
import { jobGupyHandler } from './src/routes/job-gupy';
import { scraperJobInhireHandler } from './src/routes/job-scraper-inhire';
import { jobInhireHandler } from './src/routes/job-inhire';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

// Swagger configuration
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Job Scraper API',
    version: '1.0.0',
    description: 'API para coletar informações de vagas de diferentes plataformas'
  },
  paths: {
    '/scraper-job-gupy': {
      post: {
        summary: 'Coletar informações de vagas do Gupy',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do Gupy Job Board'
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
                          titulo: { type: 'string' },
                          localizacao: { type: 'string' },
                          tipo: { type: 'string' },
                          link: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida'
          },
          '500': {
            description: 'Erro ao coletar informações das vagas'
          }
        }
      }
    },
    '/job-gupy': {
      post: {
        summary: 'Coletar informações detalhadas de uma vaga específica do Gupy',
        parameters: [
          {
            in: 'query',
            name: 'url',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'URL da vaga específica no Gupy'
          }
        ],
        responses: {
          '200': {
            description: 'Informações detalhadas da vaga coletadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    type_job: { type: 'string' },
                    work_model: { type: 'string' },
                    pcd: { type: 'string' },
                    pub_job: { type: 'string' },
                    deadline: { type: 'string' },
                    description_job: { type: 'string' },
                    requirements: { type: 'string' },
                    infos_extras: { type: 'string' },
                    etapas: { type: 'string' },
                    about: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida'
          },
          '500': {
            description: 'Erro ao coletar informações da vaga'
          }
        }
      }
    },
    '/scraper-job-inhire': {
      post: {
        summary: 'Coletar informações de vagas do InHire',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do InHire Job Board'
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
                          title_job: { type: 'string' },
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
            description: 'URL não fornecida'
          },
          '500': {
            description: 'Erro ao coletar informações das vagas'
          }
        }
      }
    },
    '/job-inhire': {
      post: {
        summary: 'Coletar informações detalhadas de uma vaga específica do InHire',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga específica no InHire'
                  }
                },
                required: ['url']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Informações detalhadas da vaga coletadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    workModel: { type: 'string' },
                    location: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida'
          },
          '500': {
            description: 'Erro ao coletar informações da vaga'
          }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.post('/scraper-job-gupy', (req, res, next) => scraperJobGupy(req, res, next));
app.post('/job-gupy', (req, res, next) => jobGupyHandler(req, res, next));
app.post('/scraper-job-inhire', scraperJobInhireHandler);
app.post('/job-inhire', (req, res, next) => jobInhireHandler(req, res, next));

const server = app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Porta ${port} está em uso, tentando a próxima...`);
    server.close();
    const nextPort = port + 1;
    app.listen(nextPort, () => {
      console.log(`API rodando em http://localhost:${nextPort}`);
    });
  } else {
    console.error('Erro ao iniciar o servidor:', err);
  }
});