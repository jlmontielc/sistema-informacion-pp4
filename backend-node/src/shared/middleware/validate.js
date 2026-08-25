const validar = (esquema, fuente = 'body') => (req, res, next) => {
  const datos = fuente === 'params' ? req.params : req.body;
  const { error } = esquema.validate(datos);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validar };
