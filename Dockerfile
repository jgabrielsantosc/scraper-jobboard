FROM mcr.microsoft.com/playwright:v1.48.0-jammy

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas o package.json e package-lock.json (se existir)
COPY package*.json ./

# Remover o package-lock.json existente (se houver) e gerar um novo
RUN rm -f package-lock.json && npm install

# Copiar o resto dos arquivos do projeto
COPY tsconfig*.json ./
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Expor a porta (ajuste conforme necessário)
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]