import { Request, Response } from 'express';
import { PdfService } from '../services/pdf.service';
import { ChartRequest } from '../interfaces/chart.interface';
import { ChartService } from '../services/chart.service';

export class ChartController {
  private pdfService: PdfService;
  private chartService: ChartService;

  constructor() {
    this.pdfService = new PdfService();
    this.chartService = new ChartService();
  }

  /**
   * Gera um arquivo PDF com gráfico (genérico para todos os tipos)
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public async generateChartPdf(req: Request, res: Response): Promise<void> {
    try {
      const { chartData, chartType, pdfOptions } = req.body as ChartRequest;
      
      // Validar se o tipo de gráfico foi fornecido
      if (!chartType || !['radar', 'radialBar', 'bar', 'pie'].includes(chartType)) {
        res.status(400).json({ 
          success: false, 
          message: 'Tipo de gráfico inválido. Use: radar, radialBar, bar ou pie.' 
        });
        return;
      }
      
      // Validar se os dados do gráfico foram fornecidos
      if (!chartData) {
        res.status(400).json({ 
          success: false, 
          message: 'Dados do gráfico não fornecidos.' 
        });
        return;
      }
      
      // Validações específicas por tipo de gráfico
      if (chartType === 'radar') {
        const radarData = chartData as any;
        if (!radarData.labels || !radarData.datasets || radarData.datasets.length === 0) {
          res.status(400).json({ 
            success: false, 
            message: 'Dados do gráfico radar inválidos. Verifique se você forneceu labels e datasets.' 
          });
          return;
        }
        
        const invalidDataset = radarData.datasets.some((ds: any) => !ds.data || ds.data.length === 0);
        if (invalidDataset) {
          res.status(400).json({ 
            success: false, 
            message: 'Todos os datasets devem conter dados válidos.' 
          });
          return;
        }
      } else if (chartType === 'radialBar') {
        const radialData = chartData as any;
        if (typeof radialData.score !== 'number' || typeof radialData.maxScore !== 'number' || !radialData.category) {
          res.status(400).json({ 
            success: false, 
            message: 'Dados do gráfico radial inválidos. Verifique score, maxScore e category.' 
          });
          return;
        }
      } else if (chartType === 'bar' || chartType === 'pie') {
        const chartDataTyped = chartData as any;
        if (!chartDataTyped.data || !Array.isArray(chartDataTyped.data) || chartDataTyped.data.length === 0) {
          res.status(400).json({ 
            success: false, 
            message: 'Dados do gráfico inválidos. Verifique se você forneceu um array de dados.' 
          });
          return;
        }
      }
      
      // Gerar o PDF
      const pdfStream = await this.pdfService.generatePdf(chartData, chartType, pdfOptions);
      
      // Configurar headers para download do PDF
      const fileName = pdfOptions?.fileName || `${chartType}-chart.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Enviar o PDF como resposta
      pdfStream.pipe(res);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
      // Verificar se a resposta já foi enviada
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar o PDF',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  }

  /**
   * Gera um arquivo PDF com gráfico radar (mantido para compatibilidade)
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public async generateRadarChartPdf(req: Request, res: Response): Promise<void> {
    try {
      const { chartData, pdfOptions } = req.body;
      
      // Validar se os dados do gráfico foram fornecidos
      if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Dados do gráfico inválidos. Verifique se você forneceu labels e datasets.' 
        });
        return;
      }
      
      // Validar se os datasets têm dados
      const invalidDataset = chartData.datasets.some((ds: any) => !ds.data || ds.data.length === 0);
      if (invalidDataset) {
        res.status(400).json({ 
          success: false, 
          message: 'Todos os datasets devem conter dados válidos.' 
        });
        return;
      }
      
      // Gerar o PDF usando o método genérico
      const pdfStream = await this.pdfService.generatePdf(chartData, 'radar', pdfOptions);
      
      // Configurar headers para download do PDF
      const fileName = pdfOptions?.fileName || 'radar-chart.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      // Enviar o PDF como resposta
      pdfStream.pipe(res);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      
      // Verificar se a resposta já foi enviada
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao gerar o PDF',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
  }

  async generateChartImage(req: Request, res: Response): Promise<void> {
    try {
      const { chartType, chartData } = req.body;

      // Validações básicas
      if (!chartType || !chartData) {
        res.status(400).json({ 
          error: 'chartType e chartData são obrigatórios' 
        });
        return;
      }

      // Validar tipos suportados
      const supportedTypes = ['radar', 'radialBar', 'bar', 'pie'];
      if (!supportedTypes.includes(chartType)) {
        res.status(400).json({ 
          error: `Tipo de gráfico não suportado. Tipos suportados: ${supportedTypes.join(', ')}` 
        });
        return;
      }

      // Gerar a imagem do gráfico
      const imageBuffer = await this.chartService.generateChartImage(chartType, chartData);

      // Retornar a imagem
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'no-cache'
      });

      res.send(imageBuffer);

    } catch (error) {
      console.error('❌ Erro ao gerar imagem do gráfico:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor ao gerar imagem',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 