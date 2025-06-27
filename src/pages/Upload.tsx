
import React from 'react';
import FileUpload from '@/components/FileUpload';
import UploadConfiguration from '@/components/UploadConfiguration';
import ExtractedFieldsDisplay from '@/components/ExtractedFieldsDisplay';
import DetailedValidationResults from '@/components/DetailedValidationResults';
import GeminiConfigStatus from '@/components/GeminiConfigStatus';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useUploadProcess } from '@/hooks/useUploadProcess';

const Upload = () => {
  const {
    selectedFile,
    selectedModel,
    setSelectedModel,
    isAnalyzing,
    progress,
    status,
    analysisResult,
    extractedPages,
    detectedErrors,
    handleFileSelect,
    handleAnalyze,
    handleProceedToValidation
  } = useUploadProcess();

  const handleNewAnalysis = () => {
    window.location.reload(); // Simples reset para nova análise
  };

  const handleGenerateReport = () => {
    // TODO: Implementar geração de relatório
    console.log('Gerando relatório...', { analysisResult, detectedErrors });
  };

  // Debug info
  console.log('Upload page state:', {
    selectedFile: selectedFile?.name,
    selectedModel,
    isAnalyzing,
    status
  });

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise de Contrato</h2>
          <p className="text-gray-600">Faça upload de um contrato e selecione um modelo para análise automática com Google Gemini</p>
        </div>

        <GeminiConfigStatus />

        {status !== 'extracted' && status !== 'completed' && status !== 'error' && (
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
              selectedFile={selectedFile}
              selectedModel={selectedModel}
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

        {analysisResult && (status === 'completed' || status === 'error') && (
          <DetailedValidationResults
            errors={detectedErrors}
            analysisResult={analysisResult}
            onNewAnalysis={handleNewAnalysis}
            onGenerateReport={handleGenerateReport}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Upload;
