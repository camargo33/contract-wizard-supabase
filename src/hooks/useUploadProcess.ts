import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { ocrService } from '@/services/ocrService';
import { ValidationEngine } from '@/services/validationEngine';

type AnalysisStatus = 'waiting' | 'processing' | 'extracted' | 'completed' | 'error';

interface AnalysisResult {
  totalErrors: number;
  missingFields: string[];
  validationErrors: string[];
  processingTime: number;
}

interface PageData {
  pageNumber: number;
  rawText: string;
  extractedFields: any[];
}

interface DetectedError {
  id: string;
  tipo_erro: string;
  campo_afetado: string;
  valor_encontrado?: string;
  valor_esperado?: string;
  sugestao_correcao?: string;
  severidade: string;
  confianca: number;
}

export const useUploadProcess = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<AnalysisStatus>('waiting');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<PageData[]>([]);
  const [detectedErrors, setDetectedErrors] = useState<DetectedError[]>([]);
  
  const { uploadFile, updateAnalysis, saveExtractedFields, saveDetectedErrors, getContractModels } = useSupabase();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('waiting');
    setAnalysisResult(null);
    setExtractedPages([]);
    setProgress(0);
    setCurrentAnalysisId(null);
  };

  const performOCRExtraction = async (file: File, analysisId: string) => {
    try {
      console.log('Iniciando extração OCR...');
      setStatus('processing');
      
      const pages = await ocrService.processDocument(file, (progress) => {
        setProgress(progress);
      });

      console.log('OCR concluído, salvando campos extraídos...');

      for (const page of pages) {
        await saveExtractedFields(analysisId, {
          pageNumber: page.pageNumber,
          rawText: page.rawText,
          extractedFields: page.extractedFields
        });
      }

      setExtractedPages(pages);
      setStatus('extracted');
      
      await updateAnalysis(analysisId, {
        status: 'processando'
      });

      toast({
        title: "Extração concluída",
        description: `${pages.reduce((acc, p) => acc + p.extractedFields.length, 0)} campos identificados`,
      });

    } catch (error: any) {
      console.error('Erro na extração OCR:', error);
      setStatus('error');
      await updateAnalysis(analysisId, {
        status: 'erro'
      });
      toast({
        title: "Erro na extração",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const performValidation = async (analysisId: string, extractedPages: PageData[]) => {
    try {
      console.log('Iniciando validação...');
      setStatus('processing');
      setProgress(0);

      // Obter modelo de contrato selecionado
      const models = await getContractModels();
      const selectedModelData = models?.find(m => m.id === selectedModel);
      
      if (!selectedModelData) {
        throw new Error('Modelo de contrato não encontrado');
      }

      // Combinar todos os campos extraídos
      const allFields = extractedPages.flatMap(page => page.extractedFields);
      
      // Executar validação
      const validationEngine = new ValidationEngine();
      const errors = validationEngine.validateExtractedData(allFields, selectedModelData);

      setProgress(50);

      // Salvar erros detectados
      if (errors.length > 0) {
        await saveDetectedErrors(analysisId, errors);
      }

      setProgress(80);

      // Atualizar análise
      await updateAnalysis(analysisId, {
        status: errors.length > 0 ? 'erro' : 'concluido',
        total_erros: errors.length,
        tempo_processamento: 3
      });

      setProgress(100);

      // Preparar resultado da análise
      const result: AnalysisResult = {
        totalErrors: errors.length,
        missingFields: errors
          .filter(e => e.tipo_erro === 'campo_obrigatorio')
          .map(e => e.campo_afetado),
        validationErrors: errors
          .filter(e => e.tipo_erro !== 'campo_obrigatorio')
          .map(e => `${e.campo_afetado}: ${e.sugestao_correcao}`),
        processingTime: 3,
      };

      setAnalysisResult(result);
      setDetectedErrors(errors);
      setStatus(errors.length > 0 ? 'error' : 'completed');
      
      toast({
        title: "Validação concluída",
        description: `${errors.length} erros encontrados`,
        variant: errors.length > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      console.error('Erro na validação:', error);
      setStatus('error');
      await updateAnalysis(analysisId, {
        status: 'erro'
      });
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const simulateValidation = async (analysisId: string) => {
    setIsAnalyzing(true);
    setStatus('processing');
    setProgress(0);

    const intervals = [10, 25, 45, 65, 80, 95, 100];
    
    for (const targetProgress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(targetProgress);
    }

    const mockResult: AnalysisResult = {
      totalErrors: Math.floor(Math.random() * 5),
      missingFields: ['endereco', 'telefone'],
      validationErrors: ['CPF inválido', 'Email mal formatado'],
      processingTime: 3,
    };

    try {
      await updateAnalysis(analysisId, {
        status: mockResult.totalErrors > 0 ? 'erro' : 'concluido',
        total_erros: mockResult.totalErrors,
        tempo_processamento: mockResult.processingTime
      });

      setAnalysisResult(mockResult);
      setStatus(mockResult.totalErrors > 0 ? 'error' : 'completed');
      
      toast({
        title: "Validação concluída",
        description: `${mockResult.totalErrors} erros encontrados`,
        variant: mockResult.totalErrors > 0 ? "destructive" : "default",
      });
    } catch (error: any) {
      setStatus('error');
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione um arquivo para análise.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedModel) {
      toast({
        title: "Modelo obrigatório",
        description: "Selecione um modelo de contrato para comparação.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const { analysis } = await uploadFile(selectedFile);
      setCurrentAnalysisId(analysis.id);
      
      toast({
        title: "Upload realizado",
        description: "Arquivo enviado com sucesso. Iniciando extração OCR...",
      });

      await performOCRExtraction(selectedFile, analysis.id);
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      setStatus('error');
      setIsAnalyzing(false);
    }
  };

  const handleProceedToValidation = async () => {
    if (!currentAnalysisId) return;
    
    try {
      setIsAnalyzing(true);
      
      toast({
        title: "Iniciando validação",
        description: "Comparando com o modelo selecionado...",
      });

      await performValidation(currentAnalysisId, extractedPages);
    } catch (error: any) {
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    selectedFile,
    selectedModel,
    setSelectedModel,
    isAnalyzing,
    progress,
    status,
    analysisResult,
    extractedPages,
    detectedErrors,
    handleFileSelect,
    handleAnalyze,
    handleProceedToValidation
  };
};
