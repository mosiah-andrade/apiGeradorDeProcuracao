# Asaweb.tech - Sistema Comercial Solar ☀️

Plataforma B2B em formato SaaS desenvolvida para integradores de energia solar. O sistema permite a realização de análises técnicas de viabilidade, dimensionamento fotovoltaico e geração automatizada de propostas comerciais em PDF com cálculos de ROI e Payback.

## 🛠 Stack Tecnológica
* **Frontend/Backend:** Next.js (App Router)
* **Estilização:** Tailwind CSS
* **Autenticação e Banco de Dados:** Supabase
* **Pagamentos e Assinaturas:** Stripe
* **E-mails Transacionais:** Resend
* **Geração de PDF:** jsPDF

---

## 🌍 Arquitetura de Ambientes (DEV vs PROD)

Para garantir que testes não afetem dados reais de clientes, trabalhamos com **dois ambientes isolados**:

1. **Desenvolvimento (Local/Dev):** 
   * Usa o "Test Mode" do Stripe.
   * Usa um projeto Supabase exclusivo para testes (ou banco local via Supabase CLI)[cite: 1].
   * URLs apontam para `http://localhost:3000`[cite: 1].

2. **Produção (Live):** 
   * Usa chaves de produção do Stripe (onde o dinheiro real entra)[cite: 1].
   * Usa o projeto Supabase oficial[cite: 1].
   * URLs apontam para `https://app.asaweb.tech`[cite: 1].

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto (este arquivo é ignorado pelo Git para sua segurança)[cite: 1]. Preencha com as chaves correspondentes ao ambiente que você está rodando:
```env
# ==========================================
# 1. GERAL
# ==========================================
# No ambiente local: http://localhost:3000
# Em produção: [https://app.asaweb.tech](https://app.asaweb.tech)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ==========================================
# 2. SUPABASE (Banco, Auth e Storage)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_publica
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_secreta

# ==========================================
# 3. STRIPE (Pagamentos)
# ==========================================
# No ambiente local, use as chaves que começam com "sk_test_"
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
# O Webhook secret local é gerado pelo Stripe CLI ao rodar "stripe listen" (começa com whsec_)
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_de_webhook_aqui

# ==========================================
# 4. RESEND (E-mails)
# ==========================================
RESEND_API_KEY=re_sua_chave_aqui
```
## 🚀 Como Clonar e Rodar Localmente (Desenvolvimento)
### 1. Instalação e Preparação
```
# Clone o repositório
git clone [https://github.com/seu-usuario/sistema-comercial.git](https://github.com/seu-usuario/sistema-comercial.git)

# Entre na pasta
cd sistema-comercial

# Instale as dependências
npm install
```

### 2. Configurando o Banco de Dados de Teste
A forma mais profissional de manter o banco de dados é criar um projeto no Supabase chamado Asaweb - DEV.

- 1- Vá no painel do Supabase, crie as tabelas necessárias (```profiles```, ```propostas```, ```subscriptions```, ```products```, ```prices```) e configure o RLS (Row Level Security).

- 2- Pegue as chaves deste projeto DEV e coloque no seu ```.env.local```.

### 3. Simulando Webhooks do Stripe Localmente
Como os pagamentos avisam a aplicação que deram certo? Através de Webhooks. Para testar isso no ```localhost```, você precisa do Stripe CLI:

- Baixe e instale o Stripe CLI.

- Faça login no terminal:

```bash
stripe login
```
- Encaminhe os eventos do Stripe de teste para o seu código rodando localmente

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

- O terminal retornará um segredo de webhook (```whsec_...```). Copie e cole esse valor no seu ```.env.local``` na variável ```STRIPE_WEBHOOK_SECRET```

### 4. Iniciando o Servidor
Com o banco e o Stripe conectados, inicie o servidor:

```bash
npm run dev
```

Acesse ```http://localhost:3000``` Crie contas falsas, gere propostas infinitas e simule pagamentos com os cartões de teste do Stripe.

## 🚢 Deploy para Produção (Vercel)
Quando a sua branch principal (```main``` ou ```master```) estiver pronta para o lançamento oficial, siga o fluxo de deploy na Vercel:

- Suba seu código atualizado para o GitHub.

- No painel da Vercel, clique em "Add New Project" e importe o repositório.

- Na etapa de configuração de Environment Variables na Vercel, adicione todas as chaves, mas atenção: Desta vez use as chaves LIVE/Produção:

- > ```NEXT_PUBLIC_SITE_URL```: Seu domínio final (ex: ```https://app.asaweb.tech```).

- > Supabase: As chaves do projeto Asaweb - PROD.

- > Stripe: As chaves que começam com ```sk_live_...```

- > Stripe Webhook: No painel do Stripe de produção, vá em "Developers > Webhooks", adicione um endpoint apontando para ```https://app.asaweb.tech/api/webhooks/stripe``` e pegue o ```whsec_...``` oficial gerado.

- Clique em Deploy.

## 🔄 Manutenção Contínua
Sempre que precisar criar uma nova funcionalidade (ex: nova calculadora, layout novo):

- Crie uma nova branch local: ```git checkout -b feature/nova-calc```.

- Teste tudo usando o ```localhost```, o Supabase DEV e o Stripe Test Mode. A produção não sentirá absolutamente nada.

- Quando estiver perfeito, faça o ```merge``` para a ```main``` e suba para o GitHub. A Vercel fará o deploy automático para a produção