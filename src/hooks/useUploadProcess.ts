
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
    console.log('Arquivo selecionado:', file.name);
    setSelectedFile(file);
    setStatus('waiting');
    setAnalysisResult(null);
    setExtractedPages([]);
    setProgress(0);
    setCurrentAnalysisId(null);
  };

  const handleAnalyze = async () => {
    console.log('Iniciando análise...', { 
      selectedFile: selectedFile?.name, 
      selectedModel,
      isAnalyzing 
    });

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
      setStatus('processing');
      setProgress(10);
      
      console.log('Fazendo upload do arquivo...');
      const { analysis } = await uploadFile(selectedFile);
      setCurrentAnalysisId(analysis.id);
      setProgress(30);
      
      toast({
        title: "Upload realizado",
        description: "Arquivo enviado com sucesso. Iniciando extração OCR...",
      });

      console.log('Iniciando OCR...');
      await performOCRExtraction(selectedFile, analysis.id);
      
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Erro desconhecido durante o processamento",
        variant: "destructive",
      });
      setStatus('error');
      setIsAnalyzing(false);
    }
  };

  const handleProceedToValidation = async () => {
    if (!currentAnalysisId) {
      console.error('ID da análise não encontrado');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      toast({
        title: "Iniciando validação",
        description: "Comparando com o modelo selecionado...",
      });

      console.log('Iniciando validação...');
      await performValidation(currentAnalysisId, extractedPages);
    } catch (error: any) {
      console.error('Erro na validação:', error);
      toast({
        title: "Erro na validação",
        description: error.message || "Erro desconhecido durante a validação",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Debug para verificar se o botão deve estar habilitado
  const canAnalyze = !!(selectedFile && selectedModel && !isAnalyzing);
  console.log('Estado do botão:', {
    selectedFile: !!selectedFile,
    selectedModel: !!selectedModel,
    isAnalyzing,
    canAnalyze
  });

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
    handleProceedToValidation,
    canAnalyze // Exportando para debug
  };
};
