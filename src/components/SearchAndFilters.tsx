
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  errorCountFilter: string;
  onErrorCountChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  errorCountFilter,
  onErrorCountChange,
  onClearFilters,
  hasActiveFilters
}: SearchAndFiltersProps) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);

  return (
    <div className="space-y-4 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Buscar por nome do arquivo..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-gray-800"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-[180px] bg-white border-gray-200 text-gray-800">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-800">Todos os Status</SelectItem>
            <SelectItem value="processando" className="text-gray-800">Processando</SelectItem>
            <SelectItem value="concluido" className="text-gray-800">Concluído</SelectItem>
            <SelectItem value="erro" className="text-gray-800">Erro</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full lg:w-[180px] bg-white border-gray-200 text-gray-800"
        />

        {/* Error Count Filter */}
        <Select value={errorCountFilter} onValueChange={onErrorCountChange}>
          <SelectTrigger className="w-full lg:w-[180px] bg-white border-gray-200 text-gray-800">
            <SelectValue placeholder="Quantidade de Erros" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all" className="text-gray-800">Todos</SelectItem>
            <SelectItem value="0" className="text-gray-800">Sem erros</SelectItem>
            <SelectItem value="1-5" className="text-gray-800">1-5 erros</SelectItem>
            <SelectItem value="6-10" className="text-gray-800">6-10 erros</SelectItem>
            <SelectItem value="10+" className="text-gray-800">Mais de 10</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Filtros ativos aplicados</span>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;
