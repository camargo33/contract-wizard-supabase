
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
  status: 'waiting' | 'processing' | 'completed' | 'error';
}

const FileUpload = ({ onFileSelect, onAnalyze, isAnalyzing, progress, status }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
    toast({
      title: "Arquivo carregado",
      description: `${file.name} foi carregado com sucesso.`,
    });
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleValidationError = (message: string) => {
    toast({
      title: "Formato inválido",
      description: message,
      variant: "destructive",
    });
  };

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
            onFileRemove={handleFileRemove}
            onValidationError={handleValidationError}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <UploadStatus status={status} />
        <AnalyzeButton
          onAnalyze={onAnalyze}
          disabled={!selectedFile || isAnalyzing}
          isAnalyzing={isAnalyzing}
        />
      </div>

      <ProgressIndicator progress={progress} isVisible={isAnalyzing} />
    </div>
  );
};

export default FileUpload;
