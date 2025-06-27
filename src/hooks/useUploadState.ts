
import { useState } from 'react';
import { AnalysisStatus, AnalysisResult, PageData, DetectedError } from '@/types/upload';

export const useUploadState = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<AnalysisStatus>('waiting');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<PageData[]>([]);
  const [detectedErrors, setDetectedErrors] = useState<DetectedError[]>([]);

  const resetState = () => {
    setSelectedFile(null);
    setStatus('waiting');
    setAnalysisResult(null);
    setExtractedPages([]);
    setProgress(0);
    setCurrentAnalysisId(null);
    setDetectedErrors([]);
  };

  return {
    selectedFile,
    setSelectedFile,
    selectedModel,
    setSelectedModel,
    isAnalyzing,
    setIsAnalyzing,
    progress,
    setProgress,
    status,
    setStatus,
    analysisResult,
    setAnalysisResult,
    currentAnalysisId,
    setCurrentAnalysisId,
    extractedPages,
    setExtractedPages,
    detectedErrors,
    setDetectedErrors,
    resetState
  };
};
