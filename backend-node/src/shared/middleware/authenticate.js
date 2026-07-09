const jwt = require('jsonwebtoken');
const config = require('../constants');

const autenticar = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];
  try {
    const decodificado = jwt.verify(token, config.JWT_SECRET);
    req.usuario = { id: decodificado.id, email: decodificado.email, nombre: decodificado.nombre };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { autenticar };
