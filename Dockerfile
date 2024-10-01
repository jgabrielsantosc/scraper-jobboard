# Imagem base
FROM node:14

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos do projeto
COPY . .

# Compilar o TypeScript
RUN npm run build

# Expor a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["node", "dist/api.js"]