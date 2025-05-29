// Exemplo de integração no componente AnalyticsTab
// Este arquivo mostra como adicionar botões de exportação para PDF

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart3, PieChart } from 'lucide-react';
import { 
  exportRadarChartToPdf, 
  exportGaugeToPdf, 
  exportBarChartToPdf 
} from './pdf-export-utils'; // Arquivo criado anteriormente

interface AnalyticsTabProps {
  currentRow: any;
  valueResults: any[];
  overallScore: number;
  performanceCategory: any;
  expandedValues: string[];
  setExpandedValues: React.Dispatch<React.SetStateAction<string[]>>;
}

export function AnalyticsTab({
  valueResults,
  overallScore,
  performanceCategory,
  expandedValues,
  setExpandedValues,
}: AnalyticsTabProps) {
  const canViewResults =
    valueResults.length > 0 &&
    valueResults.some((value) => value.behaviors && value.behaviors.length > 0);

  // Funções de exportação
  const handleExportRadarChart = async () => {
    try {
      await exportRadarChartToPdf(valueResults, {
        title: 'Relatório de Avaliação - Gráfico Radar',
        fileName: 'avaliacao-radar.pdf',
        author: 'Sistema de Avaliações',
        subject: 'Análise de Desempenho por Valores'
      });
    } catch (error) {
      console.error('Erro ao exportar gráfico radar:', error);
      // Aqui você pode adicionar uma notificação de erro
    }
  };

  const handleExportGauge = async () => {
    try {
      await exportGaugeToPdf(overallScore, performanceCategory, {
        title: 'Relatório de Avaliação - Resultado Geral',
        fileName: 'avaliacao-gauge.pdf',
        author: 'Sistema de Avaliações',
        subject: 'Resultado Geral da Avaliação'
      });
    } catch (error) {
      console.error('Erro ao exportar gauge:', error);
      // Aqui você pode adicionar uma notificação de erro
    }
  };

  const handleExportBarChart = async () => {
    try {
      await exportBarChartToPdf(valueResults, 'horizontal', {
        title: 'Relatório de Avaliação - Gráfico de Barras',
        fileName: 'avaliacao-barras.pdf',
        author: 'Sistema de Avaliações',
        subject: 'Análise de Desempenho por Valores'
      });
    } catch (error) {
      console.error('Erro ao exportar gráfico de barras:', error);
      // Aqui você pode adicionar uma notificação de erro
    }
  };

  const handleExportAllCharts = async () => {
    try {
      // Exportar todos os gráficos em sequência
      await handleExportRadarChart();
      await handleExportGauge();
      await handleExportBarChart();
    } catch (error) {
      console.error('Erro ao exportar todos os gráficos:', error);
    }
  };

  return (
    <div className='space-y-8'>
      {canViewResults ? (
        <>
          {/* Botões de Exportação */}
          <div className='flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border'>
            <h4 className='w-full text-sm font-medium text-gray-700 mb-2'>
              Exportar Gráficos para PDF
            </h4>
            
            <Button
              onClick={handleExportRadarChart}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <PieChart className="h-4 w-4" />
              Gráfico Radar
            </Button>

            <Button
              onClick={handleExportGauge}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Resultado Geral
            </Button>

            <Button
              onClick={handleExportBarChart}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Gráfico de Barras
            </Button>

            <Button
              onClick={handleExportAllCharts}
              variant="default"
              size="sm"
              className="flex items-center gap-2 ml-auto"
            >
              <Download className="h-4 w-4" />
              Exportar Todos
            </Button>
          </div>

          {/* Resto do componente original... */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* OverallResultGauge */}
            <div className="relative">
              {/* Botão de exportação individual para o gauge */}
              <Button
                onClick={handleExportGauge}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 opacity-70 hover:opacity-100"
                title="Exportar Resultado Geral para PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {/* Componente OverallResultGauge original */}
              {/* <OverallResultGauge
                score={convertScore(overallScore, 'SCALE_5', 'SCALE_10')}
                category={performanceCategory}
              /> */}
            </div>

            {/* Gráfico Radar */}
            <div className="relative">
              {/* Botão de exportação individual para o radar */}
              <Button
                onClick={handleExportRadarChart}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 opacity-70 hover:opacity-100"
                title="Exportar Gráfico Radar para PDF"
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Card com gráfico radar original */}
              {/* Seu componente de gráfico radar aqui */}
            </div>
          </div>

          {/* Seção de detalhamento com botão de exportação para barras */}
          <div className="relative">
            <Button
              onClick={handleExportBarChart}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 opacity-70 hover:opacity-100"
              title="Exportar Gráfico de Barras para PDF"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Resto do componente de detalhamento... */}
            {/* Seu código original aqui */}
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
          <div className='bg-muted p-6 rounded-lg max-w-md'>
            <h3 className='text-xl font-semibold mb-2'>
              Dados não disponíveis
            </h3>
            <p className='text-muted-foreground'>
              Os resultados detalhados desta avaliação não estão disponíveis
              porque não há respostas registradas.
            </p>
            <p className='mt-4 text-sm'>
              Os dados analíticos serão exibidos quando houver respostas para
              análise.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Exemplo de como usar em um hook personalizado
export function useChartExport() {
  const exportCharts = {
    radar: async (valueResults: any[], options?: any) => {
      return exportRadarChartToPdf(valueResults, options);
    },
    gauge: async (score: number, category: any, options?: any) => {
      return exportGaugeToPdf(score, category, options);
    },
    bar: async (valueResults: any[], layout?: 'vertical' | 'horizontal', options?: any) => {
      return exportBarChartToPdf(valueResults, layout, options);
    }
  };

  return exportCharts;
} 