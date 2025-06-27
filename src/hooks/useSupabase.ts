import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Analysis = Database['public']['Tables']['analises']['Row'];
type ContractModel = Database['public']['Tables']['contratos_modelo']['Row'];
type ExtractedField = Database['public']['Tables']['campos_extraidos']['Row'];

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const fileName = `${Date.now()}-${file.name}`;
      
      // Upload arquivo para o storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contract-pdfs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Criar registro na tabela de análises
      const { data: analysisData, error: analysisError } = await supabase
        .from('analises')
        .insert({
          arquivo_nome: file.name,
          status: 'processando'
        })
        .select()
        .single();

      if (analysisError) throw analysisError;

      return { 
        analysis: analysisData, 
        filePath: uploadData.path 
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAnalysis = async (id: string, updates: Partial<Analysis>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('analises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAnalyses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('analises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveExtractedFields = async (analysisId: string, pageData: {
    pageNumber: number;
    rawText: string;
    extractedFields: any[];
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('campos_extraidos')
        .insert({
          analise_id: analysisId,
          pagina_numero: pageData.pageNumber,
          texto_bruto: pageData.rawText,
          campos_identificados: pageData.extractedFields
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getExtractedFields = async (analysisId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('campos_extraidos')
        .select('*')
        .eq('analise_id', analysisId)
        .order('pagina_numero', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getContractModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contratos_modelo')
        .select('*')
        .eq('template_ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createContractModel = async (modelData: {
    name: string;
    file: File;
    requiredFields: string[];
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Upload do arquivo PDF modelo
      const fileName = `modelo-${Date.now()}-${modelData.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('contract-pdfs')
        .upload(fileName, modelData.file);

      if (uploadError) throw uploadError;

      // Criar registro na tabela contratos_modelo
      const { data: modelRecord, error: modelError } = await supabase
        .from('contratos_modelo')
        .insert({
          nome: modelData.name,
          template_ativo: true,
          campos_obrigatorios: modelData.requiredFields,
          regras_validacao: {}
        })
        .select()
        .single();

      if (modelError) throw modelError;

      return { 
        model: modelRecord, 
        filePath: uploadData.path 
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllContractModels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('contratos_modelo')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadFile,
    updateAnalysis,
    getAnalyses,
    getContractModels,
    createContractModel,
    getAllContractModels,
    saveExtractedFields,
    getExtractedFields
  };
};
