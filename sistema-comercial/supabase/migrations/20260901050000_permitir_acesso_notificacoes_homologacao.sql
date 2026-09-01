-- Permissões explícitas para o painel do sino, acessado pelo usuário autenticado.
grant select, insert, update, delete on table public.homologacao_notificacoes to authenticated;
grant select, insert, update, delete on table public.homologacao_notificacoes to service_role;

-- Força o PostgREST a recarregar o schema e disponibilizar a tabela imediatamente na API.
notify pgrst, 'reload schema';
