import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Calendar, Filter, Search } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Analysis = Database['public']['Tables']['analises']['Row'];

const Historico = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { getAnalyses } = useSupabase();
  const { toast } = useToast();

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await getAnalyses();
      setAnalyses(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch = analysis.arquivo_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const analysisDate = new Date(analysis.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = analysisDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = analysisDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = analysisDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'processando': { variant: 'secondary' as const, label: 'Processando' },
      'concluido': { variant: 'default' as const, label: 'Concluído' },
      'erro': { variant: 'destructive' as const, label: 'Erro' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Análises</h2>
          <p className="text-gray-600">Visualize e gerencie suas análises anteriores</p>
        </div>
        <Button onClick={loadAnalyses} className="bg-blue-600 hover:bg-blue-700 text-white">
          Atualizar
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6 bg-white">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 text-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="text-gray-900">Todos</SelectItem>
                  <SelectItem value="processando" className="text-gray-900">Processando</SelectItem>
                  <SelectItem value="concluido" className="text-gray-900">Concluído</SelectItem>
                  <SelectItem value="erro" className="text-gray-900">Erro</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40 bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="all" className="text-gray-900">Todos</SelectItem>
                  <SelectItem value="today" className="text-gray-900">Hoje</SelectItem>
                  <SelectItem value="week" className="text-gray-900">Última semana</SelectItem>
                  <SelectItem value="month" className="text-gray-900">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredAnalyses.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8 text-center bg-white">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {analyses.length === 0 ? 'Nenhuma análise encontrada' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-600">
              {analyses.length === 0 
                ? 'Comece fazendo upload de um contrato para análise'
                : 'Tente ajustar os filtros para encontrar o que procura'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="bg-white">
            <CardTitle className="text-gray-900">
              Análises ({filteredAnalyses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="border rounded-lg overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-900 font-semibold">Arquivo</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Data</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Erros</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Tempo</TableHead>
                    <TableHead className="text-gray-900 font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalyses.map((analysis) => (
                    <TableRow key={analysis.id} className="hover:bg-gray-50 transition-colors bg-white">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{analysis.arquivo_nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{formatDate(analysis.created_at)}</TableCell>
                      <TableCell>
                        {getStatusBadge(analysis.status || 'processando')}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {analysis.total_erros || 0} erros
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {analysis.tempo_processamento ? `${analysis.tempo_processamento}min` : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <Download className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Historico;
