const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { scraperJobGupy } = require('./src/routes/jobScraper');
const app = express();
const port = 3000;

app.use(express.json());

// Atualizar a definição do Swagger
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
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Atualizar a rota para /scraper-job-gupy
app.post('/scraper-job-gupy', scraperJobGupy);

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});