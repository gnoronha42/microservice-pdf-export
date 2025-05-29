import express from 'express';
import cors from 'cors';
import chartRoutes from './routes/chart.routes';

// Inicializar o aplicativo Express
const app = express();

// Configurar CORS para produção - CORRIGIDO
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000', 
      'https://lapi-dados-web.vercel.app',
      'https://microservice-pdf-export.onrender.com'
    ];
    
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS bloqueado para origem:', origin);
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
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

// Middleware para rotas não encontradas - CORRIGIDO
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware para tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Converter PORT para número
const PORT = parseInt(process.env.PORT || '3000', 10);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Microserviço de PDF rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   - POST /api/chart-image`);
  console.log(`   - POST /api/chart-pdf`);
  console.log(`   - POST /api/radar-chart-pdf`);
  console.log(`   - GET /health`);
}); 