
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar o worker do PDF.js de forma mais robusta
const setupPdfWorker = () => {
  try {
    // Tentar primeira opção: worker local via importação
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    }
  } catch (error) {
    console.log('Tentando configuração alternativa do PDF.js worker...');
    // Fallback para CDN com versão específica
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
};

// Inicializar worker
setupPdfWorker();

export interface ExtractedField {
  type: string;
  value: string;
  confidence: number;
  position?: { x: number; y: number; width: number; height: number };
}

export interface PageData {
  pageNumber: number;
  rawText: string;
  extractedFields: ExtractedField[];
}

export class OCRService {
  private static instance: OCRService;

  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async convertPdfToImages(file: File): Promise<string[]> {
    console.log('Iniciando conversão PDF para imagens...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: false
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF carregado com sucesso. Páginas:', pdf.numPages);
      
      const images: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processando página ${pageNum}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          await page.render(renderContext).promise;
          const imageDataUrl = canvas.toDataURL('image/png');
          images.push(imageDataUrl);
          console.log(`Página ${pageNum} convertida para imagem`);
        }
      }

      console.log(`Conversão concluída. ${images.length} imagens geradas`);
      return images;
      
    } catch (error) {
      console.error('Erro na conversão PDF:', error);
      throw new Error(`Falha na conversão do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async extractTextFromImage(imageDataUrl: string): Promise<string> {
    console.log('Iniciando OCR com Tesseract...');
    
    try {
      const result = await Tesseract.recognize(imageDataUrl, 'por', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      
      console.log('OCR concluído. Texto extraído:', result.data.text.length, 'caracteres');
      return result.data.text;
      
    } catch (error) {
      console.error('Erro no OCR:', error);
      throw new Error(`Falha na extração de texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  extractStructuredFields(text: string): ExtractedField[] {
    console.log('Extraindo campos estruturados do texto...');
    const fields: ExtractedField[] = [];

    // Regex patterns para diferentes tipos de campos
    const patterns = {
      cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
      cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      telefone: /\b(?:\(\d{2}\)\s?)?\d{4,5}-?\d{4}\b/g,
      valor: /R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g,
      data: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      cep: /\b\d{5}-?\d{3}\b/g
    };

    // Extrair cada tipo de campo
    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          fields.push({
            type,
            value: match.trim(),
            confidence: 0.8
          });
        });
      }
    });

    // Extrair nomes (heurística simples)
    const namePattern = /^[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ][a-záéíóúâêîôûàèìòùãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ][a-záéíóúâêîôûàèìòùãõç]+)+/gm;
    const nameMatches = text.match(namePattern);
    if (nameMatches) {
      nameMatches.forEach(name => {
        if (name.length > 10 && name.length < 60) {
          fields.push({
            type: 'nome',
            value: name.trim(),
            confidence: 0.6
          });
        }
      });
    }

    console.log(`Campos extraídos: ${fields.length}`);
    return fields;
  }

  async processDocument(file: File, onProgress: (progress: number) => void): Promise<PageData[]> {
    console.log('=== INICIANDO PROCESSAMENTO OCR ===');
    console.log('Arquivo:', file.name, 'Tamanho:', file.size, 'bytes');
    
    try {
      onProgress(5);
      
      // Converter PDF em imagens
      console.log('Etapa 1: Convertendo PDF para imagens...');
      const images = await this.convertPdfToImages(file);
      onProgress(25);

      const pages: PageData[] = [];
      const progressStep = 60 / images.length;

      // Processar cada página
      for (let i = 0; i < images.length; i++) {
        console.log(`=== PROCESSANDO PÁGINA ${i + 1}/${images.length} ===`);
        
        try {
          // Extrair texto da imagem
          const rawText = await this.extractTextFromImage(images[i]);
          
          // Extrair campos estruturados
          const extractedFields = this.extractStructuredFields(rawText);
          
          pages.push({
            pageNumber: i + 1,
            rawText,
            extractedFields
          });

          // Atualizar progresso
          onProgress(25 + (i + 1) * progressStep);
          
        } catch (pageError) {
          console.error(`Erro ao processar página ${i + 1}:`, pageError);
          // Continuar com próxima página mesmo se uma falhar
          pages.push({
            pageNumber: i + 1,
            rawText: '',
            extractedFields: []
          });
        }
      }

      onProgress(100);
      console.log('=== PROCESSAMENTO OCR CONCLUÍDO ===');
      console.log(`Total de páginas processadas: ${pages.length}`);
      console.log(`Total de campos extraídos: ${pages.reduce((acc, p) => acc + p.extractedFields.length, 0)}`);
      
      return pages;
      
    } catch (error) {
      console.error('=== ERRO CRÍTICO NO PROCESSAMENTO OCR ===', error);
      throw error;
    }
  }
}

export const ocrService = OCRService.getInstance();
