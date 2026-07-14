const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { manejadorErrores } = require('./shared/middleware/errorHandler');

require('./shared/database/associations');

const authRoutes = require('./modules/auth/auth.routes');
const instruidosRoutes = require('./modules/instruidos/instruido.routes');
const metabolismoRoutes = require('./modules/metabolismo/metabolismo.routes');
const entrenamientoRoutes = require('./modules/entrenamiento/entrenamiento.routes');
const dietasRoutes = require('./modules/dietas/dietas.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-node' });
});

app.use('/api/auth', authRoutes);
app.use('/api/instruidos', instruidosRoutes);
app.use('/api/metabolismo', metabolismoRoutes);
app.use('/api/entrenamiento', entrenamientoRoutes);
app.use('/api/dietas', dietasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(manejadorErrores);

module.exports = app;
