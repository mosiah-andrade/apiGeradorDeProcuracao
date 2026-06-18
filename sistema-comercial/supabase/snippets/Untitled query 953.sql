-- 1. Criar tabela de status customizáveis para o Kanban
CREATE TABLE IF NOT EXISTS "public"."kanban_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" NOT NULL,
    "nome" "text" NOT NULL,
    "cor" "text" DEFAULT '#64748b' NOT NULL, -- Cor em formato HEX para estilizar a coluna
    "ordem" integer DEFAULT 0 NOT NULL,     -- Posição da coluna da esquerda para a direita
    CONSTRAINT "kanban_status_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "kanban_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "kanban_status_profile_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);

-- 2. Adicionar o vínculo do status na tabela de clientes
ALTER TABLE "public"."clientes" ADD COLUMN IF NOT EXISTS "status_id" "uuid";
ALTER TABLE "public"."clientes" 
    ADD CONSTRAINT "clientes_status_id_fkey" 
    FOREIGN KEY ("status_id") REFERENCES "public"."kanban_status"("id") ON DELETE SET NULL;

-- 3. Habilitar RLS na nova tabela
ALTER TABLE "public"."kanban_status" ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios status" ON "public"."kanban_status";
CREATE POLICY "Usuários podem gerenciar seus próprios status" 
ON "public"."kanban_status" 
FOR ALL 
USING (("auth"."uid"() = "user_id"))
WITH CHECK (("auth"."uid"() = "user_id"));

-- 5. Inserir status padrão iniciais automaticamente quando o usuário interagir (opcional, pode ser feito via trigger ou seed)
GRANT ALL ON TABLE "public"."kanban_status" TO "anon";
GRANT ALL ON TABLE "public"."kanban_status" TO "authenticated";
GRANT ALL ON TABLE "public"."kanban_status" TO "service_role";