import express from 'express';
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { ExpressHandler } from './src/types';
import { scraperJobGupy } from './src/routes/job-scraper-gupy';
import { jobGupyHandler } from './src/routes/job-gupy';
import { scraperJobInhireHandler } from './src/routes/job-scraper-inhire';
import { jobInhireHandler } from './src/routes/job-inhire';
import { scraperJobGreenhouse } from './src/routes/job-scraper-greenhouse';
import { jobGreenhouseHandler } from './src/routes/job-greenhouse';
import { scraperJobWorkableHandler } from './src/routes/job-scraper-workable';
import { jobWorkableHandler } from './src/routes/job-workable';
import { scraperJobQuickinHandler } from './src/routes/job-scraper-quickin';
import { jobQuickinHandler } from './src/routes/job-quickin';
import { scraperJobLeverHandler } from './src/routes/job-scraper-lever';
import { jobLeverHandler } from './src/routes/job-lever';

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
        summary: 'Coletar informações detalhadas de uma vaga do Gupy',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga específica do Gupy'
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
        summary: 'Coletar informações de vagas do Inhire',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do Inhire Job Board'
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
        summary: 'Buscar informações de uma vaga do Inhire',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga no Inhire'
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
          '404': {
            description: 'Não foi possível encontrar informações da vaga'
          },
          '500': {
            description: 'Erro ao coletar informações da vaga'
          }
        }
      }
    },
    '/scraper-job-greenhouse': {
      post: {
        summary: 'Coletar informações de vagas do Greenhouse',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do Greenhouse Job Board'
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
                          area: { type: 'string' },
                          title: { type: 'string' },
                          location: { type: 'string' },
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
    '/job-greenhouse': {
      post: {
        summary: 'Buscar informações de uma vaga do Greenhouse',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga no Greenhouse'
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
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida'
          },
          '404': {
            description: 'Não foi possível encontrar informações da vaga'
          },
          '500': {
            description: 'Erro ao coletar informações da vaga'
          }
        }
      }
    },
    '/scraper-job-workable': {
      post: {
        summary: 'Coletar informações de vagas do Workable',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do Workable Job Board'
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
                    totalVagas: { type: 'number' },
                    vagas: {
                      type: 'array',
                      items: { type: 'string' }
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
    '/job-workable': {
      post: {
        summary: 'Buscar informações de uma vaga do Workable',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    example: 'https://apply.workable.com/pravaler-1/j/42357AC575/',
                    description: 'URL da vaga no Workable'
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
                    workModel: { type: 'string' },
                    typeJob: { type: 'string' },
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
    },
    '/scraper-job-quickin': {
      post: {
        summary: 'Coletar informações de vagas do Quickin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do Quickin Job Board'
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
                          title: { type: 'string' },
                          link: { type: 'string' },
                          location: { type: 'string' },
                          work_model: { type: 'string' }
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
    '/job-quickin': {
      post: {
        summary: 'Coletar informações detalhadas de uma vaga do Quickin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga no Quickin',
                    example: 'https://jobs.quickin.io/koin/jobs/66f5c84ed7a208001334eedd'
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
                    contract_model: { type: 'string' },
                    location: { type: 'string' },
                    work_model: { type: 'string' },
                    all_content: { type: 'string' },
                    requirements: { type: 'string' },
                    benefits: { type: 'string' }
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
    '/scraper-job-lever': {
      post: {
        summary: 'Coletar informações de vagas do Lever',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL do Lever Job Board'
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
                          area: { type: 'string' },
                          title: { type: 'string' },
                          url_job: { type: 'string' },
                          work_model: { type: 'string' },
                          type_job: { type: 'string' },
                          location: { type: 'string' }
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
    '/job-lever': {
      post: {
        summary: 'Buscar informações detalhadas de uma vaga do Lever',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga específica do Lever'
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
                    location_workmodel: { type: 'string' },
                    area: { type: 'string' },
                    type_job: { type: 'string' },
                    work_model: { type: 'string' },
                    description: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'URL não fornecida'
          },
          '404': {
            description: 'Não foi possível encontrar informações da vaga'
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
app.post('/scraper-job-greenhouse', (req, res, next) => scraperJobGreenhouse(req, res, next));
app.post('/job-greenhouse', jobGreenhouseHandler);
app.post('/scraper-job-workable', (req, res, next) => scraperJobWorkableHandler(req, res, next));
app.post('/job-workable', (req, res, next) => jobWorkableHandler(req, res, next));
app.post('/scraper-job-quickin', (req, res, next) => scraperJobQuickinHandler(req, res, next));
app.post('/job-quickin', (req, res, next) => jobQuickinHandler(req, res, next));
app.post('/scraper-job-lever', (req, res, next) => scraperJobLeverHandler(req, res, next));
app.post('/job-lever', (req, res, next) => jobLeverHandler(req, res, next));

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