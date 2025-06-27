
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type ContractModel = Database['public']['Tables']['contratos_modelo']['Row'];
type Analysis = Database['public']['Tables']['analises']['Row'];

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [contractModels, setContractModels] = useState<ContractModel[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsResponse, analysesResponse] = await Promise.all([
        supabase.from('contratos_modelo').select('*').order('created_at', { ascending: false }),
        supabase.from('analises').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      if (modelsResponse.error) throw modelsResponse.error;
      if (analysesResponse.error) throw analysesResponse.error;

      setContractModels(modelsResponse.data || []);
      setAnalyses(analysesResponse.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processando':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'erro':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCamposObrigatorios = (campos: any): string[] => {
    if (Array.isArray(campos)) {
      return campos;
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Sistema de Análise de Contratos
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload de Contratos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Analisar Novo Contrato
                </CardTitle>
                <CardDescription>
                  Faça upload de um contrato para análise automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arraste e solte um arquivo aqui
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    ou clique para selecionar um arquivo
                  </p>
                  <Button>
                    Selecionar Arquivo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Análises */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Histórico de Análises</CardTitle>
                <CardDescription>
                  Últimas análises realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma análise realizada ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(analysis.status)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {analysis.arquivo_nome}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(analysis.status)}>
                            {analysis.status}
                          </Badge>
                          {analysis.total_erros && analysis.total_erros > 0 && (
                            <Badge variant="destructive">
                              {analysis.total_erros} erros
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modelos de Contrato */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Modelos de Contrato</CardTitle>
                <CardDescription>
                  Templates disponíveis para análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractModels.map((model) => {
                    const camposObrigatorios = getCamposObrigatorios(model.campos_obrigatorios);
                    return (
                      <div key={model.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">
                            {model.nome}
                          </h3>
                          <Badge variant={model.template_ativo ? "default" : "secondary"}>
                            {model.template_ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {camposObrigatorios.length} campos obrigatórios
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {camposObrigatorios.slice(0, 3).map((campo, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {campo}
                            </Badge>
                          ))}
                          {camposObrigatorios.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{camposObrigatorios.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
