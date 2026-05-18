-- 1. Garante a criação física do bucket de forma privada
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasheets', 'datasheets', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Política de leitura: Garante que remove a antiga antes de recriar
DROP POLICY IF EXISTS "Apenas usuários logados podem baixar datasheets" ON storage.objects;

CREATE POLICY "Apenas usuários logados podem baixar datasheets"
ON storage.objects FOR SELECT TO authenticated 
USING (bucket_id = 'datasheets');

-- 3. Política de escrita: Garante que remove a antiga antes de recriar
DROP POLICY IF EXISTS "Apenas admins podem fazer upload de datasheets" ON storage.objects;

CREATE POLICY "Apenas admins podem fazer upload de datasheets"
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'datasheets' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);