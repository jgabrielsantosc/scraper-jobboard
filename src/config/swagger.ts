export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Job Scraper API',
    version: '1.0.0',
    description: 'API para coletar informações de vagas de diferentes plataformas'
  },
  paths: {
    '/scraper-job': {
      post: {
        tags: ['Scraper'],
        summary: 'Extrai URLs de vagas de um job board',
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
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'URLs extraídas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/job-ai-analysis': {
      post: {
        tags: ['Análise'],
        summary: 'Analisa uma vaga usando IA',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL da vaga'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Vaga analisada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    titulo: { type: 'string' },
                    area: { type: 'string' },
                    senioridade: { type: 'string' },
                    modelo_trabalho: { type: 'string' },
                    modelo_contrato: { type: 'string' },
                    localizacao: {
                      type: 'object',
                      properties: {
                        cidade: { type: 'string' },
                        estado: { type: 'string' },
                        pais: { type: 'string' }
                      }
                    },
                    descricao: { type: 'string' },
                    requisitos: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    beneficios: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
