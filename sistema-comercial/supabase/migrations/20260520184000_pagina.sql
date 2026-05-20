alter table "public"."inversores" add column "created_at" timestamp with time zone not null default timezone('utc'::text, now());


  create policy "Permitir leitura de inversores para usuários autenticados"
  on "public"."inversores"
  as permissive
  for select
  to authenticated
using (true);


drop policy "Apenas usuários logados podem baixar datasheets" on "storage"."objects";


