import express from 'express';
import cors from 'cors';
import { config } from './config';
import chartRoutes from './routes/chart.routes';
import { errorHandler, notFoundHandler } from './utils/error-handler';

// Inicializar o aplicativo Express
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Adicione as URLs do seu frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' })); // Aumentar limite para permitir envio de dados maiores

// Logs de requisição simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'PDF Export Microservice'
  });
});

// Rotas do microserviço
app.use('/api', chartRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware para tratamento de erros
app.use(errorHandler);

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Microserviço de PDF rodando na porta ${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   - POST /api/chart-pdf`);
  console.log(`   - POST /api/radar-chart-pdf`);
  console.log(`   - GET /health`);
}); 