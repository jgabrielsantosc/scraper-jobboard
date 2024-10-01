"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const job_scraper_gupy_1 = require("./routes/job-scraper-gupy");
const job_gupy_1 = require("./routes/job-gupy");
const job_scraper_inhire_1 = require("./routes/job-scraper-inhire");
const job_inhire_1 = require("./routes/job-inhire");
const job_scraper_greenhouse_1 = require("./routes/job-scraper-greenhouse");
const job_greenhouse_1 = require("./routes/job-greenhouse");
const job_scraper_workable_1 = require("./routes/job-scraper-workable");
const job_workable_1 = require("./routes/job-workable");
const job_scraper_quickin_1 = require("./routes/job-scraper-quickin");
const job_quickin_1 = require("./routes/job-quickin");
const job_scraper_lever_1 = require("./routes/job-scraper-lever");
const job_lever_1 = require("./routes/job-lever");
const job_scraper_abler_1 = require("./routes/job-scraper-abler");
const job_abler_1 = require("./routes/job-abler");
const job_scraper_solides_1 = require("./routes/job-scraper-solides");
const job_solides_1 = require("./routes/job-solides");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3001;
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
        },
        '/scraper-job-abler': {
            post: {
                summary: 'Coletar informações de vagas do Abler',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    url: {
                                        type: 'string',
                                        description: 'URL do Abler Job Board'
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
                                                    url: { type: 'string' },
                                                    pub_date: { type: 'string' },
                                                    seniority: { type: 'string' },
                                                    contract_model: { type: 'string' },
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
        '/job-abler': {
            post: {
                summary: 'Buscar informações detalhadas de uma vaga do Abler',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    url: {
                                        type: 'string',
                                        description: 'URL da vaga específica do Abler'
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
                                        location: { type: 'string' },
                                        contractModel: { type: 'string' },
                                        description: { type: 'string' },
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
                    '404': {
                        description: 'Não foi possível encontrar informações da vaga'
                    },
                    '500': {
                        description: 'Erro ao coletar informações da vaga'
                    }
                }
            }
        },
        '/scraper-job-solides': {
            post: {
                summary: 'Coletar informações de vagas do Solides',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    url: {
                                        type: 'string',
                                        description: 'URL do Solides Job Board'
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
                                                type: 'string'
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
                    '404': {
                        description: 'Nenhuma vaga encontrada'
                    },
                    '500': {
                        description: 'Erro ao coletar informações das vagas'
                    }
                }
            }
        },
        '/job-solides': {
            post: {
                summary: 'Coletar informações detalhadas de uma vaga do Solides',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    url: {
                                        type: 'string',
                                        description: 'URL da vaga do Solides'
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
                                        contractType: { type: 'string' },
                                        jobType: { type: 'string' },
                                        seniority: { type: 'string' },
                                        description: { type: 'string' },
                                        educations: { type: 'string' },
                                        address: { type: 'string' }
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
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Routes
app.post('/scraper-job-gupy', (req, res, next) => (0, job_scraper_gupy_1.scraperJobGupy)(req, res, next));
app.post('/job-gupy', (req, res, next) => (0, job_gupy_1.jobGupyHandler)(req, res, next));
app.post('/scraper-job-inhire', job_scraper_inhire_1.scraperJobInhireHandler);
app.post('/job-inhire', (req, res, next) => (0, job_inhire_1.jobInhireHandler)(req, res, next));
app.post('/scraper-job-greenhouse', (req, res, next) => (0, job_scraper_greenhouse_1.scraperJobGreenhouse)(req, res, next));
app.post('/job-greenhouse', job_greenhouse_1.jobGreenhouseHandler);
app.post('/scraper-job-workable', (req, res, next) => (0, job_scraper_workable_1.scraperJobWorkableHandler)(req, res, next));
app.post('/job-workable', (req, res, next) => (0, job_workable_1.jobWorkableHandler)(req, res, next));
app.post('/scraper-job-quickin', (req, res, next) => (0, job_scraper_quickin_1.scraperJobQuickinHandler)(req, res, next));
app.post('/job-quickin', (req, res, next) => (0, job_quickin_1.jobQuickinHandler)(req, res, next));
app.post('/scraper-job-lever', (req, res, next) => (0, job_scraper_lever_1.scraperJobLeverHandler)(req, res, next));
app.post('/job-lever', (req, res, next) => (0, job_lever_1.jobLeverHandler)(req, res, next));
app.post('/scraper-job-abler', (req, res, next) => (0, job_scraper_abler_1.scraperJobAblerHandler)(req, res, next));
app.post('/job-abler', (req, res, next) => (0, job_abler_1.jobAblerHandler)(req, res, next));
app.post('/scraper-job-solides', (req, res, next) => (0, job_scraper_solides_1.scraperJobSolidesHandler)(req, res, next));
app.post('/job-solides', (req, res, next) => (0, job_solides_1.jobSolidesHandler)(req, res, next));
const server = app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Porta ${port} está em uso, tentando a próxima...`);
        server.close();
        const nextPort = port + 1;
        app.listen(nextPort, () => {
            console.log(`API rodando em http://localhost:${nextPort}`);
        });
    }
    else {
        console.error('Erro ao iniciar o servidor:', err);
    }
});
