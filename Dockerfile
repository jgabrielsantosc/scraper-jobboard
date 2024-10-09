# Use a imagem oficial do Playwright
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Instalar dependências adicionais necessárias
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgbm-dev \
    && rm -rf /var/lib/apt/lists/*

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar o restante do código da aplicação
COPY . .

# Compilar a aplicação
RUN npm run build

# Expor a porta 3001
EXPOSE 3001

# Iniciar a aplicação
CMD ["npm", "run", "serve"] 