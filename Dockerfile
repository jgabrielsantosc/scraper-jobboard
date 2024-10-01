# Imagem base
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci
COPY . .

# Instalar dependências
RUN npm ci

# Copiar o resto dos arquivos do projeto, excluindo a pasta de testes
COPY src ./src

# Instalar Playwright
RUN npx playwright install --with-deps chromium

# Compilar o TypeScript
RUN npm run build

# Expor a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]

# Copiar o arquivo api.ts do novo local
