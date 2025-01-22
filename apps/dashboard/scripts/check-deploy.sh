#!/bin/bash

# Verificar arquivos necessários
required_files=(
    "Dockerfile"
    "next.config.js"
    "package.json"
    ".env.deploy"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo $file não encontrado"
        exit 1
    fi
done

# Verificar variáveis de ambiente
if [ ! -f ".env.deploy" ]; then
    echo "❌ Arquivo .env.deploy não encontrado"
    exit 1
fi

echo "✅ Todos os arquivos necessários encontrados" 