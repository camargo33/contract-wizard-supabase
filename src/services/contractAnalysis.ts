
import { cpf, cnpj } from 'cpf-cnpj-validator';

export interface AnalysisError {
  id: string;
  type: 'critico' | 'alto' | 'medio' | 'baixo';
  campo: string;
  valor_encontrado?: string;
  valor_esperado?: string;
  sugestao: string;
  confianca: number;
}

export interface ExtractedField {
  type: string;
  value: string;
  confidence: number;
}

export class ContractAnalysisService {
  private static errors: AnalysisError[] = [];

  static analyzeContract(text: string, extractedFields: ExtractedField[], modeloType: string): AnalysisError[] {
    this.errors = [];
    
    console.log('Iniciando análise do contrato:', { modeloType, fieldsCount: extractedFields.length });

    // Validar campos obrigatórios baseado no modelo
    this.validateRequiredFields(extractedFields, modeloType);

    // Validar formatos dos campos extraídos
    this.validateFieldFormats(extractedFields);

    // Validar consistência entre campos
    this.validateFieldConsistency(extractedFields);

    // Análise do texto completo
    this.analyzeFullText(text);

    console.log('Análise concluída:', { errorsFound: this.errors.length });
    return this.errors;
  }

  private static validateRequiredFields(fields: ExtractedField[], modeloType: string) {
    const requiredFields = this.getRequiredFieldsByModel(modeloType);
    const fieldTypes = fields.map(f => f.type);

    requiredFields.forEach(required => {
      if (!fieldTypes.includes(required)) {
        this.addError({
          id: crypto.randomUUID(),
          type: 'critico',
          campo: required,
          valor_esperado: `Campo ${required} obrigatório`,
          sugestao: `Verificar se o campo ${required} está presente no documento`,
          confianca: 95
        });
      }
    });
  }

  private static getRequiredFieldsByModel(modeloType: string): string[] {
    // Configuração de campos obrigatórios por tipo de modelo
    const requiredFieldsMap: { [key: string]: string[] } = {
      'prestacao_servicos': ['cpf', 'cnpj', 'email', 'valor'],
      'locacao': ['cpf', 'valor', 'data'],
      'compra_venda': ['cpf', 'cnpj', 'valor'],
      'default': ['cpf', 'email']
    };

    return requiredFieldsMap[modeloType] || requiredFieldsMap['default'];
  }

  private static validateFieldFormats(fields: ExtractedField[]) {
    fields.forEach(field => {
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
        case 'valor':
          this.validateValue(field);
          break;
      }
    });
  }

  private static validateCPF(field: ExtractedField) {
    const cleanCPF = field.value.replace(/\D/g, '');
    if (!cpf.isValid(cleanCPF)) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'critico',
        campo: 'CPF',
        valor_encontrado: field.value,
        valor_esperado: 'CPF válido (xxx.xxx.xxx-xx)',
        sugestao: 'Verificar se todos os dígitos do CPF estão corretos',
        confianca: 90
      });
    }
  }

  private static validateCNPJ(field: ExtractedField) {
    const cleanCNPJ = field.value.replace(/\D/g, '');
    if (!cnpj.isValid(cleanCNPJ)) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'critico',
        campo: 'CNPJ',
        valor_encontrado: field.value,
        valor_esperado: 'CNPJ válido (xx.xxx.xxx/xxxx-xx)',
        sugestao: 'Verificar se todos os dígitos do CNPJ estão corretos',
        confianca: 90
      });
    }
  }

  private static validateEmail(field: ExtractedField) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'alto',
        campo: 'Email',
        valor_encontrado: field.value,
        valor_esperado: 'Email válido (exemplo@dominio.com)',
        sugestao: 'Verificar se o email possui @ e domínio válido',
        confianca: 85
      });
    }
  }

  private static validatePhone(field: ExtractedField) {
    const phoneRegex = /^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    const cleanPhone = field.value.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'medio',
        campo: 'Telefone',
        valor_encontrado: field.value,
        valor_esperado: 'Telefone brasileiro ((xx) xxxxx-xxxx)',
        sugestao: 'Verificar se o telefone possui DDD e número completo',
        confianca: 80
      });
    }
  }

  private static validateCEP(field: ExtractedField) {
    const cepRegex = /^\d{5}-?\d{3}$/;
    if (!cepRegex.test(field.value)) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'baixo',
        campo: 'CEP',
        valor_encontrado: field.value,
        valor_esperado: 'CEP válido (xxxxx-xxx)',
        sugestao: 'Verificar se o CEP possui 8 dígitos',
        confianca: 75
      });
    }
  }

  private static validateValue(field: ExtractedField) {
    const valueRegex = /R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?/;
    if (!valueRegex.test(field.value)) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'medio',
        campo: 'Valor',
        valor_encontrado: field.value,
        valor_esperado: 'Valor monetário válido (R$ 1.000,00)',
        sugestao: 'Verificar formato da moeda',
        confianca: 80
      });
    }
  }

  private static validateFieldConsistency(fields: ExtractedField[]) {
    const fieldMap = new Map(fields.map(f => [f.type, f.value]));
    
    // Validar se tem CPF e CNPJ ao mesmo tempo (inconsistente)
    if (fieldMap.has('cpf') && fieldMap.has('cnpj')) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'alto',
        campo: 'Consistência',
        valor_encontrado: 'CPF e CNPJ presentes',
        valor_esperado: 'Apenas CPF ou CNPJ',
        sugestao: 'Verificar se o contrato é para pessoa física ou jurídica',
        confianca: 90
      });
    }

    // Validar datas
    const dates = fields.filter(f => f.type === 'data');
    if (dates.length > 1) {
      this.validateDateConsistency(dates);
    }
  }

  private static validateDateConsistency(dates: ExtractedField[]) {
    // Verificar se as datas fazem sentido cronologicamente
    const parsedDates = dates.map(d => {
      const parts = d.value.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    });

    // Verificar se alguma data é muito antiga ou muito futura
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());

    parsedDates.forEach((date, index) => {
      if (date < oneYearAgo || date > twoYearsFromNow) {
        this.addError({
          id: crypto.randomUUID(),
          type: 'medio',
          campo: 'Data',
          valor_encontrado: dates[index].value,
          valor_esperado: 'Data dentro do período válido',
          sugestao: 'Verificar se a data está correta',
          confianca: 75
        });
      }
    });
  }

  private static analyzeFullText(text: string) {
    // Análise de palavras-chave importantes
    const keywords = ['assinatura', 'testemunha', 'clausula', 'termo', 'acordo'];
    const missingKeywords = keywords.filter(keyword => 
      !text.toLowerCase().includes(keyword)
    );

    if (missingKeywords.length > 2) {
      this.addError({
        id: crypto.randomUUID(),
        type: 'medio',
        campo: 'Estrutura do Contrato',
        valor_encontrado: `Faltam ${missingKeywords.length} elementos`,
        valor_esperado: 'Estrutura completa de contrato',
        sugestao: `Verificar se o documento possui: ${missingKeywords.join(', ')}`,
        confianca: 70
      });
    }
  }

  private static addError(error: AnalysisError) {
    this.errors.push(error);
  }
}
