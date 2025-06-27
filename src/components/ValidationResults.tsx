
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AnalysisResult {
  totalErrors: number;
  missingFields: string[];
  validationErrors: string[];
  processingTime: number;
}

interface ValidationResultsProps {
  analysisResult: AnalysisResult;
}

const ValidationResults = ({ analysisResult }: ValidationResultsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {analysisResult.totalErrors === 0 ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span>Resultado da Validação</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysisResult.totalErrors}
            </div>
            <div className="text-sm text-gray-600">Total de Erros</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysisResult.missingFields.length}
            </div>
            <div className="text-sm text-gray-600">Campos Faltantes</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {analysisResult.processingTime}s
            </div>
            <div className="text-sm text-gray-600">Tempo de Processamento</div>
          </div>
        </div>

        {analysisResult.missingFields.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              Campos Obrigatórios Faltantes
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {analysisResult.missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.validationErrors.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              Erros de Validação
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {analysisResult.validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationResults;
