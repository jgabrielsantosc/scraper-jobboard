# 🎯 Job Scraper 

Uma plataforma completa para coletar e gerenciar vagas de emprego de diferentes job boards de forma automatizada.

## 📋 Estrutura do Projeto

Este é um monorepo que contém duas aplicações principais:

### 🔹 API (`/apps/api`)
API responsável pelo scraping e processamento das vagas. Principais características:
- Web scraping de múltiplas plataformas de emprego
- Processamento de dados com IA
- API RESTful com Swagger
- Suporte a mais de 15 job boards diferentes

### 🔹 Dashboard (`/apps/dashboard`)
Interface web para visualização e gerenciamento das vagas. Principais características:
- Visualização em tempo real das vagas coletadas
- Filtros avançados de busca
- Interface moderna e responsiva
- Gerenciamento de scraping jobs


### Instalação
```bash
# Instalar dependências
pnpm install

# Executar API
cd apps/api
pnpm dev

# Executar Dashboard
cd apps/dashboard
pnpm dev
```

### Portas
- API: http://localhost:3001
- Dashboard: http://localhost:3000

## 📚 Documentação

Cada aplicação possui sua própria documentação detalhada:
- [Documentação da API](/apps/api/README.md)
- [Documentação do Dashboard](/apps/dashboard/README.md)

## 🛠️ Tecnologias Principais

- TypeScript
- Node.js
- Next.js
- Playwright
- Docker
- Supabase

## 🔐 Variáveis de Ambiente

Cada aplicação possui seu próprio conjunto de variáveis de ambiente. Consulte os READMEs específicos de cada app para mais detalhes.

## Desenvolvimento Local

### Pré-requisitos
- Supabase CLI
- Node.js 18+
- pnpm

### Configuração

1. Instale o Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Inicie o Supabase:
```bash
supabase start
```

3. Configure as variáveis de ambiente em `.env.local` com as chaves fornecidas

4. Inicie o projeto:
```bash
pnpm dev
```

---

Desenvolvido com ❤️ por [João Santos](https://github.com/joaogsantosc)
```