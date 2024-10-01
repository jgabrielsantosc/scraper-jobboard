FROM mcr.microsoft.com/playwright:v1.41.0-jammy

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar todo o código fonte
COPY . .

# Instalar dependências do Playwright
RUN npx playwright install --with-deps chromium

# Compilar a aplicação
RUN npm run build

# Expor a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]