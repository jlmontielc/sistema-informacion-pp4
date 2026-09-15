const crypto = require('crypto');
const { obtenerCliente, estaConectado } = require('../cache/redis');
const cacheKeys = require('../cache/cacheKeys');

let tokensInvalidados = new Set();

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const ttlDesdeToken = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (payload.exp) {
      const segundos = payload.exp - Math.floor(Date.now() / 1000);
      return segundos > 0 ? segundos : 60;
    }
  } catch (err) {
    // Token malformado; usa TTL corto por defecto.
  }
  return 60;
};

const agregar = async (token) => {
  const hash = hashToken(token);
  const cliente = obtenerCliente();

  if (cliente && estaConectado()) {
    try {
      const ttl = ttlDesdeToken(token);
      await cliente.setex(cacheKeys.blacklist(hash), ttl, '1');
      return;
    } catch (err) {
      console.error('Error agregando token a blacklist de Redis:', err.message);
    }
  }

  tokensInvalidados.add(hash);
};

const estaInvalidado = async (token) => {
  const hash = hashToken(token);
  const cliente = obtenerCliente();

  if (cliente && estaConectado()) {
    try {
      const existe = await cliente.get(cacheKeys.blacklist(hash));
      return existe === '1';
    } catch (err) {
      console.error('Error consultando blacklist de Redis:', err.message);
    }
  }

  return tokensInvalidados.has(hash);
};

module.exports = { agregar, estaInvalidado };
