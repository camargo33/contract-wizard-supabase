
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Database } from '@/integrations/supabase/types';

type Analysis = Database['public']['Tables']['analises']['Row'];

const Historico = () => {
  const { state } = useAppContext();
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    let filtered = [...state.analyses];

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(analysis => analysis.status === statusFilter);
    }

    // Filtrar por data
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(analysis => {
        const analysisDate = new Date(analysis.created_at);
        return analysisDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredAnalyses(filtered);
  }, [state.analyses, statusFilter, dateFilter]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processando':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Histórico de Análises</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[180px]"
                placeholder="Filtrar por data"
              />
            </div>

            {(statusFilter !== 'all' || dateFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setDateFilter('');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {state.analyses.length}
              </div>
              <div className="text-sm text-gray-600">Total de Análises</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {state.analyses.filter(a => a.status === 'concluido').length}
              </div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {state.analyses.filter(a => a.status === 'processando').length}
              </div>
              <div className="text-sm text-gray-600">Em Processamento</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {state.analyses.filter(a => a.status === 'erro').length}
              </div>
              <div className="text-sm text-gray-600">Com Erro</div>
            </div>
          </div>

          {/* Tabela de Análises */}
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {state.analyses.length === 0 
                  ? 'Nenhuma análise realizada ainda' 
                  : 'Nenhuma análise encontrada com os filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="truncate max-w-[200px]">
                            {analysis.arquivo_nome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(analysis.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(analysis.status)} border`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(analysis.status)}
                            <span className="capitalize">{analysis.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {analysis.total_erros !== null ? (
                          <Badge variant={analysis.total_erros > 0 ? "destructive" : "secondary"}>
                            {analysis.total_erros} erros
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {analysis.tempo_processamento ? (
                          `${analysis.tempo_processamento}s`
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
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
