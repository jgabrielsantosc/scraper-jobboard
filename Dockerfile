FROM mcr.microsoft.com/playwright:v1.47.2-jammy 

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar dependênciasr
RUN npm ci

# Copiar todo o código fonte
COPY . .

# Instalar Playwright e seus navegadores
RUN npm install playwright
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Verificar a instalação do Chromium
RUN ls -la /usr/src/app/node_modules/playwright-core/.local-browsers/chromium-*/chrome-linux/

# Definir permissões corretas
RUN chmod -R 777 /usr/src/app/node_modules/playwright-core/.local-browsers

# Definir variáveis de ambiente para o Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/src/app/node_modules/playwright-core/.local-browsers
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

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