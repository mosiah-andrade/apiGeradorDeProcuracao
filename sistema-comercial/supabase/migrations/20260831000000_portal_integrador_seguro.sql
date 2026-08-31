-- Link público não enumerável. O token é validado exclusivamente pela rota de servidor.
alter table public.homologacao_integradores
  add column if not exists portal_token uuid not null default gen_random_uuid();

create unique index if not exists idx_homologacao_integradores_portal_token
  on public.homologacao_integradores (portal_token);

-- O portal deixa de consultar/inserir dados diretamente com a chave anônima.
drop policy if exists "Portal le documentos ativos do integrador" on public.homologacao_documentos_config;
drop policy if exists "Portal registra uploads de homologacao" on public.homologacao_documentos_uploads;
drop policy if exists "Portal publica documentos de homologacao" on storage.objects;

revoke select on public.homologacao_documentos_config from anon;
revoke insert on public.homologacao_documentos_uploads from anon;
