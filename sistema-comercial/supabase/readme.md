# ⚡ Guia de Desenvolvimento e Manutenção Local do Supabase

Este documento centraliza as instruções de operação, manutenção e segurança para o ecossistema Supabase deste projeto. O objetivo é garantir um ambiente de desenvolvimento robusto e evitar erros de integridade no banco de dados de produção.

## 🏗️ 1. Ambiente de Desenvolvimento (Local)

O ambiente local corre via Docker e simula todas as funcionalidades do Supabase Cloud (Postgres, Auth, Storage, Edge Functions).

### Comandos de Inicialização

*   **Iniciar ambiente:** `supabase start`
*   **Parar ambiente:** `supabase stop` (Recomendado ao encerrar o dia para poupar RAM).
*   **Verificar status e chaves:** `supabase status`

### Acessos Locais

| Serviço             | URL / Credencial         |
| :------------------ | :----------------------- |
| Studio (Painel Visual) | `http://127.0.0.1:54323` |
| API Gateway (App URL) | `http://127.0.0.1:54321` |
| Mailpit (Teste de E-mail) | `http://127.0.0.1:54324` |
| DB Host/Port        | `127.0.0.1:54322`        |
| DB User/Password    | `postgres / postgres`    |

## 🔄 2. Fluxo de Trabalho (Workflow)

Para manter a integridade, siga rigorosamente a ordem: Local ⮕ Migração ⮕ Produção.

### Passo A: Alteração Local

Realize as mudanças de estrutura (criar tabelas, colunas, RLS) através do Studio Local (porta 54323) ou via SQL Editor local.

### Passo B: Gerar Migração (Diff)

Após testar localmente, gere o arquivo SQL que descreve a mudança:

```bash
supabase db diff -f nome_da_minha_alteracao
```

Este comando criará um ficheiro em `supabase/migrations/`. Revise o código SQL gerado no seu editor antes de prosseguir.

### Passo C: Validar a Migração

Antes de enviar para a nuvem, certifique-se de que a migração está "limpa" e não quebra o banco:

```bash
supabase db reset
```

### Passo D: Deploy para Produção

Envie as alterações para o Supabase oficial (Cloud):

```bash
# 1. Defina a senha da produção na sessão do terminal
$env:SUPABASE_DB_PASSWORD = "SUA_SENHA_DA_PRODUCAO"

# 2. Envia apenas as novas migrações que ainda não estão na nuvem
supabase db push
```

## 🛡️ 3. Manutenção e Segurança

### Sincronização (Remoto -> Local)

Se o banco remoto foi alterado por outro desenvolvedor ou via Dashboard Web, sincronize a sua máquina:

```bash
supabase db pull
supabase db reset
```

### Prevenção de Erros (Backup de Segurança)

Antes de um `db push` complexo, faça um dump dos dados da produção para o seu computador:

```bash
supabase db dump --project-ref seu-project-id --data-only > backup_dados.sql
```

### Recuperação de Erros (Rollback)

Se uma migração quebrou o sistema em produção:

1.  Crie uma nova migração: `supabase migration new fix_erro`.
2.  Escreva o SQL reverso (ex: `DROP TABLE...` ou `ALTER TABLE...`).
3.  Execute `supabase db push`.

## 🛑 4. Solução de Problemas no Windows (Troubleshooting)

### Erro: `unhealthy container` (Storage/DB)

Comum quando o Docker está lento ou sem memória.

*   No ficheiro `supabase/config.toml`, desative o analytics: `[analytics] enabled = false`.
*   Execute um reset profundo:

    ```bash
    supabase stop --no-backup
    docker system prune -f
    supabase start
    ```

### Erro: `migration history mismatch`

Acontece quando o histórico local diverge da produção.

*   **Solução:** Use o comando `repair` para sincronizar o ID da migração problemática:

    ```bash
    supabase migration repair --status applied ID_DA_MIGRACAO
    ```

## ⚠️ 5. Regras de Ouro

*   **NUNCA** mude a estrutura do banco (tabelas/colunas) diretamente no Dashboard Web da produção.
*   **NUNCA** exponha a `SERVICE_ROLE_KEY` no Frontend. Ela ignora todas as regras de segurança (RLS).
*   **GIT:** Garanta que `supabase/.temp/` e ficheiros `.env` estejam no seu `.gitignore`.
*   **DOCKER:** Certifique-se de que o Docker Desktop está a correr com o motor WSL 2 ativado para melhor performance.

## 📝 6. Configuração do Projeto (.env)

Exemplo de configuração para o ambiente de desenvolvimento local:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_LOCAL
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_LOCAL
```
