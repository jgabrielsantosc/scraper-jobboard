# Imagem base
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Diretório de trabalho
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar arquivos de configuração de TypeScript e o resto dos arquivos do projeto
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

# Instalar Playwright
RUN npx playwright install --with-deps chromium

# Compilar o TypeScript
RUN npm run build

# Adicionar comando para listar o conteúdo do diretório dist
RUN ls -R /usr/src/app/dist

# Adicionar comando para exibir o conteúdo do arquivo api.js
RUN cat /usr/src/app/dist/api.js

# Expor a porta que a aplicação usa
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]
