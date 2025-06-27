
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onAnalyze: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

const AnalyzeButton = ({ onAnalyze, disabled, isAnalyzing }: AnalyzeButtonProps) => {
  console.log('AnalyzeButton: Renderização com estado', {
    disabled,
    isAnalyzing,
    buttonClickable: !disabled,
    willHandleClick: !disabled && !isAnalyzing
  });

  const handleClick = () => {
    console.log('AnalyzeButton: CLIQUE DETECTADO!', {
      disabled,
      isAnalyzing,
      willExecuteCallback: !disabled && !isAnalyzing
    });
    
    if (!disabled && !isAnalyzing) {
      console.log('AnalyzeButton: Executando callback onAnalyze');
      onAnalyze();
    } else {
      console.log('AnalyzeButton: Clique bloqueado - botão desabilitado ou analisando');
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={`min-w-[120px] text-white transition-all duration-200 ${
        disabled 
          ? 'bg-gray-400 cursor-not-allowed opacity-50' 
          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
      }`}
      type="button"
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
