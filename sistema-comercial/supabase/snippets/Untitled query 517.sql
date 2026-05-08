SELECT cron.schedule(
  'limpeza-usuarios-nao-verificados',
  '0 0 * * *',
  'SELECT delete_unverified_users();'
);