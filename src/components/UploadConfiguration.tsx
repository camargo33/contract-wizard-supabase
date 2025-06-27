
import React from 'react';
import ContractModelSelector from '@/components/ContractModelSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UploadConfigurationProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const UploadConfiguration = ({ selectedModel, onModelChange }: UploadConfigurationProps) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="bg-white">
        <CardTitle className="text-gray-800">Configuração da Análise</CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        <ContractModelSelector
          value={selectedModel}
          onChange={onModelChange}
          required={true}
        />
      </CardContent>
    </Card>
  );
};

export default UploadConfiguration;
