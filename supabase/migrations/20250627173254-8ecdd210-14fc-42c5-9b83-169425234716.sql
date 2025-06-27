
-- Criar tabela para armazenar campos extraídos dos PDFs
CREATE TABLE public.campos_extraidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analise_id UUID REFERENCES public.analises(id) ON DELETE CASCADE NOT NULL,
  pagina_numero INTEGER NOT NULL,
  texto_bruto TEXT,
  campos_identificados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_campos_extraidos_analise_id ON public.campos_extraidos(analise_id);
CREATE INDEX idx_campos_extraidos_pagina ON public.campos_extraidos(pagina_numero);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.campos_extraidos ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total (pode ser refinada posteriormente)
CREATE POLICY "Allow all operations on campos_extraidos" 
  ON public.campos_extraidos 
  FOR ALL 
  USING (true);
