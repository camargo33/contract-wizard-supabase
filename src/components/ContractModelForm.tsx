
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContractModelFormProps {
  onSave: (modelData: any) => void;
  isLoading: boolean;
}

const requiredFields = [
  { id: 'nome', label: 'Nome completo' },
  { id: 'cpf_cnpj', label: 'CPF/CNPJ' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'telefone', label: 'Telefone' },
  { id: 'email', label: 'Email' },
  { id: 'velocidade_plano', label: 'Velocidade do plano' },
  { id: 'valor_plano', label: 'Valor do plano' },
  { id: 'tipo_plano', label: 'Tipo do plano' },
  { id: 'fidelidade', label: 'Opção de fidelidade' },
  { id: 'taxas_adicionais', label: 'Taxas adicionais' },
  { id: 'assinatura_cliente', label: 'Assinatura do cliente' },
  { id: 'assinatura_empresa', label: 'Assinatura da empresa' },
];

const ContractModelForm = ({ onSave, isLoading }: ContractModelFormProps) => {
  const [open, setOpen] = useState(false);
  const [modelName, setModelName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos PDF são aceitos.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSubmit = () => {
    if (!modelName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do modelo.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo PDF modelo.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFields.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione pelo menos um campo obrigatório.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      name: modelName,
      file: selectedFile,
      requiredFields: selectedFields,
    });

    // Reset form
    setModelName('');
    setSelectedFile(null);
    setSelectedFields([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Novo Modelo</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Modelo de Contrato</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="modelName">Nome do Modelo</Label>
            <Input
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Ex: Contrato Pessoa Física"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Arquivo PDF Modelo</Label>
            <Card className="mt-1">
              <CardContent className="p-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Arraste um arquivo PDF ou clique para selecionar
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                        className="hidden"
                        id="file-input"
                      />
                      <label htmlFor="file-input">
                        <Button asChild variant="outline" size="sm">
                          <span>Selecionar Arquivo</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Label>Campos Obrigatórios</Label>
            <Card className="mt-1">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requiredFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <Label htmlFor={field.id} className="text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Modelo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractModelForm;
