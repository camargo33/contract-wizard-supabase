
import { cpf, cnpj } from 'cpf-cnpj-validator';

export interface ValidationError {
  id: string;
  tipo_erro: 'campo_obrigatorio' | 'formato_invalido' | 'inconsistencia' | 'valor_incorreto';
  campo_afetado: string;
  valor_encontrado?: string;
  valor_esperado?: string;
  sugestao_correcao?: string;
  severidade: 'critica' | 'alta' | 'media' | 'baixa';
  confianca: number;
}

export interface ExtractedField {
  type: string;
  value: string;
  confidence: number;
}

export interface ContractModel {
  id: string;
  nome: string;
  campos_obrigatorios: string[];
  regras_validacao: any;
}

export class ValidationEngine {
  private errors: ValidationError[] = [];

  validateExtractedData(
    extractedFields: ExtractedField[], 
    contractModel: ContractModel
  ): ValidationError[] {
    this.errors = [];

    // Validar campos obrigatórios
    this.validateRequiredFields(extractedFields, contractModel.campos_obrigatorios);

    // Validar formatos
    this.validateFormats(extractedFields);

    // Validar consistência
    this.validateConsistency(extractedFields);

    return this.errors;
  }

  private validateRequiredFields(fields: ExtractedField[], requiredFields: string[]) {
    const fieldTypes = fields.map(f => f.type);
    
    for (const required of requiredFields) {
      if (!fieldTypes.includes(required)) {
        this.addError({
          id: crypto.randomUUID(),
          tipo_erro: 'campo_obrigatorio',
          campo_afetado: required,
          valor_encontrado: undefined,
          valor_esperado: `Campo ${required} obrigatório`,
          sugestao_correcao: `Verifique se o campo ${required} está presente no documento`,
          severidade: 'critica',
          confianca: 95
        });
      }
    }
  }

  private validateFormats(fields: ExtractedField[]) {
    for (const field of fields) {
      switch (field.type) {
        case 'cpf':
          this.validateCPF(field);
          break;
        case 'cnpj':
          this.validateCNPJ(field);
          break;
        case 'email':
          this.validateEmail(field);
          break;
        case 'telefone':
          this.validatePhone(field);
          break;
        case 'cep':
          this.validateCEP(field);
          break;
      }
    }
  }

  private validateCPF(field: ExtractedField) {
    const cleanCPF = field.value.replace(/\D/g, '');
    if (!cpf.isValid(cleanCPF)) {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'formato_invalido',
        campo_afetado: 'cpf',
        valor_encontrado: field.value,
        valor_esperado: 'CPF válido (xxx.xxx.xxx-xx)',
        sugestao_correcao: 'Verifique se todos os dígitos do CPF estão corretos',
        severidade: 'alta',
        confianca: 90
      });
    }
  }

  private validateCNPJ(field: ExtractedField) {
    const cleanCNPJ = field.value.replace(/\D/g, '');
    if (!cnpj.isValid(cleanCNPJ)) {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'formato_invalido',
        campo_afetado: 'cnpj',
        valor_encontrado: field.value,
        valor_esperado: 'CNPJ válido (xx.xxx.xxx/xxxx-xx)',
        sugestao_correcao: 'Verifique se todos os dígitos do CNPJ estão corretos',
        severidade: 'alta',
        confianca: 90
      });
    }
  }

  private validateEmail(field: ExtractedField) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'formato_invalido',
        campo_afetado: 'email',
        valor_encontrado: field.value,
        valor_esperado: 'Email válido (exemplo@dominio.com)',
        sugestao_correcao: 'Verifique se o email possui @ e domínio válido',
        severidade: 'media',
        confianca: 85
      });
    }
  }

  private validatePhone(field: ExtractedField) {
    const phoneRegex = /^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    const cleanPhone = field.value.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'formato_invalido',
        campo_afetado: 'telefone',
        valor_encontrado: field.value,
        valor_esperado: 'Telefone brasileiro ((xx) xxxxx-xxxx)',
        sugestao_correcao: 'Verifique se o telefone possui DDD e número completo',
        severidade: 'media',
        confianca: 80
      });
    }
  }

  private validateCEP(field: ExtractedField) {
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(field.value)) {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'formato_invalido',
        campo_afetado: 'cep',
        valor_encontrado: field.value,
        valor_esperado: 'CEP válido (xxxxx-xxx)',
        sugestao_correcao: 'Verifique se o CEP possui 8 dígitos',
        severidade: 'baixa',
        confianca: 75
      });
    }
  }

  private validateConsistency(fields: ExtractedField[]) {
    const fieldMap = new Map(fields.map(f => [f.type, f.value]));
    
    // Validar fidelidade baseada no tipo de pessoa
    const hasCPF = fieldMap.has('cpf');
    const hasCNPJ = fieldMap.has('cnpj');
    const fidelidade = fieldMap.get('fidelidade');

    if (hasCPF && fidelidade && fidelidade !== '12') {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'inconsistencia',
        campo_afetado: 'fidelidade',
        valor_encontrado: fidelidade,
        valor_esperado: '12 meses para pessoa física',
        sugestao_correcao: 'Pessoa física deve ter fidelidade de 12 meses',
        severidade: 'alta',
        confianca: 85
      });
    }

    if (hasCNPJ && fidelidade && fidelidade !== '24') {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'inconsistencia',
        campo_afetado: 'fidelidade',
        valor_encontrado: fidelidade,
        valor_esperado: '24 meses para pessoa jurídica',
        sugestao_correcao: 'Pessoa jurídica deve ter fidelidade de 24 meses',
        severidade: 'alta',
        confianca: 85
      });
    }

    // Validar valores do plano
    const valor = fieldMap.get('valor');
    const plano = fieldMap.get('plano');
    if (valor && plano) {
      this.validatePlanPricing(plano, valor);
    }
  }

  private validatePlanPricing(plano: string, valor: string) {
    // Tabela de preços padrão (pode ser configurável)
    const tabelaPrecos: { [key: string]: number } = {
      'basico': 49.90,
      'intermediario': 79.90,
      'premium': 129.90,
      'empresarial': 199.90
    };

    const valorEncontrado = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    const valorEsperado = tabelaPrecos[plano.toLowerCase()];

    if (valorEsperado && Math.abs(valorEncontrado - valorEsperado) > 0.01) {
      this.addError({
        id: crypto.randomUUID(),
        tipo_erro: 'valor_incorreto',
        campo_afetado: 'valor',
        valor_encontrado: valor,
        valor_esperado: `R$ ${valorEsperado.toFixed(2)}`,
        sugestao_correcao: `Valor do plano ${plano} deve ser R$ ${valorEsperado.toFixed(2)}`,
        severidade: 'alta',
        confianca: 90
      });
    }
  }

  private addError(error: ValidationError) {
    this.errors.push(error);
  }
}
