const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./shared/swagger/swaggerConfig');
const { manejadorErrores } = require('./shared/middleware/errorHandler');
const config = require('./shared/constants');

require('./shared/database/associations');

const authRoutes = require('./modules/auth/auth.routes');
const instruidosRoutes = require('./modules/instruidos/instruido.routes');
const metabolismoRoutes = require('./modules/metabolismo/metabolismo.routes');
const entrenamientoRoutes = require('./modules/entrenamiento/entrenamiento.routes');
const hitlRoutes = require('./modules/entrenamiento/hitl.routes');
const dietasRoutes = require('./modules/dietas/dietas.routes');
const pagosRoutes = require('./modules/pagos/pagos.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

// Necesario para que express-rate-limit identifique la IP real del cliente
// detrás del proxy inverso de la plataforma de despliegue (Render/Railway).
app.set('trust proxy', 1);

app.use(compression());

app.use(cors({
  origin: config.CORS_ORIGINS,
}));
// Límite elevado SOLO para /api/pagos y /api/auth/certifications: admiten archivos en base64 (~2 MB decodificados).
// Las certificaciones aceptan imagen JPG/PNG/WebP o PDF adjunta; el resto de la API conserva el límite por defecto (100kb).
app.use('/api/pagos', express.json({ limit: '5mb' }));
app.use('/api/auth/certifications', express.json({ limit: '5mb' }));
app.use(express.json());
app.use(morgan('dev'));

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Verificar estado del servidor
 *     description: Endpoint de verificación de salud del servicio.
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-node' });
});

// La documentacion de la API solo se expone fuera de produccion
if (config.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Sistema de Información - API Docs',
  }));

  app.get('/api/docs.json', (req, res) => {
    res.json(swaggerSpec);
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/instruidos', instruidosRoutes);
app.use('/api/metabolismo', metabolismoRoutes);
app.use('/api/entrenamiento', entrenamientoRoutes);
app.use('/api/entrenamiento', hitlRoutes);
app.use('/api/dietas', dietasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(manejadorErrores);

module.exports = app;
