# Asaweb - Gerador de Procurações & Blog Solar

Este repositório contém o ecossistema completo do **Asaweb**, uma plataforma SaaS que integra geração automática de documentos jurídicos (Procurações) e um portal de conteúdo sobre energia solar.

O projeto utiliza uma arquitetura de microsserviços, separando a interface do usuário (Next.js) das lógicas de processamento de documentos (PHP) e inteligência artificial (Python).

---

## 🏗 Arquitetura do Projeto

O sistema é composto pelos seguintes módulos:

1.  **Frontend Principal (`front-contratos-next`)**:
    * Aplicação em **Next.js 15** (App Router).
    * Responsável pela interface do usuário, formulários e renderização do Blog.
    * Integração com Sanity CMS e APIs de backend.
2.  **API de Documentos (`API-PHP`)**:
    * Backend leve em **PHP**.
    * Processa templates `.docx`, substitui variáveis (placeholders) e gera o arquivo final para download.
3.  **API de IA/OCR (`API`)**:
    * Backend em **Python (FastAPI)**.
    * Utiliza bibliotecas como PyTorch e OpenCV para leitura de documentos e automação inteligente.
4.  **CMS (`blog-solar`)**:
    * **Sanity Studio**.
    * Painel administrativo "Headless" para gestão de conteúdo do blog.

---

## 🚀 Guia de Execução Local

Para rodar o ambiente completo, você precisará de **4 terminais** abertos simultaneamente (um para cada serviço).

### Pré-requisitos
* **Node.js** (v18 ou superior)
* **PHP** (v7.4 ou v8.x) - *Se tiver XAMPP instalado, já serve!*
* **Python** (v3.10 ou superior)
* **Git**

---

### Terminal 1: API de Documentos (PHP) 🐘

Esta API deve rodar na porta **8000**.

1.  Acesse a pasta:
    ```bash
    cd API-PHP
    ```

2.  **Escolha o comando correto para o seu terminal:**

    * **Opção A (Se você instalou o PHP no Windows ou configurou o PATH):**
        ```bash
        php -S localhost:8000
        ```

    * **Opção B (Se você usa PowerShell e tem XAMPP):**
        ```powershell
        C:\xampp\php\php.exe -S localhost:8000
        ```

    * **Opção C (Se você usa Git Bash e tem XAMPP):**
        ```bash
        /c/xampp/php/php -S localhost:8000
        ```

    ✅ *Sucesso: A API estará disponível em `http://localhost:8000`*

---

### Terminal 2: API de IA (Python) 🐍

Esta API deve rodar na porta **8001** (para não conflitar com o PHP).

1.  Acesse a pasta:
    ```bash
    cd API
    ```

2.  Crie e ative o ambiente virtual (Recomendado):
    * **Windows (PowerShell):**
        ```powershell
        python -m venv venv
        .\venv\Scripts\activate
        ```
    * **Git Bash / Linux / Mac:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```

4.  Inicie o servidor Uvicorn:
    ```bash
    uvicorn gerar_contrato:app --reload --port 8001
    ```
    ✅ *Sucesso: A API estará disponível em `http://localhost:8001`*

---

### Terminal 3: CMS (Sanity Studio) 📝

1.  Acesse a pasta:
    ```bash
    cd blog-solar
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Inicie o estúdio localmente:
    ```bash
    npm run dev
    ```
    ✅ *Sucesso: O painel administrativo estará em `http://localhost:3333`*

---

### Terminal 4: Frontend (Next.js) ⚛️

1.  Acesse a pasta:
    ```bash
    cd front-contratos-next
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  **Configuração de Ambiente (.env.local):**
    Crie um arquivo chamado `.env.local` na raiz da pasta `front-contratos-next` e adicione as seguintes chaves (ajuste conforme suas credenciais do Sanity):

    ```env
    # Sanity CMS (Pegue no painel do Sanity: manage.sanity.io)
    NEXT_PUBLIC_SANITY_PROJECT_ID="seu_project_id"
    NEXT_PUBLIC_SANITY_DATASET="production"

    # URLs das APIs Locais
    NEXT_PUBLIC_API_PHP_URL="http://localhost:8000"
    NEXT_PUBLIC_API_PYTHON_URL="http://localhost:8001"

    # URL Base da Aplicação
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"
    ```

4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    ✅ *Sucesso: Acesse o site completo em `http://localhost:3000`*

---

## ☁️ Como Fazer o Deploy (Produção)

Como o sistema é desacoplado, cada parte deve ser hospedada no serviço mais adequado para sua tecnologia.

### 1. Frontend (Next.js) -> Vercel
A Vercel é a plataforma nativa do Next.js.
1.  Crie um projeto na Vercel importando este repositório.
2.  Nas configurações ("Build & Development Settings"), defina o **Root Directory** como `front-contratos-next`.
3.  Adicione as Variáveis de Ambiente (Environment Variables) apontando para as URLs de produção das suas APIs.

### 2. API PHP -> Hostinger / Hospedagem Compartilhada
O projeto já possui um workflow do GitHub Actions configurado (`.github/workflows/deploy.yml`) para deploy via FTP.
1.  No GitHub, vá em **Settings > Secrets and variables > Actions**.
2.  Adicione os secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
3.  Ao fazer push na branch `main`, o conteúdo da pasta `API-PHP` será enviado para o servidor.

### 3. API Python -> Render / Railway
Servidores comuns (cPanel) geralmente não suportam bibliotecas pesadas de Python (Torch/OpenCV).
1.  Use um serviço como **Render.com** (tem plano gratuito).
2.  Crie um "Web Service" conectado ao repo.
3.  **Root Directory:** `API`.
4.  **Build Command:** `pip install -r requirements.txt`.
5.  **Start Command:** `uvicorn gerar_contrato:app --host 0.0.0.0 --port $PORT`.

### 4. CMS (Sanity) -> Sanity Cloud
1.  Dentro da pasta `blog-solar`, execute:
    ```bash
    npm run deploy
    ```
2.  Escolha o subdomínio do seu estúdio (ex: `asaweb.sanity.studio`).
3.  Adicione a URL do seu frontend (Vercel) nas configurações de **CORS** do Sanity (`manage.sanity.io`) para permitir que o site busque os posts.

---

## 📂 Estrutura de Pastas
├── API-PHP/ # Backend PHP (Processamento de Word) 
├── API/ # Backend Python (IA e OCR) 
├── blog-solar/ # CMS Sanity (Gestão de Conteúdo) 
├── front-contratos-next/ # Aplicação Principal (Next.js) 
└── .github/workflows/ # Scripts de Deploy Automático

---

*Desenvolvido por Mosiah Andrade*