# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos do workspace
COPY . .

# Instalar dependências do monorepo
RUN npm install -g pnpm
RUN pnpm install

# Build do dashboard
WORKDIR /app/apps/dashboard
RUN pnpm build

# Estágio de produção
FROM node:18-alpine AS runner

WORKDIR /app

# Copiar arquivos necessários do build
COPY --from=builder /app/apps/dashboard/.next/standalone ./
COPY --from=builder /app/apps/dashboard/.next/static ./.next/static
COPY --from=builder /app/apps/dashboard/public ./public

# Variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["node", "server.js"] 