import OpenAI from 'openai';
import { DetectedError } from '@/types/upload';

interface GeminiError {
  severidade: 'critico' | 'alto' | 'medio' | 'baixo';
  campo: string;
  valor_encontrado: string;
  valor_esperado: string;
  sugestao_correcao: string;
  confianca: number;
}

interface GeminiResumo {
  total_erros: number;
  criticos: number;
  altos: number;
  medios: number;
  baixos: number;
}

export interface AnalysisResult {
  erros: GeminiError[];
  resumo: GeminiResumo;
  status_contrato: 'aprovado' | 'com_restricoes' | 'reprovado';
}

export class GeminiAnalysisService {
  private static readonly ANALYSIS_PROMPT = `
# PROMPT PARA ANÁLISE DE CONTRATOS CIABRASNET

## CONTEXTO
Você é um especialista em análise de contratos da CIABRASNET. Analise APENAS os campos destacados/grifados nos contratos, focando exclusivamente em inconsistências, erros de digitação e problemas de formatação dos campos importantes.

## CAMPOS ESPECÍFICOS PARA ANALISAR:

### 1. DADOS DO ASSINANTE:
- **Nome**: Verificar se está completo e sem erros de digitação
- **CPF/CNPJ**: Consistência com tipo de pessoa (PF=CPF, PJ=CNPJ)
- **Email**: Verificar erros de digitação (ex: letras duplicadas)
- **Endereço**: Completude dos dados
- **Telefone**: Formato (XX) XXXXX-XXXX

### 2. DADOS DO PLANO E VALORES:
- **Valor do plano**: Verificar se valor numérico está correto
- **Valor por extenso**: Consistência entre R$ 700,00 e valor escrito
- **Tipo de plano vs Fidelidade**: 
  - Residencial = 12 meses
  - Corporativo = 24 meses
- **Endereço eletrônico**: Deve incluir protocolo https://

### 3. VALIDAÇÕES CRÍTICAS:

**Erros de Digitação:**
- Email com letras duplicadas: "samaraa" → "samara"
- Valores escritos errados: "Quinhentos" vs "Setecentos"

**Inconsistências de Dados:**
- Plano corporativo com 12 meses (deve ser 24)
- Valor R$ 700,00 escrito como "Quinhentos reais" (deve ser "Setecentos")
- URL sem protocolo: "ciabrasnet.com.br" → "https://ciabrasnet.com.br"

Retorne APENAS um JSON válido no formato:
{
  "erros": [
    {
      "severidade": "critico|alto|medio|baixo",
      "campo": "nome_do_campo",
      "valor_encontrado": "valor atual",
      "valor_esperado": "valor correto",
      "sugestao_correcao": "como corrigir",
      "confianca": 95
    }
  ],
  "resumo": {
    "total_erros": 0,
    "criticos": 0,
    "altos": 0,
    "medios": 0,
    "baixos": 0
  },
  "status_contrato": "aprovado|com_restricoes|reprovado"
}
`;

  private static getOpenAIClient() {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_OPENROUTER_API_KEY não configurada. Configure a variável de ambiente para usar a análise com IA.');
    }

    return new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  static async analyzeContract(contractText: string, modelType: string): Promise<AnalysisResult> {
    try {
      const openai = this.getOpenAIClient();
      
      const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'system',
            content: this.ANALYSIS_PROMPT
          },
          {
            role: 'user',
            content: `Analise este contrato CIABRASNET do tipo "${modelType}":\n\n${contractText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      // Parse JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido');
      }

      const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
      return result;

    } catch (error) {
      console.error('Erro na análise:', error);
      if (error instanceof Error && error.message.includes('VITE_OPENROUTER_API_KEY')) {
        throw error; // Re-throw configuration errors
      }
      throw new Error('Falha na análise do contrato');
    }
  }
}
