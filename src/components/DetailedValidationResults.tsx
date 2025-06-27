
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  FileText,
  RotateCcw
} from 'lucide-react';

interface DetectedError {
  id: string;
  tipo_erro: string;
  campo_afetado: string;
  valor_encontrado?: string;
  valor_esperado?: string;
  sugestao_correcao?: string;
  severidade: 'critica' | 'alta' | 'media' | 'baixa';
  confianca: number;
}

interface DetailedValidationResultsProps {
  errors: DetectedError[];
  analysisResult: {
    totalErrors: number;
    processingTime: number;
  };
  onNewAnalysis: () => void;
  onGenerateReport: () => void;
}

const DetailedValidationResults = ({ 
  errors, 
  analysisResult, 
  onNewAnalysis,
  onGenerateReport 
}: DetailedValidationResultsProps) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critica': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'alta': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'media': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'baixa': return <Info className="h-4 w-4 text-blue-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels = {
      'critica': 'Crítico',
      'alta': 'Alto',
      'media': 'Médio',
      'baixa': 'Baixo'
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getTypeLabel = (tipo: string) => {
    const labels = {
      'campo_obrigatorio': 'Campo Obrigatório',
      'formato_invalido': 'Formato Inválido',
      'inconsistencia': 'Inconsistência',
      'valor_incorreto': 'Valor Incorreto'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  // Agrupar erros por severidade
  const errorsBySeverity = {
    critica: errors.filter(e => e.severidade === 'critica'),
    alta: errors.filter(e => e.severidade === 'alta'),
    media: errors.filter(e => e.severidade === 'media'),
    baixa: errors.filter(e => e.severidade === 'baixa')
  };

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
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
        <CardContent>
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">
                {errorsBySeverity.critica.length}
              </div>
              <div className="text-sm text-red-600">Críticos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {errorsBySeverity.alta.length}
              </div>
              <div className="text-sm text-orange-600">Altos</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">
                {errorsBySeverity.media.length}
              </div>
              <div className="text-sm text-yellow-600">Médios</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {errorsBySeverity.baixa.length}
              </div>
              <div className="text-sm text-blue-600">Baixos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">
                {analysisResult.processingTime}s
              </div>
              <div className="text-sm text-gray-600">Processamento</div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onGenerateReport} variant="default">
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
            <Button onClick={onNewAnalysis} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Nova Análise
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Erros por Severidade */}
      {analysisResult.totalErrors > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes dos Erros Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="critica" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="critica" className="text-red-600">
                  Críticos ({errorsBySeverity.critica.length})
                </TabsTrigger>
                <TabsTrigger value="alta" className="text-orange-600">
                  Altos ({errorsBySeverity.alta.length})
                </TabsTrigger>
                <TabsTrigger value="media" className="text-yellow-600">
                  Médios ({errorsBySeverity.media.length})
                </TabsTrigger>
                <TabsTrigger value="baixa" className="text-blue-600">
                  Baixos ({errorsBySeverity.baixa.length})
                </TabsTrigger>
              </TabsList>

              {Object.entries(errorsBySeverity).map(([severity, severityErrors]) => (
                <TabsContent key={severity} value={severity} className="space-y-4">
                  {severityErrors.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>Nenhum erro encontrado nesta categoria</p>
                    </div>
                  ) : (
                    severityErrors.map((error, index) => (
                      <Card key={error.id} className="border-l-4 border-l-current">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getSeverityIcon(error.severidade)}
                                <Badge 
                                  className={`${getSeverityColor(error.severidade)} border`}
                                  variant="outline"
                                >
                                  {getSeverityLabel(error.severidade)}
                                </Badge>
                                <Badge variant="secondary">
                                  {getTypeLabel(error.tipo_erro)}
                                </Badge>
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 mb-1">
                                Campo: {error.campo_afetado}
                              </h4>
                              
                              {error.valor_encontrado && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Encontrado:</strong> {error.valor_encontrado}
                                </p>
                              )}
                              
                              {error.valor_esperado && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Esperado:</strong> {error.valor_esperado}
                                </p>
                              )}
                              
                              {error.sugestao_correcao && (
                                <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded mt-2">
                                  <strong>Sugestão:</strong> {error.sugestao_correcao}
                                </p>
                              )}
                            </div>
                            
                            <div className="ml-4 text-right">
                              <div className="text-sm text-gray-500">
                                Confiança: {error.confianca}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedValidationResults;
