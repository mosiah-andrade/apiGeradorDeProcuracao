-- Consolida status duplicados de um mesmo usuário e preserva os clientes na coluna principal.
with status_classificados as (
  select
    id,
    first_value(id) over (
      partition by user_id, lower(btrim(nome))
      order by ordem asc, created_at asc, id asc
    ) as status_principal_id
  from public.kanban_status
)
update public.clientes as cliente
set status_id = status_classificados.status_principal_id
from status_classificados
where cliente.status_id = status_classificados.id
  and status_classificados.id <> status_classificados.status_principal_id;

with status_classificados as (
  select
    id,
    first_value(id) over (
      partition by user_id, lower(btrim(nome))
      order by ordem asc, created_at asc, id asc
    ) as status_principal_id
  from public.kanban_status
)
delete from public.kanban_status as status
using status_classificados
where status.id = status_classificados.id
  and status_classificados.id <> status_classificados.status_principal_id;

alter table public.kanban_status
  add column if not exists nome_normalizado text generated always as (lower(btrim(nome))) stored;

alter table public.kanban_status
  add constraint kanban_status_user_nome_normalizado_key
  unique (user_id, nome_normalizado);
