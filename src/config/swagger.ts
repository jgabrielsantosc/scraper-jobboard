export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Job Scraper API',
    version: '1.0.0',
    description: 'API para coletar informações de vagas de diferentes plataformas'
  },
  paths: {
    '/empresas': {
      get: {
        tags: ['Empresas'],
        summary: 'Lista todas as empresas',
        responses: {
          '200': {
            description: 'Lista de empresas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Empresa'
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Empresas'],
        summary: 'Cria uma nova empresa',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EmpresaInput'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Empresa criada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Empresa'
                }
              }
            }
          }
        }
      }
    },
    '/empresas/{id}': {
      get: {
        tags: ['Empresas'],
        summary: 'Busca uma empresa por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Empresa encontrada',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Empresa'
                }
              }
            }
          },
          '404': {
            description: 'Empresa não encontrada'
          }
        }
      },
      put: {
        tags: ['Empresas'],
        summary: 'Atualiza uma empresa',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EmpresaInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Empresa atualizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Empresa'
                }
              }
            }
          },
          '404': {
            description: 'Empresa não encontrada'
          }
        }
      },
      delete: {
        tags: ['Empresas'],
        summary: 'Remove uma empresa',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '204': {
            description: 'Empresa removida com sucesso'
          },
          '404': {
            description: 'Empresa não encontrada'
          }
        }
      }
    },
    '/empresas/{id}/extrair-urls': {
      post: {
        tags: ['Empresas'],
        summary: 'Extrai URLs de vagas do job board da empresa',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'URLs extraídas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    empresa_id: { type: 'string' },
                    empresa_nome: { type: 'string' },
                    total_urls: { type: 'number' },
                    urls: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Empresa não encontrada'
          }
        }
      }
    },
    '/empresas/{id}/extrair-vagas': {
      post: {
        tags: ['Empresas'],
        summary: 'Extrai e processa vagas do job board da empresa',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Vagas extraídas com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    empresa_id: { type: 'string' },
                    empresa_nome: { type: 'string' },
                    total_vagas: { type: 'number' },
                    vagas_processadas: { type: 'number' },
                    vagas: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          url: { type: 'string' },
                          detalhes: { type: 'object' },
                          analise_ia: { $ref: '#/components/schemas/VagaAnaliseIA' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Empresa não encontrada'
          }
        }
      }
    },
    '/empresas/{id}/processar-vagas': {
      post: {
        tags: ['Empresas'],
        summary: 'Adiciona empresa na fila de processamento de vagas',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Empresa adicionada à fila',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    empresa_id: { type: 'string' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Empresa não encontrada'
          }
        }
      }
    },
    '/vagas': {
      get: {
        tags: ['Vagas'],
        summary: 'Lista todas as vagas',
        responses: {
          '200': {
            description: 'Lista de vagas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Vaga'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/vagas/detalhes': {
      post: {
        tags: ['Vagas'],
        summary: 'Extrai detalhes básicos de uma vaga',
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
            description: 'Detalhes extraídos com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VagaDetalhes'
                }
              }
            }
          }
        }
      }
    },
    '/vagas/analise-ia': {
      post: {
        tags: ['Vagas'],
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
                  $ref: '#/components/schemas/VagaAnaliseIA'
                }
              }
            }
          }
        }
      }
    },
    '/stats': {
      get: {
        tags: ['Estatísticas'],
        summary: 'Obtém estatísticas do sistema',
        responses: {
          '200': {
            description: 'Estatísticas obtidas com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Stats'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Empresa: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string' },
          site: { type: 'string' },
          linkedin: { type: 'string' },
          jobboard: { type: 'string' },
          status: { type: 'boolean' },
          ultima_execucao: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      EmpresaInput: {
        type: 'object',
        required: ['nome', 'jobboard'],
        properties: {
          nome: { type: 'string' },
          site: { type: 'string' },
          linkedin: { type: 'string' },
          jobboard: { type: 'string' },
          status: { type: 'boolean' }
        }
      },
      Vaga: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          empresa_id: { type: 'string' },
          url: { type: 'string' },
          titulo: { type: 'string' },
          area: { type: 'string' },
          senioridade: { type: 'string' },
          modelo_trabalho: { type: 'string' },
          modelo_contrato: { type: 'string' },
          localizacao: { type: 'object' },
          descricao: { type: 'string' },
          requisitos: { type: 'array', items: { type: 'string' } },
          beneficios: { type: 'array', items: { type: 'string' } },
          status: { type: 'boolean' },
          data_importacao: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      VagaDetalhes: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          empresa: { type: 'string' },
          localizacao: { type: 'string' },
          descricao: { type: 'string' }
        }
      },
      VagaAnaliseIA: {
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
      },
      Stats: {
        type: 'object',
        properties: {
          total_empresas: { type: 'number' },
          empresas_ativas: { type: 'number' },
          vagas_ativas: { type: 'number' },
          vagas_na_fila: { type: 'number' }
        }
      }
    }
  }
};
