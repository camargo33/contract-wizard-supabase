
import React from 'react';
import ContractModelSelector from '@/components/ContractModelSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UploadConfigurationProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const UploadConfiguration = ({ selectedModel, onModelChange }: UploadConfigurationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração da Análise</CardTitle>
      </CardHeader>
      <CardContent>
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
