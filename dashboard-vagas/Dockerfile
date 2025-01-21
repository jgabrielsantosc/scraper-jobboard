FROM node:18-alpine AS builder

WORKDIR /app

# Copiar apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o resto dos arquivos
COPY . .

# Build do projeto
RUN npm run build

# Imagem de produção
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas os arquivos necessários
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expor porta do Next.js
EXPOSE 3000

# Iniciar em modo produção
CMD ["node", "server.js"] 