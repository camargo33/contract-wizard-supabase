
import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onValidationError: (message: string) => void;
}

const FileDropZone = ({ selectedFile, onFileSelect, onFileRemove, onValidationError }: FileDropZoneProps) => {
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf') {
      onValidationError("Apenas arquivos PDF são aceitos.");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      onValidationError("O arquivo deve ter no máximo 10MB.");
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
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

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors bg-white ${
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
              onClick={onFileRemove}
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
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
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
  );
};

export default FileDropZone;
