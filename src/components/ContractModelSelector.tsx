
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

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const data = await getContractModels();
        console.log('Modelos carregados:', data); // Debug
        setModels(data || []);
      } catch (error: any) {
        console.error('Erro ao carregar modelos:', error); // Debug
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
      <Select value={value} onValueChange={onChange} disabled={loading}>
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
    </div>
  );
};

export default ContractModelSelector;
