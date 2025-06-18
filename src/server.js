require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/clientes');
const salesRoutes = require('./routes/sales');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/stats', statsRoutes);

// Configuração do Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Toy Store API',
      version: '1.0.0',
      description: 'Documentação da API Toy Store',
    },
    servers: [
      {
        url: 'https://toystore-service.fly.dev',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rotas
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `Rota ${req.originalUrl} não existe`
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;