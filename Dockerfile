FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Instale o Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./
RUN npm ci

# Copiar o código-fonte
COPY . .

# Instalar dependênciasr
RUN npm run build
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

# Expor a porta 3001 (conforme especificado no App Spec)
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]