-- Documentos solicitados e anexos dos projetos de homologacao.
-- Esta migracao e incremental e idempotente para funcionar mesmo se parte
-- da estrutura ja tiver sido criada em uma migracao anterior.

create table if not exists public.homologacao_documentos_config (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo text not null default 'pdf',
  obrigatorio boolean not null default true,
  ativo boolean not null default true,
  constraint homologacao_documentos_config_pkey primary key (id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'homologacao_documentos_config_tipo_check'
      and conrelid = 'public.homologacao_documentos_config'::regclass
  ) then
    alter table public.homologacao_documentos_config
      add constraint homologacao_documentos_config_tipo_check
      check (tipo in ('pdf', 'foto'));
  end if;
end $$;

create table if not exists public.homologacao_documentos_uploads (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  user_id uuid not null references auth.users(id) on delete cascade,
  integrador_id uuid not null references public.homologacao_integradores(id) on delete cascade,
  projeto_id uuid not null references public.homologacao_projetos(id) on delete cascade,
  documento_config_id uuid references public.homologacao_documentos_config(id) on delete set null,
  nome text not null,
  tipo text not null,
  storage_path text not null,
  constraint homologacao_documentos_uploads_pkey primary key (id)
);

create index if not exists idx_homologacao_documentos_config_user_id
  on public.homologacao_documentos_config(user_id);

create index if not exists idx_homologacao_documentos_config_user_ativo
  on public.homologacao_documentos_config(user_id, ativo);

create index if not exists idx_homologacao_uploads_projeto
  on public.homologacao_documentos_uploads(projeto_id);

create index if not exists idx_homologacao_uploads_user_projeto
  on public.homologacao_documentos_uploads(user_id, projeto_id);

alter table public.homologacao_documentos_config enable row level security;
alter table public.homologacao_documentos_uploads enable row level security;

grant select, insert, update, delete on table public.homologacao_documentos_config to authenticated;
grant select on table public.homologacao_documentos_config to anon;
grant select, insert, update, delete on table public.homologacao_documentos_uploads to authenticated;
grant insert on table public.homologacao_documentos_uploads to anon;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'homologacao_documentos_config'
      and policyname = 'Usuarios gerenciam documentos do portal'
  ) then
    create policy "Usuarios gerenciam documentos do portal"
    on public.homologacao_documentos_config
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'homologacao_documentos_config'
      and policyname = 'Portal le documentos ativos do integrador'
  ) then
    create policy "Portal le documentos ativos do integrador"
    on public.homologacao_documentos_config
    for select
    to anon
    using (ativo = true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'homologacao_documentos_uploads'
      and policyname = 'Usuarios gerenciam uploads de homologacao'
  ) then
    create policy "Usuarios gerenciam uploads de homologacao"
    on public.homologacao_documentos_uploads
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'homologacao_documentos_uploads'
      and policyname = 'Portal registra uploads de homologacao'
  ) then
    create policy "Portal registra uploads de homologacao"
    on public.homologacao_documentos_uploads
    for insert
    to anon
    with check (
      exists (
        select 1
        from public.homologacao_projetos p
        where p.id = projeto_id
          and p.integrador_id = homologacao_documentos_uploads.integrador_id
          and p.user_id = homologacao_documentos_uploads.user_id
      )
      and (
        documento_config_id is null
        or exists (
          select 1
          from public.homologacao_documentos_config c
          where c.id = documento_config_id
            and c.user_id = homologacao_documentos_uploads.user_id
            and c.ativo = true
        )
      )
    );
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('homologacao-documentos', 'homologacao-documentos', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Usuarios leem documentos de homologacao'
  ) then
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
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Portal publica documentos de homologacao'
  ) then
    create policy "Portal publica documentos de homologacao"
    on storage.objects
    for insert
    to anon
    with check (
      bucket_id = 'homologacao-documentos'
      and exists (
        select 1
        from public.homologacao_projetos p
        where p.id::text = (storage.foldername(name))[2]
          and p.integrador_id::text = (storage.foldername(name))[1]
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Usuarios publicam documentos de homologacao'
  ) then
    create policy "Usuarios publicam documentos de homologacao"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'homologacao-documentos');
  end if;
end $$;
