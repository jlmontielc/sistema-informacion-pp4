const manejadorErrores = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.status ? (err.message || 'Error interno del servidor') : 'Error interno del servidor',
  });
};

module.exports = { manejadorErrores };
