// Funções utilitárias para integração com o frontend
// Este arquivo pode ser copiado para o projeto frontend

interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointRadius?: number;
    fill?: boolean;
  }[];
}

interface RadialBarChartData {
  score: number;
  maxScore: number;
  category: {
    label: string;
    color: string;
  };
}

interface BarChartData {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  layout?: 'vertical' | 'horizontal';
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface PdfOptions {
  title?: string;
  author?: string;
  subject?: string;
  fileName?: string;
  pageSize?: 'A4' | 'A3' | 'LETTER';
  pageOrientation?: 'portrait' | 'landscape';
}

/**
 * Converte dados do RadarChart (Recharts) para o formato do microserviço
 */
export function convertRadarChartData(
  valueResults: any[],
  title?: string
): RadarChartData {
  const labels = valueResults.map(result => result.name);
  const data = valueResults.map(result => {
    // Converter de escala 5 para escala 10 (como no frontend)
    return (result.score / 5) * 10;
  });

  return {
    labels,
    datasets: [{
      label: 'Desempenho',
      data,
      backgroundColor: 'rgba(59, 130, 246, 0.4)', // #3b82f6 com opacidade
      borderColor: '#2563eb',
      borderWidth: 2,
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointRadius: 3,
      fill: true
    }]
  };
}

/**
 * Converte dados do OverallResultGauge para o formato do microserviço
 */
export function convertGaugeData(
  score: number,
  performanceCategory: any,
  title?: string
): RadialBarChartData {
  // Converter de escala 5 para escala 10
  const score10 = (score / 5) * 10;
  
  return {
    score: score10,
    maxScore: 10,
    category: {
      label: performanceCategory.label,
      color: performanceCategory.color
    }
  };
}

/**
 * Converte dados para gráfico de barras
 */
export function convertBarChartData(
  valueResults: any[],
  layout: 'vertical' | 'horizontal' = 'horizontal',
  title?: string
): BarChartData {
  const data = valueResults.map(result => ({
    name: result.name,
    value: (result.score / 5) * 10, // Converter para escala 10
    color: getValueColor(result.name) // Função para obter cor baseada no valor
  }));

  return {
    data,
    layout,
    xAxisLabel: layout === 'horizontal' ? 'Pontuação' : 'Valores',
    yAxisLabel: layout === 'horizontal' ? 'Valores' : 'Pontuação'
  };
}

/**
 * Função para obter cores baseadas no nome do valor
 */
function getValueColor(valueName: string): string {
  const colorMap: { [key: string]: string } = {
    'Inovação': '#3b82f6',
    'Colaboração': '#10b981',
    'Excelência': '#f59e0b',
    'Integridade': '#ef4444',
    'Sustentabilidade': '#8b5cf6',
    'Liderança': '#06b6d4',
    'Responsabilidade': '#84cc16',
    'Transparência': '#f97316'
  };
  
  return colorMap[valueName] || '#6b7280'; // Cor padrão se não encontrar
}

/**
 * Função principal para exportar gráfico radar para PDF
 */
export async function exportRadarChartToPdf(
  valueResults: any[],
  pdfOptions: PdfOptions = {},
  microserviceUrl: string = 'http://localhost:3000'
): Promise<void> {
  const chartData = convertRadarChartData(valueResults, pdfOptions.title);
  
  const requestData = {
    chartType: 'radar',
    chartData: {
      ...chartData,
      title: pdfOptions.title || 'Desempenho por Valor',
      width: 600,
      height: 400
    },
    pdfOptions: {
      ...pdfOptions,
      fileName: pdfOptions.fileName || 'avaliacao-radar.pdf'
    }
  };

  await downloadPdf(requestData, microserviceUrl);
}

/**
 * Função principal para exportar gráfico gauge para PDF
 */
export async function exportGaugeToPdf(
  score: number,
  performanceCategory: any,
  pdfOptions: PdfOptions = {},
  microserviceUrl: string = 'http://localhost:3000'
): Promise<void> {
  const chartData = convertGaugeData(score, performanceCategory, pdfOptions.title);
  
  const requestData = {
    chartType: 'radialBar',
    chartData: {
      ...chartData,
      title: pdfOptions.title || 'Resultado Geral da Avaliação',
      width: 400,
      height: 400
    },
    pdfOptions: {
      ...pdfOptions,
      fileName: pdfOptions.fileName || 'avaliacao-gauge.pdf'
    }
  };

  await downloadPdf(requestData, microserviceUrl);
}

/**
 * Função principal para exportar gráfico de barras para PDF
 */
export async function exportBarChartToPdf(
  valueResults: any[],
  layout: 'vertical' | 'horizontal' = 'horizontal',
  pdfOptions: PdfOptions = {},
  microserviceUrl: string = 'http://localhost:3000'
): Promise<void> {
  const chartData = convertBarChartData(valueResults, layout, pdfOptions.title);
  
  const requestData = {
    chartType: 'bar',
    chartData: {
      ...chartData,
      title: pdfOptions.title || 'Desempenho por Valor - Gráfico de Barras',
      width: 600,
      height: 400
    },
    pdfOptions: {
      ...pdfOptions,
      fileName: pdfOptions.fileName || 'avaliacao-barras.pdf'
    }
  };

  await downloadPdf(requestData, microserviceUrl);
}

/**
 * Função utilitária para fazer download do PDF
 */
async function downloadPdf(requestData: any, microserviceUrl: string): Promise<void> {
  try {
    const response = await fetch(`${microserviceUrl}/api/chart-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = requestData.pdfOptions.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  }
}

// Exemplo de uso no componente AnalyticsTab:
/*
import { exportRadarChartToPdf, exportGaugeToPdf, exportBarChartToPdf } from './pdf-export-utils';

// No componente AnalyticsTab
const handleExportRadarChart = async () => {
  await exportRadarChartToPdf(valueResults, {
    title: 'Relatório de Avaliação - Gráfico Radar',
    fileName: 'avaliacao-radar.pdf'
  });
};

const handleExportGauge = async () => {
  await exportGaugeToPdf(overallScore, performanceCategory, {
    title: 'Relatório de Avaliação - Resultado Geral',
    fileName: 'avaliacao-gauge.pdf'
  });
};

const handleExportBarChart = async () => {
  await exportBarChartToPdf(valueResults, 'horizontal', {
    title: 'Relatório de Avaliação - Gráfico de Barras',
    fileName: 'avaliacao-barras.pdf'
  });
};
*/ 