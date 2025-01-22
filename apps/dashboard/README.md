# 🎯 Job Scraper Dashboard

Interface web moderna para visualização e gerenciamento de vagas coletadas pela API de scraping.

## 🚀 Funcionalidades

- ✨ Interface moderna e responsiva
- 📊 Visualização em tempo real das vagas
- 🔍 Filtros avançados de busca
- 📱 Design mobile-first
- 🎨 Tema claro/escuro
- 🔐 Autenticação integrada com Supabase

## 🛠️ Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Supabase

## 💻 Como Executar

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar em produção
pnpm start
```

O dashboard estará disponível em [http://localhost:3000](http://localhost:3000).

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Estrutura do Projeto

```
src/
  ├── app/           # Rotas e páginas
  ├── components/    # Componentes React
  ├── lib/          # Utilitários e configurações
  ├── hooks/        # React hooks
  └── types/        # Definições de tipos
```

---

Desenvolvido com ❤️ por [João Santos](https://github.com/joaogsantosc)
