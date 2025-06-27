
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/hooks/useSupabase';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type ContractModel = Database['public']['Tables']['contratos_modelo']['Row'];

interface ContractModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const ContractModelSelector = ({ value, onChange, required = true }: ContractModelSelectorProps) => {
  const [models, setModels] = useState<ContractModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { getContractModels } = useSupabase();
  const { toast } = useToast();

  // Log para debug do seletor
  console.log('ContractModelSelector: Estado atual', {
    value,
    modelsCount: models.length,
    loading
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('ContractModelSelector: Carregando modelos...');
        setLoading(true);
        const data = await getContractModels();
        console.log('ContractModelSelector: Modelos carregados', data);
        setModels(data || []);
      } catch (error: any) {
        console.error('ContractModelSelector: Erro ao carregar modelos:', error);
        toast({
          title: "Erro ao carregar modelos",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const handleValueChange = (newValue: string) => {
    console.log('ContractModelSelector: Modelo selecionado', {
      oldValue: value,
      newValue,
      modelExists: models.find(m => m.id === newValue)?.nome
    });
    onChange(newValue);
  };

  // Recarregar modelos quando o componente recebe foco
  useEffect(() => {
    const handleFocus = () => {
      const loadModels = async () => {
        try {
          const data = await getContractModels();
          setModels(data || []);
        } catch (error) {
          console.error('Erro ao recarregar modelos:', error);
        }
      };
      loadModels();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="contract-model" className="text-gray-900">
        Modelo de Contrato {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={handleValueChange} disabled={loading}>
        <SelectTrigger id="contract-model" className="bg-white border-gray-200 text-gray-900">
          <SelectValue 
            placeholder={loading ? "Carregando modelos..." : "Selecione um modelo"} 
          />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 z-50">
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id} className="text-gray-900 hover:bg-gray-50">
              {model.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {models.length === 0 && !loading && (
        <p className="text-sm text-amber-600">
          Nenhum modelo ativo encontrado. Configure modelos na página de Configurações.
        </p>
      )}
      
      {/* Debug info para o seletor */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
          Debug Seletor: valor="{value}" | modelos={models.length} | carregando={loading ? 'sim' : 'não'}
        </div>
      )}
    </div>
  );
};

export default ContractModelSelector;
