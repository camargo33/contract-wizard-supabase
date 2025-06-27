
import React from 'react';
import FileUpload from '@/components/FileUpload';
import UploadConfiguration from '@/components/UploadConfiguration';
import ExtractedFieldsDisplay from '@/components/ExtractedFieldsDisplay';
import ValidationResults from '@/components/ValidationResults';
import { useUploadProcess } from '@/hooks/useUploadProcess';

const Upload = () => {
  const {
    selectedModel,
    setSelectedModel,
    isAnalyzing,
    progress,
    status,
    analysisResult,
    extractedPages,
    handleFileSelect,
    handleAnalyze,
    handleProceedToValidation
  } = useUploadProcess();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise de Contrato</h2>
        <p className="text-gray-600">Faça upload de um contrato e selecione um modelo para análise automática</p>
      </div>

      {status !== 'extracted' && status !== 'completed' && (
        <>
          <UploadConfiguration
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

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
        <ValidationResults analysisResult={analysisResult} />
      )}
    </div>
  );
};

export default Upload;
