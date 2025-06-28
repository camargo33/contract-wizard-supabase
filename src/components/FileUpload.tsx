
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FileDropZone from '@/components/upload/FileDropZone';
import UploadStatus from '@/components/upload/UploadStatus';
import AnalyzeButton from '@/components/upload/AnalyzeButton';
import ProgressIndicator from '@/components/upload/ProgressIndicator';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error' | 'extracted';
  selectedFile?: File | null;
  selectedModel?: string;
}

const FileUpload = ({ 
  onFileSelect, 
  onAnalyze, 
  isAnalyzing, 
  progress, 
  status,
  selectedFile = null,
  selectedModel = ''
}: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    console.log('FileUpload: Arquivo selecionado', file.name);
    onFileSelect(file);
    toast({
      title: "Arquivo carregado",
      description: `${file.name} foi carregado com sucesso.`,
    });
  };

  const handleValidationError = (message: string) => {
    toast({
      title: "Formato inválido",
      description: message,
      variant: "destructive",
    });
  };

  const handleAnalyzeClick = () => {
    console.log('FileUpload: Clique no botão analisar');
    onAnalyze();
  };

  // Verificações para habilitar o botão
  const hasFile = Boolean(selectedFile);
  const hasModel = Boolean(selectedModel && selectedModel.trim() !== '');
  const canAnalyze = hasFile && hasModel && !isAnalyzing;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload de Contrato</h2>
        <p className="text-gray-600">Faça upload de um arquivo PDF para análise automática</p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6 bg-white">
          <FileDropZone
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={() => {}}
            onValidationError={handleValidationError}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <UploadStatus status={status} />
        <AnalyzeButton
          onAnalyze={handleAnalyzeClick}
          disabled={!canAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </div>

      <ProgressIndicator progress={progress} isVisible={isAnalyzing} />
      
      {/* Status detalhado para debug */}
      {status === 'processing' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <div className="font-semibold mb-2">Processamento em andamento:</div>
              <div className="space-y-1">
                {progress < 25 && <div>• Carregando arquivo PDF...</div>}
                {progress >= 25 && progress < 85 && <div>• Extraindo texto das páginas...</div>}
                {progress >= 85 && <div>• Identificando campos estruturados...</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {status === 'error' && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="text-sm text-red-800">
              <div className="font-semibold mb-2">Erro no processamento</div>
              <div>Verifique o console do navegador para mais detalhes ou tente novamente com outro arquivo.</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
