
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, Mail, Phone, MapPin, DollarSign, Calendar, Hash, CheckCircle } from 'lucide-react';

interface ExtractedField {
  type: string;
  value: string;
  confidence: number;
}

interface PageData {
  pageNumber: number;
  rawText: string;
  extractedFields: ExtractedField[];
}

interface ExtractedFieldsDisplayProps {
  pages: PageData[];
  onProceedToValidation: () => void;
  isLoading?: boolean;
}

const ExtractedFieldsDisplay = ({ pages, onProceedToValidation, isLoading = false }: ExtractedFieldsDisplayProps) => {
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'nome': return <User className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'telefone': return <Phone className="h-4 w-4" />;
      case 'cep': return <MapPin className="h-4 w-4" />;
      case 'valor': return <DollarSign className="h-4 w-4" />;
      case 'data': return <Calendar className="h-4 w-4" />;
      case 'cpf':
      case 'cnpj': return <Hash className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFieldColor = (type: string) => {
    switch (type) {
      case 'nome': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'email': return 'bg-green-100 text-green-800 border-green-300';
      case 'telefone': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cpf':
      case 'cnpj': return 'bg-red-100 text-red-800 border-red-300';
      case 'valor': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'data': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'cep': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getFieldLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      nome: 'Nome',
      email: 'E-mail',
      telefone: 'Telefone',
      cpf: 'CPF',
      cnpj: 'CNPJ',
      valor: 'Valor',
      data: 'Data',
      cep: 'CEP'
    };
    return labels[type] || type.toUpperCase();
  };

  // Agrupar todos os campos por tipo
  const allFields = pages.flatMap(page => page.extractedFields);
  const fieldsByType = allFields.reduce((acc, field) => {
    if (!acc[field.type]) acc[field.type] = [];
    acc[field.type].push(field);
    return acc;
  }, {} as { [key: string]: ExtractedField[] });

  const totalFields = allFields.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Extração de Dados Concluída</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
              <div className="text-sm text-gray-600">Páginas Processadas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalFields}</div>
              <div className="text-sm text-gray-600">Campos Identificados</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{Object.keys(fieldsByType).length}</div>
              <div className="text-sm text-gray-600">Tipos de Dados</div>
            </div>
          </div>

          <Tabs defaultValue="fields" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fields">Campos Identificados</TabsTrigger>
              <TabsTrigger value="text">Texto Extraído</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fields" className="space-y-4">
              {Object.entries(fieldsByType).map(([type, fields]) => (
                <Card key={type}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      {getFieldIcon(type)}
                      <span>{getFieldLabel(type)} ({fields.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {fields.map((field, index) => (
                        <Badge
                          key={index}
                          className={`${getFieldColor(type)} border px-3 py-1`}
                          variant="outline"
                        >
                          {field.value}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              {pages.map((page) => (
                <Card key={page.pageNumber}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Página {page.pageNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40 w-full rounded border p-4">
                      <pre className="text-xs whitespace-pre-wrap">
                        {page.rawText || 'Nenhum texto extraído desta página'}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button 
              onClick={onProceedToValidation}
              disabled={isLoading || totalFields === 0}
              className="min-w-[200px]"
            >
              Prosseguir para Validação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractedFieldsDisplay;
