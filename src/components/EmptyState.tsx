
import React from 'react';
import { FileText, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  const defaultIcon = <FileText className="h-16 w-16 text-gray-300" />;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center fade-in">
      <div className="mb-6 text-gray-300">
        {icon || defaultIcon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="ciabrasnet-btn-primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const NoAnalysesState = ({ onNewAnalysis }: { onNewAnalysis: () => void }) => (
  <EmptyState
    icon={<FileText className="h-16 w-16 text-blue-300" />}
    title="Nenhuma análise encontrada"
    description="Comece fazendo upload de um contrato para análise automática"
    action={{
      label: "Nova Análise",
      onClick: onNewAnalysis
    }}
  />
);

export const NoSearchResultsState = ({ searchTerm }: { searchTerm: string }) => (
  <EmptyState
    icon={<Search className="h-16 w-16 text-gray-300" />}
    title="Nenhum resultado encontrado"
    description={`Não encontramos análises que correspondam a "${searchTerm}"`}
  />
);

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon={<AlertCircle className="h-16 w-16 text-red-300" />}
    title="Erro ao carregar dados"
    description="Ocorreu um erro ao carregar as informações. Tente novamente."
    action={{
      label: "Tentar Novamente",
      onClick: onRetry
    }}
  />
);

export default EmptyState;
