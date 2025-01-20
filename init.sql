-- Criação das tabelas baseadas no diagrama
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    site VARCHAR(255),
    linkedin VARCHAR(255),
    jobboard VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vagas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    titulo VARCHAR(255) NOT NULL,
    area VARCHAR(100),
    senioridade VARCHAR(50),
    modelo_trabalho VARCHAR(50),
    modelo_contrato VARCHAR(50),
    localizacao JSONB,
    descricao TEXT,
    requisitos JSONB,
    beneficios JSONB,
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rotinas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    intervalo_atualizacao INTEGER,
    ultima_execucao TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rotinas_empresa_id ON rotinas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vagas_status ON vagas(status);