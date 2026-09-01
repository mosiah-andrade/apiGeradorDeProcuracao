-- Campos comerciais da oportunidade.
alter table public.clientes
  add column if not exists consumo_medio_kwh numeric,
  add column if not exists demanda_estimada_kw numeric,
  add column if not exists potencia_sugerida_kwp numeric,
  add column if not exists origem text,
  add column if not exists temperatura_lead text check (temperatura_lead in ('frio', 'morno', 'quente')) default 'frio',
  add column if not exists proximo_contato_em date,
  add column if not exists observacoes_comerciais text;

create table if not exists public.crm_atividades (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  titulo text not null,
  tipo text not null check (tipo in ('ligacao', 'mensagem', 'tarefa', 'nota')) default 'tarefa',
  concluida boolean not null default false,
  agendada_para date,
  concluida_em timestamp with time zone
);

create index if not exists crm_atividades_cliente_agendada_idx
  on public.crm_atividades (cliente_id, concluida, agendada_para);

alter table public.crm_atividades enable row level security;

create policy "Usuários podem gerenciar atividades comerciais próprias"
  on public.crm_atividades
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.crm_atividades to authenticated;
notify pgrst, 'reload schema';
