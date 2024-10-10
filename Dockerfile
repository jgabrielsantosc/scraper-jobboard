FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas o package.json e package-lock.json (se existir)
COPY package*.json ./

# Remover o package-lock.json existente (se houver) e gerar um novo
RUN rm -f package-lock.json && npm install

# Após o RUN npm install
RUN npx playwright install chromium --with-deps

# Copiar o resto dos arquivos do projeto
COPY tsconfig*.json ./
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Definir variável de ambiente para o Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Expor a porta (ajuste conforme necessário)
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]