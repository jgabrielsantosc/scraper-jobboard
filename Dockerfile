FROM mcr.microsoft.com/playwright:v1.47.2-jammy 

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Instalar apenas o navegador Chromium
RUN npx playwright install chromium

# Compilar a aplicação
RUN npm run build

# Instalar dependências adicionais para o ambiente de produção
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
    libasound2

# Expor a porta 3001 (conforme especificado no App Spec)
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]