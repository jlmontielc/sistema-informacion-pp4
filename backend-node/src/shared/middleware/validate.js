const validar = (esquema) => (req, res, next) => {
  const { error } = esquema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validar };
