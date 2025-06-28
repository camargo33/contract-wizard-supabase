
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { ocrService } from '@/services/ocrService';
import { AnalysisStatus, PageData } from '@/types/upload';

interface UseOCRProcessingProps {
  setStatus: (status: AnalysisStatus) => void;
  setProgress: (progress: number) => void;
  setExtractedPages: (pages: PageData[]) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const useOCRProcessing = ({
  setStatus,
  setProgress,
  setExtractedPages,
  setIsAnalyzing
}: UseOCRProcessingProps) => {
  const { updateAnalysis, saveExtractedFields } = useSupabase();
  const { toast } = useToast();

  const performOCRExtraction = async (file: File, analysisId: string) => {
    console.log('=== INICIANDO HOOK OCR PROCESSING ===');
    console.log('Arquivo:', file.name);
    console.log('Analysis ID:', analysisId);
    
    try {
      setStatus('processing');
      setProgress(0);
      
      // Verificar se o arquivo é válido
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Arquivo deve ser um PDF válido');
      }
      
      console.log('Chamando serviço OCR...');
      const pages = await ocrService.processDocument(file, (progress) => {
        console.log(`Progresso OCR: ${progress}%`);
        setProgress(progress);
      });

      console.log('OCR concluído, salvando campos extraídos...');
      setProgress(90);

      // Salvar campos extraídos no banco
      for (const page of pages) {
        try {
          await saveExtractedFields(analysisId, {
            pageNumber: page.pageNumber,
            rawText: page.rawText,
            extractedFields: page.extractedFields
          });
          console.log(`Campos da página ${page.pageNumber} salvos no banco`);
        } catch (saveError) {
          console.error(`Erro ao salvar página ${page.pageNumber}:`, saveError);
          // Continuar mesmo se não conseguir salvar uma página
        }
      }

      setExtractedPages(pages);
      setStatus('extracted');
      setProgress(100);
      
      // Atualizar status da análise
      await updateAnalysis(analysisId, {
        status: 'processando'
      });

      const totalFields = pages.reduce((acc, p) => acc + p.extractedFields.length, 0);
      
      toast({
        title: "Extração concluída com sucesso!",
        description: `${totalFields} campos identificados em ${pages.length} página(s)`,
      });

      console.log('=== OCR PROCESSING FINALIZADO COM SUCESSO ===');

    } catch (error: any) {
      console.error('=== ERRO NO OCR PROCESSING ===', error);
      
      setStatus('error');
      setProgress(0);
      
      // Tentar atualizar status no banco
      try {
        await updateAnalysis(analysisId, {
          status: 'erro'
        });
      } catch (updateError) {
        console.error('Erro ao atualizar status no banco:', updateError);
      }

      // Mostrar erro detalhado para o usuário
      const errorMessage = error.message || 'Erro desconhecido durante a extração';
      
      toast({
        title: "Erro na extração OCR",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Re-throw para ser capturado no nível superior
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    performOCRExtraction
  };
};
