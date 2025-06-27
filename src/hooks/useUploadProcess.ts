
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { useUploadState } from '@/hooks/useUploadState';
import { useOCRProcessing } from '@/hooks/useOCRProcessing';
import { useValidationProcessing } from '@/hooks/useValidationProcessing';

export const useUploadProcess = () => {
  const {
    selectedFile,
    setSelectedFile,
    selectedModel,
    setSelectedModel,
    isAnalyzing,
    setIsAnalyzing,
    progress,
    setProgress,
    status,
    setStatus,
    analysisResult,
    setAnalysisResult,
    currentAnalysisId,
    setCurrentAnalysisId,
    extractedPages,
    setExtractedPages,
    detectedErrors,
    setDetectedErrors,
    resetState
  } = useUploadState();

  const { uploadFile } = useSupabase();
  const { toast } = useToast();

  const { performOCRExtraction } = useOCRProcessing({
    setStatus,
    setProgress,
    setExtractedPages,
    setIsAnalyzing
  });

  const { performValidation } = useValidationProcessing({
    selectedModel,
    setStatus,
    setProgress,
    setAnalysisResult,
    setDetectedErrors
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('waiting');
    setAnalysisResult(null);
    setExtractedPages([]);
    setProgress(0);
    setCurrentAnalysisId(null);
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
