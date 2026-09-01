alter table public.homologacao_projetos
  add column if not exists prazo_em date;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'homologacao_projetos'
  ) then
    alter publication supabase_realtime add table public.homologacao_projetos;
  end if;
end $$;
