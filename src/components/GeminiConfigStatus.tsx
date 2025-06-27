
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Settings } from 'lucide-react';

const GeminiConfigStatus = () => {
  const isConfigured = Boolean(import.meta.env.VITE_OPENROUTER_API_KEY);

  if (isConfigured) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-green-800 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Google Gemini Configurado
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-green-700">
            Análise de contratos com IA ativada via OpenRouter
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Configuração Necessária
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-amber-700">
          Configure sua API key do OpenRouter para ativar a análise com IA:
        </p>
        <div className="bg-amber-100 p-3 rounded-md">
          <code className="text-xs text-amber-900">
            VITE_OPENROUTER_API_KEY=sua_api_key_aqui
          </code>
        </div>
        <div className="flex items-center text-xs text-amber-600">
          <Settings className="h-3 w-3 mr-1" />
          <span>Adicione nas variáveis de ambiente do projeto</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeminiConfigStatus;
