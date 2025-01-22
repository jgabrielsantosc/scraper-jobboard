-- Habilita a extensão pgcrypto para UUIDs
create extension if not exists "pgcrypto";

-- Habilita a extensão para full text search
create extension if not exists "pg_trgm";

-- Tabela de empresas
create table if not exists public.empresas (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  site text,
  linkedin text,
  jobboard text not null,
  status boolean default true,
  ultima_execucao timestamp with time zone,
  airtable_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de rotinas
create table if not exists public.rotinas (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade,
  ativo boolean default true,
  ultima_execucao timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de vagas
create table if not exists public.vagas (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  empresa_id uuid references public.empresas(id) on delete cascade,
  titulo text,
  area text,
  senioridade text,
  modelo_trabalho text,
  modelo_contrato text,
  localizacao jsonb,
  descricao text,
  requisitos jsonb,
  beneficios jsonb,
  status boolean default true,
  data_importacao timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de fila de processamento
create table if not exists public.fila_processamento (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references public.empresas(id) on delete cascade,
  url text not null,
  status text default 'pendente',
  tentativas int default 0,
  erro text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices
create index if not exists idx_vagas_empresa_id on public.vagas(empresa_id);
create index if not exists idx_rotinas_empresa_id on public.rotinas(empresa_id);
create index if not exists idx_vagas_url on public.vagas(url);
create index if not exists idx_fila_status on public.fila_processamento(status);

-- Função para atualizar o updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Triggers para atualizar updated_at
create trigger update_empresas_updated_at
  before update on public.empresas
  for each row
  execute function public.update_updated_at_column();

create trigger update_rotinas_updated_at
  before update on public.rotinas
  for each row
  execute function public.update_updated_at_column();

create trigger update_vagas_updated_at
  before update on public.vagas
  for each row
  execute function public.update_updated_at_column();

create trigger update_fila_processamento_updated_at
  before update on public.fila_processamento
  for each row
  execute function public.update_updated_at_column();

-- RLS (Row Level Security)
alter table public.empresas enable row level security;
alter table public.rotinas enable row level security;
alter table public.vagas enable row level security;
alter table public.fila_processamento enable row level security;

-- Políticas de acesso
create policy "Empresas são visíveis para todos"
  on public.empresas for select
  to authenticated
  using (true);

create policy "Rotinas são visíveis para todos"
  on public.rotinas for select
  to authenticated
  using (true);

create policy "Vagas são visíveis para todos"
  on public.vagas for select
  to authenticated
  using (true);

create policy "Fila é visível para todos"
  on public.fila_processamento for select
  to authenticated
  using (true);

-- Funções para estatísticas
create or replace function public.get_dashboard_stats()
returns json
language plpgsql
security definer
as $$
declare
  stats json;
begin
  select json_build_object(
    'total_empresas', (select count(*) from public.empresas),
    'empresas_ativas', (select count(*) from public.empresas where status = true),
    'total_vagas', (select count(*) from public.vagas),
    'vagas_ativas', (select count(*) from public.vagas where status = true),
    'vagas_na_fila', (select count(*) from public.fila_processamento where status = 'pendente')
  ) into stats;
  
  return stats;
end;
$$; 