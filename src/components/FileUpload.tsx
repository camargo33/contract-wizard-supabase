
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
  const [internalSelectedFile, setInternalSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Use selectedFile prop if provided, otherwise use internal state
  const currentFile = selectedFile || internalSelectedFile;

  const handleFileSelect = (file: File) => {
    console.log('FileUpload: Arquivo selecionado', file.name);
    setInternalSelectedFile(file);
    onFileSelect(file);
    toast({
      title: "Arquivo carregado",
      description: `${file.name} foi carregado com sucesso.`,
    });
  };

  const handleFileRemove = () => {
    console.log('FileUpload: Arquivo removido');
    setInternalSelectedFile(null);
  };

  const handleValidationError = (message: string) => {
    toast({
      title: "Formato inválido",
      description: message,
      variant: "destructive",
    });
  };

  const handleAnalyzeClick = () => {
    console.log('FileUpload: Botão analisar clicado', {
      currentFile: currentFile?.name,
      selectedModel,
      isAnalyzing
    });
    onAnalyze();
  };

  // Verificar se pode analisar - simplificado para garantir que funcione
  const canAnalyze = Boolean(currentFile && selectedModel && !isAnalyzing);
  
  console.log('FileUpload: Estado do botão', {
    currentFile: Boolean(currentFile),
    currentFileName: currentFile?.name,
    selectedModel: Boolean(selectedModel),
    selectedModelValue: selectedModel,
    isAnalyzing,
    canAnalyze
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload de Contrato</h2>
        <p className="text-gray-600">Faça upload de um arquivo PDF para análise automática</p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6 bg-white">
          <FileDropZone
            selectedFile={currentFile}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
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
      
      {/* Debug info - expandido para melhor troubleshooting */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <div>Debug Info:</div>
          <div>Arquivo: {currentFile?.name || 'nenhum'}</div>
          <div>Modelo: {selectedModel || 'nenhum'}</div>
          <div>Analisando: {isAnalyzing ? 'sim' : 'não'}</div>
          <div>Pode analisar: {canAnalyze ? 'SIM' : 'NÃO'}</div>
          <div>Status: {status}</div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
