
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { ocrService } from '@/services/ocrService';

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

export const useUploadProcess = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<AnalysisStatus>('waiting');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<PageData[]>([]);
  
  const { uploadFile, updateAnalysis, saveExtractedFields } = useSupabase();
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
      toast({
        title: "Iniciando validação",
        description: "Comparando com o modelo selecionado...",
      });

      await simulateValidation(currentAnalysisId);
    } catch (error: any) {
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
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
    handleFileSelect,
    handleAnalyze,
    handleProceedToValidation
  };
};
