
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ContractModelSelector from '@/components/ContractModelSelector';
import ExtractedFieldsDisplay from '@/components/ExtractedFieldsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { ocrService } from '@/services/ocrService';
import { Database } from '@/integrations/supabase/types';

type AnalysisStatus = 'waiting' | 'processing' | 'extracted' | 'completed' | 'error';
type Analysis = Database['public']['Tables']['analises']['Row'];

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

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<AnalysisStatus>('waiting');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<PageData[]>([]);
  
  const { uploadFile, updateAnalysis, saveExtractedFields } = useSupabase();
  const { dispatch } = useAppContext();
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
      
      // Processar documento com OCR
      const pages = await ocrService.processDocument(file, (progress) => {
        setProgress(progress);
      });

      console.log('OCR concluído, salvando campos extraídos...');

      // Salvar campos extraídos no Supabase
      for (const page of pages) {
        await saveExtractedFields(analysisId, {
          pageNumber: page.pageNumber,
          rawText: page.rawText,
          extractedFields: page.extractedFields
        });
      }

      setExtractedPages(pages);
      setStatus('extracted');
      
      // Atualizar análise no Supabase
      await updateAnalysis(analysisId, {
        status: 'processando' // Ainda em processamento, aguardando validação
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

    // Simular progresso da validação
    const intervals = [10, 25, 45, 65, 80, 95, 100];
    
    for (const targetProgress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(targetProgress);
    }

    // Simular resultado da validação
    const mockResult: AnalysisResult = {
      totalErrors: Math.floor(Math.random() * 5),
      missingFields: ['endereco', 'telefone'],
      validationErrors: ['CPF inválido', 'Email mal formatado'],
      processingTime: 3,
    };

    // Atualizar análise no Supabase
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
      
      // Upload arquivo e criar registro
      const { analysis } = await uploadFile(selectedFile);
      setCurrentAnalysisId(analysis.id);
      
      toast({
        title: "Upload realizado",
        description: "Arquivo enviado com sucesso. Iniciando extração OCR...",
      });

      // Iniciar extração OCR
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

      // Iniciar validação simulada
      await simulateValidation(currentAnalysisId);
    } catch (error: any) {
      toast({
        title: "Erro na validação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise de Contrato</h2>
        <p className="text-gray-600">Faça upload de um contrato e selecione um modelo para análise automática</p>
      </div>

      {status !== 'extracted' && status !== 'completed' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                required={true}
              />
            </CardContent>
          </Card>

          <FileUpload
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            progress={progress}
            status={status}
          />
        </>
      )}

      {status === 'extracted' && (
        <ExtractedFieldsDisplay
          pages={extractedPages}
          onProceedToValidation={handleProceedToValidation}
          isLoading={isAnalyzing}
        />
      )}

      {analysisResult && status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {analysisResult.totalErrors === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Resultado da Validação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {analysisResult.totalErrors}
                </div>
                <div className="text-sm text-gray-600">Total de Erros</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {analysisResult.missingFields.length}
                </div>
                <div className="text-sm text-gray-600">Campos Faltantes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {analysisResult.processingTime}s
                </div>
                <div className="text-sm text-gray-600">Tempo de Processamento</div>
              </div>
            </div>

            {analysisResult.missingFields.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  Campos Obrigatórios Faltantes
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {analysisResult.missingFields.map((field, index) => (
                    <li key={index}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.validationErrors.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  Erros de Validação
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {analysisResult.validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
