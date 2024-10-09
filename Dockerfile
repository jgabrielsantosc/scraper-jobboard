FROM node:18-slim

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Instalar dependências
RUN npm ci

# Instalar navegadores do Playwright
RUN npx playwright install --with-deps chromium

# Compilar TypeScript
RUN npm run build

# Expor a porta (ajuste conforme necessário)
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]