const jwt = require('jsonwebtoken');
const config = require('../constants');
const blacklist = require('../utils/blacklist');

const TIPOS_VALIDOS = ['entrenador', 'instruido'];

const autenticar = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];
  if (blacklist.estaInvalidado(token)) {
    return res.status(401).json({ error: 'Token invalidado' });
  }

  try {
    const decodificado = jwt.verify(token, config.JWT_SECRET);

    if (!TIPOS_VALIDOS.includes(decodificado.tipo)) {
      return res.status(401).json({ error: 'Token con tipo inválido' });
    }

    req.token = token;
    req.usuario = {
      id: decodificado.id,
      email: decodificado.email,
      nombre: decodificado.nombre,
      rol: decodificado.rol,
      tipo: decodificado.tipo,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { autenticar };
