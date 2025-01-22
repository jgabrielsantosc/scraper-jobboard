-- Função para pegar o próximo job da fila
create or replace function public.get_next_job()
returns table (
  id uuid,
  empresa_id uuid,
  url text
)
language plpgsql
security definer
as $$
declare
  v_job record;
begin
  -- Inicia uma transação
  for v_job in
    select f.id, f.empresa_id, f.url
    from public.fila_processamento f
    where f.status = 'pendente'
    order by f.created_at asc
    limit 1
    for update skip locked
  loop
    -- Atualiza o status do job para 'processando'
    update public.fila_processamento
    set status = 'processando',
        updated_at = now()
    where id = v_job.id;
    
    -- Retorna o job
    return query select v_job.id, v_job.empresa_id, v_job.url;
    return;
  end loop;
end;
$$; 