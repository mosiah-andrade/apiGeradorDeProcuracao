
  create table "public"."arquivos_clientes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "cliente_id" uuid,
    "campo_id" uuid,
    "caminho_storage" text not null,
    "nome_arquivo" text not null,
    "enviado_em" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."arquivos_clientes" enable row level security;


  create table "public"."config_campos_repositorio" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "nome" text not null,
    "tipo" text not null,
    "obrigatorio" boolean default false,
    "ordem" integer default 0,
    "ativo" boolean default true
      );


alter table "public"."config_campos_repositorio" enable row level security;

CREATE UNIQUE INDEX arquivos_clientes_cliente_id_campo_id_key ON public.arquivos_clientes USING btree (cliente_id, campo_id);

CREATE UNIQUE INDEX arquivos_clientes_pkey ON public.arquivos_clientes USING btree (id);

CREATE UNIQUE INDEX config_campos_repositorio_pkey ON public.config_campos_repositorio USING btree (id);

alter table "public"."arquivos_clientes" add constraint "arquivos_clientes_pkey" PRIMARY KEY using index "arquivos_clientes_pkey";

alter table "public"."config_campos_repositorio" add constraint "config_campos_repositorio_pkey" PRIMARY KEY using index "config_campos_repositorio_pkey";

alter table "public"."arquivos_clientes" add constraint "arquivos_clientes_campo_id_fkey" FOREIGN KEY (campo_id) REFERENCES public.config_campos_repositorio(id) ON DELETE RESTRICT not valid;

alter table "public"."arquivos_clientes" validate constraint "arquivos_clientes_campo_id_fkey";

alter table "public"."arquivos_clientes" add constraint "arquivos_clientes_cliente_id_campo_id_key" UNIQUE using index "arquivos_clientes_cliente_id_campo_id_key";

alter table "public"."arquivos_clientes" add constraint "arquivos_clientes_cliente_id_fkey" FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE not valid;

alter table "public"."arquivos_clientes" validate constraint "arquivos_clientes_cliente_id_fkey";

grant delete on table "public"."arquivos_clientes" to "anon";

grant insert on table "public"."arquivos_clientes" to "anon";

grant references on table "public"."arquivos_clientes" to "anon";

grant select on table "public"."arquivos_clientes" to "anon";

grant trigger on table "public"."arquivos_clientes" to "anon";

grant truncate on table "public"."arquivos_clientes" to "anon";

grant update on table "public"."arquivos_clientes" to "anon";

grant delete on table "public"."arquivos_clientes" to "authenticated";

grant insert on table "public"."arquivos_clientes" to "authenticated";

grant references on table "public"."arquivos_clientes" to "authenticated";

grant select on table "public"."arquivos_clientes" to "authenticated";

grant trigger on table "public"."arquivos_clientes" to "authenticated";

grant truncate on table "public"."arquivos_clientes" to "authenticated";

grant update on table "public"."arquivos_clientes" to "authenticated";

grant delete on table "public"."arquivos_clientes" to "service_role";

grant insert on table "public"."arquivos_clientes" to "service_role";

grant references on table "public"."arquivos_clientes" to "service_role";

grant select on table "public"."arquivos_clientes" to "service_role";

grant trigger on table "public"."arquivos_clientes" to "service_role";

grant truncate on table "public"."arquivos_clientes" to "service_role";

grant update on table "public"."arquivos_clientes" to "service_role";

grant delete on table "public"."config_campos_repositorio" to "anon";

grant insert on table "public"."config_campos_repositorio" to "anon";

grant references on table "public"."config_campos_repositorio" to "anon";

grant select on table "public"."config_campos_repositorio" to "anon";

grant trigger on table "public"."config_campos_repositorio" to "anon";

grant truncate on table "public"."config_campos_repositorio" to "anon";

grant update on table "public"."config_campos_repositorio" to "anon";

grant delete on table "public"."config_campos_repositorio" to "authenticated";

grant insert on table "public"."config_campos_repositorio" to "authenticated";

grant references on table "public"."config_campos_repositorio" to "authenticated";

grant select on table "public"."config_campos_repositorio" to "authenticated";

grant trigger on table "public"."config_campos_repositorio" to "authenticated";

grant truncate on table "public"."config_campos_repositorio" to "authenticated";

grant update on table "public"."config_campos_repositorio" to "authenticated";

grant delete on table "public"."config_campos_repositorio" to "service_role";

grant insert on table "public"."config_campos_repositorio" to "service_role";

grant references on table "public"."config_campos_repositorio" to "service_role";

grant select on table "public"."config_campos_repositorio" to "service_role";

grant trigger on table "public"."config_campos_repositorio" to "service_role";

grant truncate on table "public"."config_campos_repositorio" to "service_role";

grant update on table "public"."config_campos_repositorio" to "service_role";


  create policy "Permitir exclusao de campos"
  on "public"."config_campos_repositorio"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Permitir inserção de campos"
  on "public"."config_campos_repositorio"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Permitir leitura de campos"
  on "public"."config_campos_repositorio"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Portal publico pode ler documentos ativos"
  on "public"."homologacao_documentos_config"
  as permissive
  for select
  to anon
using ((ativo = true));



  create policy "Portal publico pode ler uploads do proprio projeto"
  on "public"."homologacao_documentos_uploads"
  as permissive
  for select
  to anon
using (true);



  create policy "Portal publico pode registrar uploads do projeto"
  on "public"."homologacao_documentos_uploads"
  as permissive
  for insert
  to anon
with check ((EXISTS ( SELECT 1
   FROM public.homologacao_projetos p
  WHERE ((p.id = homologacao_documentos_uploads.projeto_id) AND (p.integrador_id = homologacao_documentos_uploads.integrador_id) AND (p.user_id = homologacao_documentos_uploads.user_id)))));



  create policy "Portal publico pode ler integrador pelo link"
  on "public"."homologacao_integradores"
  as permissive
  for select
  to anon
using (true);



  create policy "Portal publico pode acompanhar projetos do integrador"
  on "public"."homologacao_projetos"
  as permissive
  for select
  to anon
using (true);



  create policy "Portal publico pode criar projeto para integrador valido"
  on "public"."homologacao_projetos"
  as permissive
  for insert
  to anon
with check ((EXISTS ( SELECT 1
   FROM public.homologacao_integradores i
  WHERE ((i.id = homologacao_projetos.integrador_id) AND (i.user_id = homologacao_projetos.user_id)))));



  create policy "Portal publico pode ler status do integrador"
  on "public"."homologacao_status"
  as permissive
  for select
  to anon
using (true);



