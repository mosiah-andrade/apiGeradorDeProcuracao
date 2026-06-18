
  create table "public"."clientes" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "user_id" uuid not null,
    "nome" text not null,
    "email" text,
    "telefone" text,
    "documento" text,
    "concessionaria" text,
    "codigo_uc" text,
    "cidade" text,
    "estado" text,
    "status_id" uuid
      );


alter table "public"."clientes" enable row level security;


  create table "public"."kanban_status" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "user_id" uuid not null,
    "nome" text not null,
    "cor" text not null default '#64748b'::text,
    "ordem" integer not null default 0
      );


alter table "public"."kanban_status" enable row level security;

CREATE UNIQUE INDEX clientes_pkey ON public.clientes USING btree (id);

CREATE UNIQUE INDEX kanban_status_pkey ON public.kanban_status USING btree (id);

alter table "public"."clientes" add constraint "clientes_pkey" PRIMARY KEY using index "clientes_pkey";

alter table "public"."kanban_status" add constraint "kanban_status_pkey" PRIMARY KEY using index "kanban_status_pkey";

alter table "public"."clientes" add constraint "clientes_profile_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."clientes" validate constraint "clientes_profile_id_fkey";

alter table "public"."clientes" add constraint "clientes_status_id_fkey" FOREIGN KEY (status_id) REFERENCES public.kanban_status(id) ON DELETE SET NULL not valid;

alter table "public"."clientes" validate constraint "clientes_status_id_fkey";

alter table "public"."clientes" add constraint "clientes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."clientes" validate constraint "clientes_user_id_fkey";

alter table "public"."kanban_status" add constraint "kanban_status_profile_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."kanban_status" validate constraint "kanban_status_profile_id_fkey";

alter table "public"."kanban_status" add constraint "kanban_status_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."kanban_status" validate constraint "kanban_status_user_id_fkey";

grant delete on table "public"."clientes" to "anon";

grant insert on table "public"."clientes" to "anon";

grant references on table "public"."clientes" to "anon";

grant select on table "public"."clientes" to "anon";

grant trigger on table "public"."clientes" to "anon";

grant truncate on table "public"."clientes" to "anon";

grant update on table "public"."clientes" to "anon";

grant delete on table "public"."clientes" to "authenticated";

grant insert on table "public"."clientes" to "authenticated";

grant references on table "public"."clientes" to "authenticated";

grant select on table "public"."clientes" to "authenticated";

grant trigger on table "public"."clientes" to "authenticated";

grant truncate on table "public"."clientes" to "authenticated";

grant update on table "public"."clientes" to "authenticated";

grant delete on table "public"."clientes" to "service_role";

grant insert on table "public"."clientes" to "service_role";

grant references on table "public"."clientes" to "service_role";

grant select on table "public"."clientes" to "service_role";

grant trigger on table "public"."clientes" to "service_role";

grant truncate on table "public"."clientes" to "service_role";

grant update on table "public"."clientes" to "service_role";

grant delete on table "public"."kanban_status" to "anon";

grant insert on table "public"."kanban_status" to "anon";

grant references on table "public"."kanban_status" to "anon";

grant select on table "public"."kanban_status" to "anon";

grant trigger on table "public"."kanban_status" to "anon";

grant truncate on table "public"."kanban_status" to "anon";

grant update on table "public"."kanban_status" to "anon";

grant delete on table "public"."kanban_status" to "authenticated";

grant insert on table "public"."kanban_status" to "authenticated";

grant references on table "public"."kanban_status" to "authenticated";

grant select on table "public"."kanban_status" to "authenticated";

grant trigger on table "public"."kanban_status" to "authenticated";

grant truncate on table "public"."kanban_status" to "authenticated";

grant update on table "public"."kanban_status" to "authenticated";

grant delete on table "public"."kanban_status" to "service_role";

grant insert on table "public"."kanban_status" to "service_role";

grant references on table "public"."kanban_status" to "service_role";

grant select on table "public"."kanban_status" to "service_role";

grant trigger on table "public"."kanban_status" to "service_role";

grant truncate on table "public"."kanban_status" to "service_role";

grant update on table "public"."kanban_status" to "service_role";


  create policy "Usuários podem gerenciar seus próprios clientes"
  on "public"."clientes"
  as permissive
  for all
  to public
using ((auth.uid() = user_id));



  create policy "Usuários podem gerenciar seus próprios status"
  on "public"."kanban_status"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



