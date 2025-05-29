import express from 'express';
import cors from 'cors';
import chartRoutes from './routes/chart.routes';

// Inicializar o aplicativo Express
const app = express();

// Configurar CORS para produção
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://microservice-pdf-export.onrender.com',
        'https://lapi-dados-web.vercel.app', // Substitua pela URL do seu frontend
        // Adicione outras URLs autorizadas
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logs de requisição
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'PDF Export Microservice',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Microserviço de Exportação de PDF',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      chartImage: '/api/chart-image',
      chartPdf: '/api/chart-pdf'
    }
  });
});

// Rotas do microserviço
app.use('/api', chartRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

// Middleware para tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Usar a porta do environment ou 3000 como fallback
const PORT = process.env.PORT || 3000;

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Microserviço de PDF rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   - POST /api/chart-image`);
  console.log(`   - POST /api/chart-pdf`);
  console.log(`   - POST /api/radar-chart-pdf`);
  console.log(`   - GET /health`);
}); 