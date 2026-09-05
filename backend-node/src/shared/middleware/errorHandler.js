const manejadorErrores = (err, req, res, next) => {
  const esDev = process.env.NODE_ENV === 'development';
  const esSequelize = err.name && err.name.startsWith('Sequelize');

  if (esDev) {
    console.error(err.stack);
  } else {
    console.error(err.message || 'Error interno del servidor');
  }

  let expuesto = 'Error interno del servidor';
  if (esDev && (esSequelize || err.status)) {
    expuesto = err.message || 'Error interno del servidor';
  } else if (err.status) {
    expuesto = err.message || 'Error interno del servidor';
  }

  res.status(err.status || 500).json({ error: expuesto });
};

module.exports = { manejadorErrores };
