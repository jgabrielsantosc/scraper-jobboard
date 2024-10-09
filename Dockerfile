FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Instalar dependências
RUN npm ci

# Instalar os navegadores do Playwright
RUN npx playwright install chromium firefox webkit

# Compilar TypeScript
RUN npm run build

# Expor a porta (ajuste conforme necessário)
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]