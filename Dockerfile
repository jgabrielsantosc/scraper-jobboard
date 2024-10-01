# Imagem base
FROM node:18

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto dos arquivos do projeto, excluindo a pasta de testes
COPY . .
RUN rm -rf tests

# Compilar o TypeScript
RUN npm run build

# Expor a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]