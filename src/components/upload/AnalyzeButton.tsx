
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
      className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Analisando...
        </>
      ) : (
        'Analisar Contrato'
      )}
    </Button>
  );
};

export default AnalyzeButton;
