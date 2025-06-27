
-- Criar tabela para armazenar erros detectados durante a validação
CREATE TABLE public.erros_detectados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analise_id UUID REFERENCES public.analises(id) ON DELETE CASCADE NOT NULL,
  tipo_erro TEXT NOT NULL CHECK (tipo_erro IN ('campo_obrigatorio', 'formato_invalido', 'inconsistencia', 'valor_incorreto')),
  campo_afetado TEXT NOT NULL,
  valor_encontrado TEXT,
  valor_esperado TEXT,
  sugestao_correcao TEXT,
  severidade TEXT NOT NULL CHECK (severidade IN ('critica', 'alta', 'media', 'baixa')),
  confianca INTEGER NOT NULL CHECK (confianca >= 0 AND confianca <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_erros_detectados_analise_id ON public.erros_detectados(analise_id);
CREATE INDEX idx_erros_detectados_severidade ON public.erros_detectados(severidade);
CREATE INDEX idx_erros_detectados_tipo_erro ON public.erros_detectados(tipo_erro);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.erros_detectados ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso total (pode ser refinada posteriormente)
CREATE POLICY "Allow all operations on erros_detectados" 
  ON public.erros_detectados 
  FOR ALL 
  USING (true);
