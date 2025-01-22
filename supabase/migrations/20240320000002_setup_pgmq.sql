-- Habilita a extensão PGMQ
create extension if not exists "pgmq";

-- Cria a fila de jobs
select pgmq.create_queue('job_queue');

-- Função para adicionar jobs na fila
create or replace function public.enqueue_jobs(jobs jsonb[])
returns void
language plpgsql
security definer
as $$
declare
  job jsonb;
begin
  foreach job in array jobs
  loop
    perform pgmq.send('job_queue', job);
  end loop;
end;
$$;

-- Função para pegar o próximo job
create or replace function public.get_next_job()
returns jsonb
language plpgsql
security definer
as $$
declare
  msg jsonb;
begin
  select message into msg
  from pgmq.get_message('job_queue', visibility_timeout => interval '5 minutes');
  
  return msg;
end;
$$;

-- Função para arquivar mensagem processada
create or replace function public.archive_job(msg_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  perform pgmq.archive_message('job_queue', msg_id);
end;
$$;

-- Função para devolver mensagem à fila
create or replace function public.return_job_to_queue(msg_id bigint)
returns void
language plpgsql
security definer
as $$
begin
  perform pgmq.return_message('job_queue', msg_id);
end;
$$;

-- Função para obter estatísticas da fila
create or replace function public.get_queue_stats()
returns jsonb
language plpgsql
security definer
as $$
declare
  stats jsonb;
begin
  select json_build_object(
    'total', (select count(*) from pgmq.get_queue_stats('job_queue')),
    'processando', (select count(*) from pgmq.get_queue_stats('job_queue') where visible_at > now()),
    'arquivadas', (select count(*) from pgmq.get_queue_archive_stats('job_queue'))
  ) into stats;
  
  return stats;
end;
$$; 