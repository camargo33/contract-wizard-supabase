
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Settings } from 'lucide-react';
import ContractModelsList from '@/components/ContractModelsList';

const Configuracoes = () => {
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema e modelos de contrato</p>
      </div>

      <div className="p-6 bg-white">
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="models" className="flex items-center space-x-2 text-gray-700 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <FileText className="h-4 w-4" />
              <span>Modelos de Contrato</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center space-x-2 text-gray-700 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <Settings className="h-4 w-4" />
              <span>Configurações Gerais</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models">
            <ContractModelsList />
          </TabsContent>

          <TabsContent value="general">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-gray-800">Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <p className="text-gray-600">Configurações gerais em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configuracoes;
