const Redis = require('ioredis');
const config = require('../constants');

let cliente = null;
let conectado = false;

const crearCliente = () => {
  if (!config.REDIS_ENABLED || !config.REDIS_URL) {
    return null;
  }

  const redis = new Redis(config.REDIS_URL, {
    retryStrategy: (intentos) => Math.min(intentos * 50, 2000),
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    conectado = true;
    console.log('Conexión a Redis establecida.');
  });

  redis.on('close', () => {
    conectado = false;
    console.warn('Conexión a Redis cerrada.');
  });

  redis.on('error', (err) => {
    conectado = false;
    console.error('Error Redis:', err.message);
  });

  return redis;
};

const obtenerCliente = () => {
  if (!cliente && config.REDIS_ENABLED) {
    cliente = crearCliente();
  }
  return cliente;
};

const conectarRedis = async () => {
  const redis = obtenerCliente();
  if (!redis) return false;

  try {
    await redis.connect();
    conectado = true;
    return true;
  } catch (err) {
    conectado = false;
    console.error('No se pudo conectar a Redis:', err.message);
    return false;
  }
};

const estaConectado = () => conectado;

const desconectarRedis = async () => {
  if (cliente) {
    await cliente.quit();
    cliente = null;
    conectado = false;
  }
};

module.exports = {
  obtenerCliente,
  conectarRedis,
  desconectarRedis,
  estaConectado,
};
