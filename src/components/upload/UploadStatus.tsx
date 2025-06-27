
import React from 'react';

interface UploadStatusProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
}

const UploadStatus = ({ status }: UploadStatusProps) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'waiting':
        return 'Aguardando arquivo';
      case 'processing':
        return 'Processando arquivo...';
      case 'completed':
        return 'Análise concluída';
      case 'error':
        return 'Erro no processamento';
      default:
        return 'Aguardando arquivo';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'text-gray-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`h-3 w-3 rounded-full ${
        status === 'processing' ? 'bg-blue-600 animate-pulse' :
        status === 'completed' ? 'bg-green-600' :
        status === 'error' ? 'bg-red-600' : 'bg-gray-400'
      }`} />
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusMessage()}
      </span>
    </div>
  );
};

export default UploadStatus;
