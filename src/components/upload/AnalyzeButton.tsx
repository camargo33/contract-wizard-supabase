
import React from 'react';
import { Button } from '@/components/ui/button';

interface AnalyzeButtonProps {
  onAnalyze: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

const AnalyzeButton = ({ onAnalyze, disabled, isAnalyzing }: AnalyzeButtonProps) => {
  return (
    <Button
      onClick={onAnalyze}
      disabled={disabled}
      className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isAnalyzing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Analisando...
        </>
      ) : (
        'Analisar Contrato'
      )}
    </Button>
  );
};

export default AnalyzeButton;
