#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script da pasta apps/dashboard"
fi

log "Iniciando build do projeto..."

# Instalar dependências
pnpm install || error "Falha ao instalar dependências"

# Build do projeto
pnpm build || error "Falha ao fazer build"

# Copiar arquivos estáticos
log "Copiando arquivos estáticos..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

log "Build concluído com sucesso!"
log "Os arquivos para deploy estão em .next/standalone"
log "Para iniciar o servidor: NODE_ENV=production node .next/standalone/server.js" 