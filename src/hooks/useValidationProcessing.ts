
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { GeminiAnalysisService } from '@/services/geminiService';
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
      console.log('Iniciando validação com Gemini...');
      setStatus('processing');
      setProgress(0);

      // Verificar se a API key está configurada
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        throw new Error('API key do OpenRouter não configurada. Configure VITE_OPENROUTER_API_KEY nas variáveis de ambiente.');
      }

      // Obter modelo de contrato selecionado
      const models = await getContractModels();
      const selectedModelData = models?.find(m => m.id === selectedModel);
      
      if (!selectedModelData) {
        throw new Error('Modelo de contrato não encontrado');
      }

      setProgress(20);

      // Combinar todo o texto extraído das páginas
      const allText = extractedPages
        .map(page => page.rawText)
        .join('\n\n')
        .trim();

      if (!allText) {
        throw new Error('Nenhum texto foi extraído do documento');
      }

      console.log('Texto extraído para análise:', allText.substring(0, 500) + '...');
      setProgress(40);

      // Executar análise com Gemini
      const geminiResult = await GeminiAnalysisService.analyzeContract(
        allText, 
        selectedModelData.nome
      );

      setProgress(70);

      // Converter resultado do Gemini para o formato esperado
      const detectedErrors: DetectedError[] = geminiResult.erros.map((erro, index) => ({
        id: `error-${index}`,
        tipo_erro: erro.severidade === 'critico' ? 'campo_obrigatorio' : 'validacao',
        campo_afetado: erro.campo,
        valor_encontrado: erro.valor_encontrado,
        valor_esperado: erro.valor_esperado,
        sugestao_correcao: erro.sugestao_correcao,
        severidade: erro.severidade,
        confianca: erro.confianca
      }));

      // Salvar erros detectados
      if (detectedErrors.length > 0) {
        await saveDetectedErrors(analysisId, detectedErrors);
      }

      setProgress(90);

      // Atualizar análise
      const finalStatus = geminiResult.status_contrato === 'aprovado' ? 'concluido' : 'erro';
      await updateAnalysis(analysisId, {
        status: finalStatus,
        total_erros: geminiResult.resumo.total_erros,
        tempo_processamento: 5
      });

      // Preparar resultado da análise
      const result: AnalysisResult = {
        totalErrors: geminiResult.resumo.total_erros,
        missingFields: detectedErrors
          .filter(e => e.tipo_erro === 'campo_obrigatorio')
          .map(e => e.campo_afetado),
        validationErrors: detectedErrors
          .filter(e => e.tipo_erro !== 'campo_obrigatorio')
          .map(e => `${e.campo_afetado}: ${e.sugestao_correcao}`),
        processingTime: 5,
      };

      setAnalysisResult(result);
      setDetectedErrors(detectedErrors);
      setStatus(geminiResult.resumo.total_erros > 0 ? 'error' : 'completed');
      setProgress(100);
      
      toast({
        title: "Análise concluída com Gemini",
        description: `${geminiResult.resumo.total_erros} erros encontrados - Status: ${geminiResult.status_contrato}`,
        variant: geminiResult.resumo.total_erros > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      console.error('Erro na validação com Gemini:', error);
      setStatus('error');
      await updateAnalysis(analysisId, {
        status: 'erro'
      });
      
      toast({
        title: "Erro na análise",
        description: error.message || "Erro desconhecido durante a análise",
        variant: "destructive",
      });
    }
  };

  return {
    performValidation
  };
};
