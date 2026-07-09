const crypto = require('crypto');
const config = require('../constants');

const ALGORITMO = 'aes-256-cbc';

const cifrar = (texto) => {
  if (!texto) return null;
  const cifrador = crypto.createCipheriv(ALGORITMO, Buffer.from(config.ENC_KEY, 'hex'), Buffer.from(config.ENC_IV, 'hex'));
  let cifrado = cifrador.update(texto, 'utf8', 'hex');
  cifrado += cifrador.final('hex');
  return cifrado;
};

const descifrar = (textoCifrado) => {
  if (!textoCifrado) return null;
  const descifrador = crypto.createDecipheriv(ALGORITMO, Buffer.from(config.ENC_KEY, 'hex'), Buffer.from(config.ENC_IV, 'hex'));
  let descifrado = descifrador.update(textoCifrado, 'hex', 'utf8');
  descifrado += descifrador.final('utf8');
  return descifrado;
};

module.exports = { cifrar, descifrar };
