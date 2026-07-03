CREATE POLICY "Permitir exclusao de campos" ON config_campos_repositorio
FOR DELETE
TO authenticated -- ou 'anon' se você estiver usando acesso público
USING (true);