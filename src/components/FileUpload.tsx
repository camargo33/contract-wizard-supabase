
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
    console.log('FileUpload: Botão analisar clicado', {
      selectedFile: selectedFile?.name,
      selectedModel,
      isAnalyzing
    });
    onAnalyze();
  };

  // Condições simples e diretas para habilitar o botão
  const hasFile = Boolean(selectedFile);
  const hasModel = Boolean(selectedModel && selectedModel.trim() !== '');
  const notAnalyzing = !isAnalyzing;
  const canAnalyze = hasFile && hasModel && notAnalyzing;
  
  console.log('FileUpload: Verificação do botão', {
    hasFile,
    fileName: selectedFile?.name,
    hasModel,
    modelValue: selectedModel,
    notAnalyzing,
    canAnalyze,
    finalButtonState: canAnalyze ? 'HABILITADO' : 'DESABILITADO'
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
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onFileRemove={() => {}} // Não precisamos mais desta função
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
      
      {/* Debug info melhorado */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-4 bg-gray-100 rounded border">
          <div className="font-bold mb-2">🔍 Debug Info:</div>
          <div>📁 Arquivo: {selectedFile?.name || '❌ NENHUM'}</div>
          <div>🏷️ Modelo: {selectedModel || '❌ NENHUM'}</div>
          <div>⚙️ Analisando: {isAnalyzing ? '✅ SIM' : '❌ NÃO'}</div>
          <div>📊 Status: {status}</div>
          <div className="mt-2 font-bold">
            🎯 Botão: {canAnalyze ? '✅ HABILITADO' : '❌ DESABILITADO'}
          </div>
          <div className="mt-1 text-xs">
            Condições: arquivo={hasFile ? '✅' : '❌'} | modelo={hasModel ? '✅' : '❌'} | não_analisando={notAnalyzing ? '✅' : '❌'}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
