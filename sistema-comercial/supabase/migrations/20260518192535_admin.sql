
  create table "public"."inversores" (
    "id" uuid not null default gen_random_uuid(),
    "modelo" character varying(255) not null,
    "fabricante" character varying(255) not null,
    "potencia_kw" numeric not null,
    "tags" text[],
    "datasheet_path" text not null,
    "criado_em" timestamp with time zone default CURRENT_TIMESTAMP
      );


alter table "public"."inversores" enable row level security;

alter table "public"."profiles" add column "role" character varying(50) default 'user'::character varying;

CREATE UNIQUE INDEX inversores_pkey ON public.inversores USING btree (id);

alter table "public"."inversores" add constraint "inversores_pkey" PRIMARY KEY using index "inversores_pkey";

grant delete on table "public"."inversores" to "anon";

grant insert on table "public"."inversores" to "anon";

grant references on table "public"."inversores" to "anon";

grant select on table "public"."inversores" to "anon";

grant trigger on table "public"."inversores" to "anon";

grant truncate on table "public"."inversores" to "anon";

grant update on table "public"."inversores" to "anon";

grant delete on table "public"."inversores" to "authenticated";

grant insert on table "public"."inversores" to "authenticated";

grant references on table "public"."inversores" to "authenticated";

grant select on table "public"."inversores" to "authenticated";

grant trigger on table "public"."inversores" to "authenticated";

grant truncate on table "public"."inversores" to "authenticated";

grant update on table "public"."inversores" to "authenticated";

grant delete on table "public"."inversores" to "service_role";

grant insert on table "public"."inversores" to "service_role";

grant references on table "public"."inversores" to "service_role";

grant select on table "public"."inversores" to "service_role";

grant trigger on table "public"."inversores" to "service_role";

grant truncate on table "public"."inversores" to "service_role";

grant update on table "public"."inversores" to "service_role";


  create policy "Apenas admins podem inserir inversores"
  on "public"."inversores"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role)::text = 'admin'::text)))));



  create policy "Apenas usuarios logados podem buscar inversores"
  on "public"."inversores"
  as permissive
  for select
  to authenticated
using (true);


drop policy "Permitir upload de avatars 1oj01fe_0" on "storage"."objects";

drop policy "Permitir upload de avatars 1oj01fe_1" on "storage"."objects";

drop policy "Permitir upload de avatars 1oj01fe_2" on "storage"."objects";


  create policy "Apenas admins podem fazer upload de datasheets"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'datasheets'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND ((profiles.role)::text = 'admin'::text))))));



  create policy "Apenas usuarios logados podem baixar datasheets"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'datasheets'::text));



