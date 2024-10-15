"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const unified_job_details_1 = require("./routes/unified-job-details");
const urls_scraper_1 = require("./routes/urls-scraper");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carrega as variáveis de ambiente do arquivo .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
console.log('Variáveis de ambiente em api.ts:');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'Definido' : 'Não definido');
console.log('FIRECRAWL_API_URL:', process.env.FIRECRAWL_API_URL);
process.env.PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/usr/local/share/playwright';
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
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
        }
    }
};
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Rota única para processar detalhes de qualquer job board
app.post('/job-details', unified_job_details_1.handleJobDetailsRequest);
// Rota única para processar qualquer job board
app.post('/scraper-job', urls_scraper_1.unifiedUrlScraper);
// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: 'JSON inválido' });
    }
    else {
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
