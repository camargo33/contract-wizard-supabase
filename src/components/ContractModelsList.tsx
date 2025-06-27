
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Edit, Trash2, Download } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import ContractModelForm from './ContractModelForm';

type ContractModel = Database['public']['Tables']['contratos_modelo']['Row'];

const ContractModelsList = () => {
  const [models, setModels] = useState<ContractModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllContractModels, createContractModel } = useSupabase();
  const { toast } = useToast();

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await getAllContractModels();
      setModels(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar modelos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleCreateModel = async (modelData: any) => {
    try {
      await createContractModel(modelData);
      toast({
        title: "Modelo criado",
        description: `Modelo "${modelData.name}" foi criado com sucesso.`,
      });
      loadModels(); // Recarregar a lista
    } catch (error: any) {
      toast({
        title: "Erro ao criar modelo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
          <h2 className="text-2xl font-bold text-gray-900">Modelos de Contrato</h2>
          <p className="text-gray-600">Gerencie os modelos base para análise de contratos</p>
        </div>
        <ContractModelForm onSave={handleCreateModel} isLoading={false} />
      </div>

      {models.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum modelo cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro modelo de contrato
            </p>
            <ContractModelForm onSave={handleCreateModel} isLoading={false} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Modelos Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Modelo</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Campos Obrigatórios</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{model.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(model.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={model.template_ativo ? "default" : "secondary"}>
                        {model.template_ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {Array.isArray(model.campos_obrigatorios) 
                          ? model.campos_obrigatorios.length 
                          : 0} campos
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractModelsList;
