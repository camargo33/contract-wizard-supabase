
import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  progress: number;
  status: 'waiting' | 'processing' | 'completed' | 'error';
}

const FileUpload = ({ onFileSelect, onAnalyze, isAnalyzing, progress, status }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
      toast({
        title: "Arquivo carregado",
        description: `${file.name} foi carregado com sucesso.`,
      });
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'waiting':
        return 'Aguardando arquivo';
      case 'processing':
        return 'Processando arquivo...';
      case 'completed':
        return 'Análise concluída';
      case 'error':
        return 'Erro no processamento';
      default:
        return 'Aguardando arquivo';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'text-gray-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload de Contrato</h2>
        <p className="text-gray-600">Faça upload de um arquivo PDF para análise automática</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-8 w-8 text-green-600" />
                  <span className="text-lg font-medium text-gray-900">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arraste e solte um arquivo PDF aqui
                  </p>
                  <p className="text-sm text-gray-600 mb-4">ou clique para selecionar</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Apenas arquivos PDF • Máximo 10MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${
            status === 'processing' ? 'bg-blue-600 animate-pulse' :
            status === 'completed' ? 'bg-green-600' :
            status === 'error' ? 'bg-red-600' : 'bg-gray-400'
          }`} />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
        </div>

        <Button
          onClick={onAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className="min-w-[120px]"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analisando...
            </>
          ) : (
            'Analisar Contrato'
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso da análise</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
