-- Adicionar coluna url
ALTER TABLE vagas ADD COLUMN IF NOT EXISTS url VARCHAR(1000);

-- Criar índice para a coluna url
CREATE INDEX IF NOT EXISTS idx_vagas_url ON vagas(url);

-- Atualizar vagas existentes com um valor padrão
UPDATE vagas v 
SET url = e.jobboard || '/jobs/' || v.id 
FROM empresas e 
WHERE v.empresa_id = e.id 
AND v.url IS NULL; 