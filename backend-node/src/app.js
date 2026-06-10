const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./shared/middleware/errorHandler');

const clientesRoutes = require('./modules/clientes/clientes.routes');
const metabolismoRoutes = require('./modules/metabolismo/metabolismo.routes');
const entrenamientoRoutes = require('./modules/entrenamiento/entrenamiento.routes');
const dietasRoutes = require('./modules/dietas/dietas.routes');
const reportesRoutes = require('./modules/reportes/reportes.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend-node' });
});

app.use('/api/clientes', clientesRoutes);
app.use('/api/metabolismo', metabolismoRoutes);
app.use('/api/entrenamiento', entrenamientoRoutes);
app.use('/api/dietas', dietasRoutes);
app.use('/api/reportes', reportesRoutes);

app.use(errorHandler);

module.exports = app;
