
-- Criar bucket para armazenar arquivos PDF
INSERT INTO storage.buckets (id, name, public) 
VALUES ('contract-pdfs', 'contract-pdfs', true);

-- Criar política para permitir inserção de arquivos
CREATE POLICY "Users can upload contract PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'contract-pdfs');

-- Criar política para permitir leitura de arquivos
CREATE POLICY "Users can view contract PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'contract-pdfs');

-- Criar política para permitir atualização de arquivos
CREATE POLICY "Users can update contract PDFs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'contract-pdfs');

-- Criar política para permitir exclusão de arquivos
CREATE POLICY "Users can delete contract PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'contract-pdfs');
