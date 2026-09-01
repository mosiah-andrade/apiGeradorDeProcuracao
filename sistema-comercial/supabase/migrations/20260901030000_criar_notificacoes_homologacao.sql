create table if not exists public.homologacao_notificacoes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  projeto_id uuid references public.homologacao_projetos(id) on delete cascade,
  tipo text not null check (tipo in ('projeto_recebido', 'prazo_proximo')),
  chave text not null,
  titulo text not null,
  descricao text,
  lida_em timestamp with time zone,
  unique (user_id, chave)
);

alter table public.homologacao_notificacoes enable row level security;

create policy "Usuários podem gerenciar suas notificações de homologação"
  on public.homologacao_notificacoes
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Preenche o histórico inicial para que projetos recebidos antes desta migração
-- também apareçam no sino.
insert into public.homologacao_notificacoes (
  user_id, projeto_id, tipo, chave, titulo, descricao
)
select
  projeto.user_id,
  projeto.id,
  'projeto_recebido',
  'projeto-recebido:' || projeto.id,
  'Projeto recebido',
  projeto.nome || ' foi adicionado à homologação.'
from public.homologacao_projetos as projeto
on conflict (user_id, chave) do nothing;

-- Cria também o aviso para projetos cujo prazo já está próximo ou atrasado.
insert into public.homologacao_notificacoes (
  user_id, projeto_id, tipo, chave, titulo, descricao
)
select
  projeto.user_id,
  projeto.id,
  'prazo_proximo',
  'prazo-proximo:' || projeto.id || ':' || projeto.prazo_em,
  'Prazo de projeto próximo',
  projeto.nome || ' vence em ' || to_char(projeto.prazo_em, 'DD/MM/YYYY') || '.'
from public.homologacao_projetos as projeto
where projeto.prazo_em <= current_date + 3
on conflict (user_id, chave) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'homologacao_notificacoes'
  ) then
    alter publication supabase_realtime add table public.homologacao_notificacoes;
  end if;
end $$;
