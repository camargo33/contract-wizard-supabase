
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL('image/png'));
      }
    }

    return images;
  }

  async extractTextFromImage(imageDataUrl: string): Promise<string> {
    const result = await Tesseract.recognize(imageDataUrl, 'por', {
      logger: (m) => console.log(m)
    });
    return result.data.text;
  }

  extractStructuredFields(text: string): ExtractedField[] {
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
            confidence: 0.8 // Placeholder - em um cenário real, seria calculado
          });
        });
      }
    });

    // Extrair nomes (heurística simples)
    const namePattern = /^[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ][a-záéíóúâêîôûàèìòùãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ][a-záéíóúâêîôûàèìòùãõç]+)+/gm;
    const nameMatches = text.match(namePattern);
    if (nameMatches) {
      nameMatches.forEach(name => {
        if (name.length > 10 && name.length < 60) { // Filtrar nomes válidos
          fields.push({
            type: 'nome',
            value: name.trim(),
            confidence: 0.6
          });
        }
      });
    }

    return fields;
  }

  async processDocument(file: File, onProgress: (progress: number) => void): Promise<PageData[]> {
    console.log('Iniciando processamento OCR do documento:', file.name);
    
    // Converter PDF em imagens (20% do progresso)
    onProgress(10);
    const images = await this.convertPdfToImages(file);
    onProgress(20);

    const pages: PageData[] = [];
    const progressStep = 60 / images.length; // 60% para OCR de todas as páginas

    // Processar cada página
    for (let i = 0; i < images.length; i++) {
      console.log(`Processando página ${i + 1} de ${images.length}`);
      
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
      onProgress(20 + (i + 1) * progressStep);
    }

    onProgress(100);
    console.log('Processamento OCR concluído');
    return pages;
  }
}

export const ocrService = OCRService.getInstance();
