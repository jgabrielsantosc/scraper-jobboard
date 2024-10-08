FROM mcr.microsoft.com/playwright:v1.41.0-jammy

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

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]