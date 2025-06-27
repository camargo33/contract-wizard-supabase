
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
    console.log('FileUpload: Clique no botão analisar', {
      selectedFile: selectedFile?.name,
      selectedModel,
      isAnalyzing,
      canAnalyze: hasFile && hasModel && notAnalyzing
    });
    onAnalyze();
  };

  // Verificações detalhadas para debug
  const hasFile = Boolean(selectedFile);
  const hasModel = Boolean(selectedModel && selectedModel.trim() !== '');
  const notAnalyzing = !isAnalyzing;
  const canAnalyze = hasFile && hasModel && notAnalyzing;
  
  // Log detalhado para identificar o problema
  console.log('FileUpload: Análise detalhada do botão', {
    'Arquivo presente': hasFile,
    'Nome do arquivo': selectedFile?.name || 'NENHUM',
    'Modelo presente': hasModel,
    'Valor do modelo': `"${selectedModel}"`,
    'Modelo válido': selectedModel && selectedModel.trim() !== '',
    'Não está analisando': notAnalyzing,
    'Estado isAnalyzing': isAnalyzing,
    'Resultado final canAnalyze': canAnalyze,
    'Status atual': status
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
      
      {/* Debug info detalhado */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-4 bg-yellow-50 rounded border border-yellow-200">
          <div className="font-bold mb-3 text-red-600">🚨 DEBUG DETALHADO:</div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-semibold text-blue-600">ARQUIVO:</div>
              <div>Presente: {hasFile ? '✅ SIM' : '❌ NÃO'}</div>
              <div>Nome: {selectedFile?.name || '❌ NENHUM'}</div>
              <div>Tipo: {selectedFile?.type || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold text-green-600">MODELO:</div>
              <div>Presente: {hasModel ? '✅ SIM' : '❌ NÃO'}</div>
              <div>Valor: "{selectedModel}"</div>
              <div>Length: {selectedModel?.length || 0}</div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="font-semibold text-purple-600">ESTADO:</div>
            <div>Analisando: {isAnalyzing ? '✅ SIM' : '❌ NÃO'}</div>
            <div>Status: {status}</div>
            <div>Progresso: {progress}%</div>
          </div>
          
          <div className="mt-3 p-2 bg-white rounded border">
            <div className="font-bold text-lg">
              🎯 BOTÃO: {canAnalyze ? '✅ HABILITADO' : '❌ DESABILITADO'}
            </div>
            <div className="text-sm mt-1">
              Condições: arquivo={hasFile ? '✅' : '❌'} | modelo={hasModel ? '✅' : '❌'} | não_analisando={notAnalyzing ? '✅' : '❌'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
