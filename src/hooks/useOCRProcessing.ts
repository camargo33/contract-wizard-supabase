
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

  return {
    performOCRExtraction
  };
};
