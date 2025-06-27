
-- Criar a tabela contratos_modelo
CREATE TABLE public.contratos_modelo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  campos_obrigatorios JSONB DEFAULT '[]'::jsonb,
  regras_validacao JSONB DEFAULT '{}'::jsonb,
  template_ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar a tabela analises
CREATE TABLE public.analises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arquivo_nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro')),
  total_erros INTEGER DEFAULT 0,
  tempo_processamento INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS) nas tabelas
ALTER TABLE public.contratos_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para contratos_modelo
-- Permitir que usuários autenticados vejam todos os contratos modelo
CREATE POLICY "Usuários autenticados podem ver contratos modelo" 
  ON public.contratos_modelo 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Permitir que usuários autenticados criem contratos modelo
CREATE POLICY "Usuários autenticados podem criar contratos modelo" 
  ON public.contratos_modelo 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Permitir que usuários autenticados atualizem contratos modelo
CREATE POLICY "Usuários autenticados podem atualizar contratos modelo" 
  ON public.contratos_modelo 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Criar políticas RLS para analises
-- Permitir que usuários autenticados vejam todas as análises
CREATE POLICY "Usuários autenticados podem ver análises" 
  ON public.analises 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Permitir que usuários autenticados criem análises
CREATE POLICY "Usuários autenticados podem criar análises" 
  ON public.analises 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Permitir que usuários autenticados atualizem análises
CREATE POLICY "Usuários autenticados podem atualizar análises" 
  ON public.analises 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Inserir alguns contratos modelo de exemplo
INSERT INTO public.contratos_modelo (nome, campos_obrigatorios, regras_validacao) VALUES 
(
  'Contrato Pessoa Física',
  '["nome_completo", "cpf", "endereco", "telefone", "email"]'::jsonb,
  '{"cpf": {"pattern": "^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$", "required": true}, "email": {"pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", "required": true}}'::jsonb
),
(
  'Contrato Empresarial',
  '["razao_social", "cnpj", "endereco_comercial", "telefone_comercial", "email_comercial", "representante_legal"]'::jsonb,
  '{"cnpj": {"pattern": "^[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}/[0-9]{4}-[0-9]{2}$", "required": true}, "email_comercial": {"pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", "required": true}}'::jsonb
);
