-- Preenche o sino para instalações que já tinham a tabela de notificações
-- antes da inclusão do backfill.
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
