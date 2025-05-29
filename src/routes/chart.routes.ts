import { Router } from 'express';
import { ChartController } from '../controllers/chart.controller';

const router = Router();
const chartController = new ChartController();

// Rota para gerar apenas a imagem do gráfico
router.post('/chart-image', (req, res) => chartController.generateChartImage(req, res));

// Rota genérica para gerar PDF com qualquer tipo de gráfico
router.post('/chart-pdf', (req, res) => chartController.generateChartPdf(req, res));

// Rota para gerar PDF com gráfico radar
router.post('/radar-chart-pdf', (req, res) => chartController.generateRadarChartPdf(req, res));

export default router; 