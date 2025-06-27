import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, Eye, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Database } from '@/integrations/supabase/types';
import SearchAndFilters from '@/components/SearchAndFilters';
import { NoAnalysesState, NoSearchResultsState, ErrorState } from '@/components/EmptyState';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type Analysis = Database['public']['Tables']['analises']['Row'];

const Historico = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [errorCountFilter, setErrorCountFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    let filtered = [...state.analyses];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(analysis =>
        analysis.arquivo_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.status === statusFilter);
    }

    // Filtro de data
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(analysis => {
        const analysisDate = new Date(analysis.created_at);
        return analysisDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filtro de quantidade de erros
    if (errorCountFilter !== 'all') {
      filtered = filtered.filter(analysis => {
        const errorCount = analysis.total_erros || 0;
        switch (errorCountFilter) {
          case '0': return errorCount === 0;
          case '1-5': return errorCount >= 1 && errorCount <= 5;
          case '6-10': return errorCount >= 6 && errorCount <= 10;
          case '10+': return errorCount > 10;
          default: return true;
        }
      });
    }

    setFilteredAnalyses(filtered);
  }, [state.analyses, searchTerm, statusFilter, dateFilter, errorCountFilter]);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter || errorCountFilter !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
    setErrorCountFilter('all');
  };

  const handleNewAnalysis = () => {
    navigate('/upload');
  };

  const handleViewAnalysis = (analysisId: string) => {
    toast({
      title: "Visualizar Análise",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processando':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'erro':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'processando':
        return 'status-warning';
      case 'concluido':
        return 'status-success';
      case 'erro':
        return 'status-error';
      default:
        return 'status-processing';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="ciabrasnet-card p-6">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 fade-in">
      <Card className="ciabrasnet-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-[var(--primary-blue)]">
            <FileText className="h-5 w-5" />
            <span>Histórico de Análises</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-[var(--primary-blue)]">
                {state.analyses.length}
              </div>
              <div className="text-sm text-gray-600">Total de Análises</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-[var(--success-green)]">
                {state.analyses.filter(a => a.status === 'concluido').length}
              </div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-[var(--accent-orange)]">
                {state.analyses.filter(a => a.status === 'processando').length}
              </div>
              <div className="text-sm text-gray-600">Em Processamento</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-[var(--error-red)]">
                {state.analyses.filter(a => a.status === 'erro').length}
              </div>
              <div className="text-sm text-gray-600">Com Erro</div>
            </div>
          </div>

          {/* Filtros */}
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            errorCountFilter={errorCountFilter}
            onErrorCountChange={setErrorCountFilter}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Tabela de Análises */}
          {state.analyses.length === 0 ? (
            <NoAnalysesState onNewAnalysis={handleNewAnalysis} />
          ) : filteredAnalyses.length === 0 ? (
            hasActiveFilters ? (
              <NoSearchResultsState searchTerm={searchTerm} />
            ) : (
              <ErrorState onRetry={() => window.location.reload()} />
            )
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erros</TableHead>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalyses.map((analysis) => (
                    <TableRow 
                      key={analysis.id} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-[var(--primary-blue)]" />
                          <span className="truncate max-w-[200px]">
                            {analysis.arquivo_nome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(analysis.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeClass(analysis.status)} border`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(analysis.status)}
                            <span className="capitalize">{analysis.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {analysis.total_erros !== null ? (
                          <Badge 
                            variant={analysis.total_erros > 0 ? "destructive" : "secondary"}
                            className="font-medium"
                          >
                            {analysis.total_erros} erros
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analysis.tempo_processamento ? (
                          <span className="text-sm font-medium text-gray-700">
                            {analysis.tempo_processamento}s
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewAnalysis(analysis.id)}
                          className="hover:bg-[var(--primary-light)] hover:text-[var(--primary-blue)]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Historico;
