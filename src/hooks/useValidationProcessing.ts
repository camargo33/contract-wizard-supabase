
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { ValidationEngine } from '@/services/validationEngine';
import { AnalysisStatus, AnalysisResult, PageData, DetectedError } from '@/types/upload';

interface UseValidationProcessingProps {
  selectedModel: string;
  setStatus: (status: AnalysisStatus) => void;
  setProgress: (progress: number) => void;
  setAnalysisResult: (result: AnalysisResult) => void;
  setDetectedErrors: (errors: DetectedError[]) => void;
}

export const useValidationProcessing = ({
  selectedModel,
  setStatus,
  setProgress,
  setAnalysisResult,
  setDetectedErrors
}: UseValidationProcessingProps) => {
  const { updateAnalysis, saveDetectedErrors, getContractModels } = useSupabase();
  const { toast } = useToast();

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

  return {
    performValidation
  };
};
