create table if not exists "public"."homologacao_integradores" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "nome" text not null,
  "contato" text,
  constraint "homologacao_integradores_pkey" primary key ("id")
);

create table if not exists "public"."homologacao_status" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "nome" text not null,
  "cor" text not null default '#64748b'::text,
  "ordem" integer not null default 0,
  constraint "homologacao_status_pkey" primary key ("id")
);

create table if not exists "public"."homologacao_documentos_config" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "nome" text not null,
  "tipo" text not null default 'pdf' check ("tipo" in ('pdf', 'foto')),
  "obrigatorio" boolean not null default true,
  "ativo" boolean not null default true,
  constraint "homologacao_documentos_config_pkey" primary key ("id")
);

create table if not exists "public"."homologacao_projetos" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
  "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "integrador_id" uuid not null references public.homologacao_integradores(id) on delete cascade,
  "status_id" uuid references public.homologacao_status(id) on delete set null,
  "nome" text not null,
  "email" text,
  "telefone" text,
  "cidade" text,
  "estado" text,
  "cpf_cnpj" text not null default '',
  "rg" text not null default '',
  "orgao_emissor" text not null default '',
  "endereco" text not null default '',
  "bairro" text not null default '',
  "cep" text not null default '',
  "concessionaria" text not null default '',
  "cidade_concessionaria" text not null default '',
  "cnpj_concessionaria" text not null default '',
  "unidade_consumidora" text not null default '',
  "titular" text not null default '',
  "representante" text not null default '',
  "cpf_representante" text not null default '',
  "contratado_nome" text not null default 'Asaweb Energia Solar',
  "contratado_cpf" text not null default '00.000.000/0001-00',
  "contratado_rg" text not null default '',
  "contratado_orgao_emissor" text not null default '',
  "contratado_endereco" text not null default '',
  "consumo_medio_kwh" numeric not null default 0,
  "potencia_kwp" numeric not null default 0,
  "demanda_calculada_kw" numeric not null default 0,
  "tipo_ligacao" text not null default 'Bifasico' check ("tipo_ligacao" in ('Monofasico', 'Bifasico', 'Trifasico')),
  "protocolo" text,
  "prazo" text not null default 'Novo projeto',
  "responsavel" text not null default '',
  "procuracao_gerada" boolean not null default false,
  "equipamentos" jsonb not null default '[]'::jsonb,
  "datasheets" uuid[] not null default '{}'::uuid[],
  "checklist" jsonb not null default '[]'::jsonb,
  "campos_adicionais" jsonb not null default '[]'::jsonb,
  "beneficiarias" jsonb not null default '[]'::jsonb,
  "metodo_rateio" text not null default 'porcentagem' check ("metodo_rateio" in ('prioridade', 'porcentagem')),
  constraint "homologacao_projetos_pkey" primary key ("id")
);

create table if not exists "public"."homologacao_documentos_uploads" (
  "id" uuid not null default gen_random_uuid(),
  "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "integrador_id" uuid not null references public.homologacao_integradores(id) on delete cascade,
  "projeto_id" uuid not null references public.homologacao_projetos(id) on delete cascade,
  "documento_config_id" uuid references public.homologacao_documentos_config(id) on delete set null,
  "nome" text not null,
  "tipo" text not null,
  "storage_path" text not null,
  constraint "homologacao_documentos_uploads_pkey" primary key ("id")
);

create index if not exists "idx_homologacao_integradores_user_id" on public.homologacao_integradores(user_id);
create index if not exists "idx_homologacao_status_user_id_ordem" on public.homologacao_status(user_id, ordem);
create index if not exists "idx_homologacao_documentos_config_user_id" on public.homologacao_documentos_config(user_id);
create index if not exists "idx_homologacao_projetos_user_integrador" on public.homologacao_projetos(user_id, integrador_id);
create index if not exists "idx_homologacao_uploads_projeto" on public.homologacao_documentos_uploads(projeto_id);

alter table public.homologacao_integradores enable row level security;
alter table public.homologacao_status enable row level security;
alter table public.homologacao_documentos_config enable row level security;
alter table public.homologacao_projetos enable row level security;
alter table public.homologacao_documentos_uploads enable row level security;

grant select, insert, update, delete on table public.homologacao_integradores to authenticated;
grant select, insert, update, delete on table public.homologacao_status to authenticated;
grant select, insert, update, delete on table public.homologacao_documentos_config to authenticated;
grant select, insert, update, delete on table public.homologacao_projetos to authenticated;
grant select, insert, update, delete on table public.homologacao_documentos_uploads to authenticated;

create policy "Usuarios gerenciam seus integradores de homologacao"
on public.homologacao_integradores
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios gerenciam status de homologacao"
on public.homologacao_status
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios gerenciam documentos do portal"
on public.homologacao_documentos_config
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios gerenciam projetos de homologacao"
on public.homologacao_projetos
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Usuarios gerenciam uploads de homologacao"
on public.homologacao_documentos_uploads
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('homologacao-documentos', 'homologacao-documentos', false)
on conflict (id) do nothing;

create policy "Usuarios leem documentos de homologacao"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'homologacao-documentos'
  and exists (
    select 1
    from public.homologacao_documentos_uploads u
    where u.storage_path = name
      and u.user_id = auth.uid()
  )
);

create policy "Portal publica documentos de homologacao"
on storage.objects
for insert
to anon
with check (bucket_id = 'homologacao-documentos');

create policy "Usuarios publicam documentos de homologacao"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'homologacao-documentos');
