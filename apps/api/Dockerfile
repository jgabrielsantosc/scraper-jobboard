FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# Copiar apenas os arquivos necessários da API
COPY package*.json ./
RUN rm -f package-lock.json && npm install

# Instale explicitamente os navegadores do Playwright
RUN npx playwright install --with-deps chromium

# Copiar arquivos de configuração e código fonte
COPY tsconfig*.json ./
COPY src ./src
COPY .env.local .env

RUN npm run build

# Defina a variável de ambiente PLAYWRIGHT_BROWSERS_PATH
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 3001

CMD ["npm", "run", "start:prod"] 