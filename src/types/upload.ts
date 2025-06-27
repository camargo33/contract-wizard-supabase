
export type AnalysisStatus = 'waiting' | 'processing' | 'extracted' | 'completed' | 'error';

export interface AnalysisResult {
  totalErrors: number;
  missingFields: string[];
  validationErrors: string[];
  processingTime: number;
}

export interface PageData {
  pageNumber: number;
  rawText: string;
  extractedFields: any[];
}

export interface DetectedError {
  id: string;
  tipo_erro: string;
  campo_afetado: string;
  valor_encontrado?: string;
  valor_esperado?: string;
  sugestao_correcao?: string;
  severidade: 'critica' | 'alta' | 'media' | 'baixa';
  confianca: number;
}
