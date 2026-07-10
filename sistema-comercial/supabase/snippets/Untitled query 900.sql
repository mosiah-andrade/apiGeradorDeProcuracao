-- Tabela de configuração: define quais documentos podem/devem ser pedidos
CREATE TABLE document_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- Ex: 'Fatura de Energia', 'RG/CNH', 'Procuração'
  description TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabela que liga o documento enviado ao projeto
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Ajuste para sua tabela de projetos
  requirement_id UUID REFERENCES document_requirements(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL, -- Caminho do arquivo no Supabase Storage
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);