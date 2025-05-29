import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
import { 
  Chart, 
  ChartConfiguration, 
  RadarController, 
  LineElement, 
  PointElement, 
  RadialLinearScale, 
  Tooltip, 
  Legend, 
  Filler,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement
} from 'chart.js';
import { RadarChartData, RadialBarChartData, BarChartData, PieChartData } from '../interfaces/chart.interface';

// Registrar os componentes necessários do Chart.js
Chart.register(
  RadarController, 
  LineElement, 
  PointElement, 
  RadialLinearScale, 
  Tooltip, 
  Legend, 
  Filler,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement
);

export class ChartService {
  /**
   * Gera um gráfico radar no canvas fornecido
   * @param canvas Canvas onde o gráfico será desenhado
   * @param chartData Dados para o gráfico radar
   * @returns O objeto Chart criado
   */
  public generateRadarChart(canvas: Canvas, chartData: RadarChartData): Chart {
    const config = this.createRadarChartConfig(chartData);
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    return new Chart(ctx as any, config);
  }

  /**
   * Gera um gráfico gauge radial (similar ao OverallResultGauge)
   * @param canvas Canvas onde o gráfico será desenhado
   * @param chartData Dados para o gráfico gauge
   * @returns O objeto Chart criado
   */
  public generateRadialBarChart(canvas: Canvas, chartData: RadialBarChartData): Chart {
    const config = this.createRadialBarChartConfig(chartData);
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    return new Chart(ctx as any, config);
  }

  /**
   * Gera um gráfico de barras
   * @param canvas Canvas onde o gráfico será desenhado
   * @param chartData Dados para o gráfico de barras
   * @returns O objeto Chart criado
   */
  public generateBarChart(canvas: Canvas, chartData: BarChartData): Chart {
    const config = this.createBarChartConfig(chartData);
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    return new Chart(ctx as any, config);
  }

  /**
   * Gera um gráfico de pizza
   * @param canvas Canvas onde o gráfico será desenhado
   * @param chartData Dados para o gráfico de pizza
   * @returns O objeto Chart criado
   */
  public generatePieChart(canvas: Canvas, chartData: PieChartData): Chart {
    const config = this.createPieChartConfig(chartData);
    const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    return new Chart(ctx as any, config);
  }

  /**
   * Gera uma imagem do gráfico
   * @param chartType Tipo do gráfico
   * @param chartData Dados do gráfico
   * @returns Buffer da imagem PNG
   */
  async generateChartImage(chartType: string, chartData: any): Promise<Buffer> {
    let chartConfig;

    switch (chartType) {
      case 'radar':
        chartConfig = this.createRadarChartConfig(chartData);
        break;
      case 'radialBar':
        chartConfig = this.createRadialBarChartConfig(chartData);
        break;
      case 'bar':
        chartConfig = this.createBarChartConfig(chartData);
        break;
      case 'pie':
        chartConfig = this.createPieChartConfig(chartData);
        break;
      default:
        throw new Error(`Tipo de gráfico não suportado: ${chartType}`);
    }

    // Tamanhos otimizados para PDF
    let width = chartData.width || 400;
    let height = chartData.height || 400;
    
    if (chartType === 'radialBar') {
      width = 320; // Tamanho otimizado para gauge
      height = 240; // Altura menor para o semicírculo
    } else if (chartType === 'radar') {
      width = 480; // Tamanho otimizado para radar
      height = 480;
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Configurar o canvas para máxima qualidade
    ctx.imageSmoothingEnabled = true;
    
    // Fundo branco para melhor contraste
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const chart = new Chart(ctx as any, chartConfig);
    
    // Aguardar renderização completa
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const buffer = canvas.toBuffer('image/png', { compressionLevel: 1, filters: Canvas.PNG_FILTER_NONE });
    chart.destroy();
    
    return buffer;
  }

  /**
   * Cria configuração para gráfico radar - IDÊNTICO ao RadarChart do frontend
   */
  private createRadarChartConfig(chartData: RadarChartData): ChartConfiguration {
    // Configurar datasets com as mesmas cores do frontend
    const datasets = chartData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: 'rgba(59, 130, 246, 0.4)', // #3b82f6 com 40% opacidade
      borderColor: '#2563eb', // Cor do border idêntica ao frontend
      borderWidth: 2,
      pointBackgroundColor: '#2563eb',
      pointBorderColor: '#fff',
      pointRadius: 3,
      fill: true
    }));

    return {
      type: 'radar',
      data: {
        labels: chartData.labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Ocultar legenda como no frontend
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#1f2937',
            titleColor: '#f9fafb',
            bodyColor: '#f9fafb',
            borderColor: '#374151',
            borderWidth: 1
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 10,
            ticks: {
              display: false, // Ocultar números como no frontend
              stepSize: 2
            },
            grid: {
              color: 'rgba(100, 116, 139, 0.2)', // Mesma cor do grid
              lineWidth: 1
            },
            angleLines: {
              color: 'rgba(100, 116, 139, 0.2)', // Mesma cor das linhas angulares
              lineWidth: 1
            },
            pointLabels: {
              color: '#64748b', // Mesma cor dos labels
              font: {
                size: 12,
                family: 'Arial, sans-serif'
              },
              padding: 15 // Espaçamento dos labels
            }
          }
        },
        elements: {
          line: {
            tension: 0.1
          },
          point: {
            radius: 3,
            hoverRadius: 5
          }
        }
      },
    };
  }

  /**
   * Cria configuração para gráfico radial bar (gauge) - IDÊNTICO ao OverallResultGauge
   */
  private createRadialBarChartConfig(chartData: RadialBarChartData): ChartConfiguration {
    const scorePercentage = (chartData.score / chartData.maxScore) * 100;
    
    return {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [scorePercentage, 100 - scorePercentage],
            backgroundColor: [chartData.category.color, '#f1f5f9'], // Usar a cor da categoria
            borderWidth: 0,
            circumference: 180, // SEMICÍRCULO como no frontend (não 360!)
            rotation: 270 // Rotação para começar de cima
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        datasets: {
          doughnut: {
            cutout: '75%' // Mesmo cutout do frontend
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        elements: {
          arc: {
            borderWidth: 0
          }
        }
      } as any,
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart: any) => {
          const ctx = chart.ctx;
          const width = chart.width;
          const height = chart.height;
          const centerX = width / 2;
          const centerY = height / 2;
          
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Desenhar pontuação principal (grande) - CENTRALIZADO
          ctx.font = 'bold 32px Arial'; // Ajustar tamanho
          ctx.fillStyle = '#1f2937'; // Cor escura como no frontend
          ctx.fillText(chartData.score.toFixed(1), centerX, centerY - 15);
          
          // Desenhar label da categoria (retângulo com fundo colorido)
          const labelText = chartData.category.label;
          ctx.font = 'bold 11px Arial';
          
          // Medir texto para ajustar retângulo
          const textMetrics = ctx.measureText(labelText);
          const textWidth = textMetrics.width;
          const rectWidth = textWidth + 16; // padding
          const rectHeight = 20;
          const rectX = centerX - (rectWidth / 2);
          const rectY = centerY + 20;
          
          // Desenhar retângulo com fundo colorido
          ctx.fillStyle = chartData.category.color;
          ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
          
          // Desenhar texto branco por cima
          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, centerX, rectY + (rectHeight / 2));
          
          ctx.restore();
        }
      }]
    };
  }

  /**
   * Cria configuração para gráfico de barras
   */
  private createBarChartConfig(chartData: BarChartData): ChartConfiguration {
    const isVertical = chartData.layout !== 'vertical';
    
    return {
      type: 'bar',
      data: {
        labels: chartData.data.map(item => item.name),
        datasets: [{
          data: chartData.data.map(item => item.value),
          backgroundColor: chartData.data.map(item => item.color || '#3b82f6'),
          borderColor: chartData.data.map(item => item.color || '#2563eb'),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: isVertical ? 'x' : 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: !!chartData.title,
            text: chartData.title || '',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: !!chartData.xAxisLabel,
              text: chartData.xAxisLabel || ''
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: !!chartData.yAxisLabel,
              text: chartData.yAxisLabel || ''
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    };
  }

  /**
   * Cria configuração para gráfico de pizza
   */
  private createPieChartConfig(chartData: PieChartData): ChartConfiguration {
    return {
      type: 'pie',
      data: {
        labels: chartData.data.map(item => item.name),
        datasets: [{
          data: chartData.data.map(item => item.value),
          backgroundColor: chartData.data.map(item => item.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: !!chartData.title,
            text: chartData.title || '',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context: any) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  }

  /**
   * Gera uma cor aleatória
   * @param alpha Valor de opacidade (0-1)
   * @returns String de cor em formato rgba
   */
  private generateRandomColor(alpha: number): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Gera cores aleatórias para o gráfico
   * @param count Número de cores a serem geradas
   * @param alpha Valor de opacidade (0-1)
   * @returns Array de strings de cores em formato rgba
   */
  private generateRandomColors(count: number, alpha: number): string[] {
    const colors: string[] = [];
    
    for (let i = 0; i < count; i++) {
      colors.push(this.generateRandomColor(alpha));
    }
    
    return colors;
  }
} 