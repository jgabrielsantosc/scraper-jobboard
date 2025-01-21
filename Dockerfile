FROM node:18-alpine

WORKDIR /app

# Instalar dependências do Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Configurar variáveis de ambiente do Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Copiar arquivos do projeto
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Instalar dependências
RUN npm ci

# Build do projeto
RUN npm run build:api

# Expor porta da API
EXPOSE 3001

# Comando para iniciar será definido no docker-compose
