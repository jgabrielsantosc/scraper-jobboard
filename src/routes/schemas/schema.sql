-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    site VARCHAR(255),
    linkedin VARCHAR(255),
    jobboard VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT true,
    ultima_execucao TIMESTAMP,
    airtable_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de rotinas
CREATE TABLE IF NOT EXISTS rotinas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id),
    ativo BOOLEAN DEFAULT true,
    ultima_execucao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vagas
CREATE TABLE IF NOT EXISTS vagas (
    id SERIAL PRIMARY KEY,
    url VARCHAR(1000) NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id),
    titulo VARCHAR(255),
    area VARCHAR(100),
    senioridade VARCHAR(100),
    modelo_trabalho VARCHAR(100),
    modelo_contrato VARCHAR(100),
    localizacao JSONB,
    descricao TEXT,
    requisitos JSONB,
    beneficios JSONB,
    status BOOLEAN DEFAULT true,
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vagas_empresa_id ON vagas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rotinas_empresa_id ON rotinas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vagas_url ON vagas(url);

-- Função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rotinas_updated_at ON rotinas;
CREATE TRIGGER update_rotinas_updated_at
    BEFORE UPDATE ON rotinas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vagas_updated_at ON vagas;
CREATE TRIGGER update_vagas_updated_at
    BEFORE UPDATE ON vagas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 