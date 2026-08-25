const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const config = require('../constants');
const { descifrar } = require('./crypto');

const FLASK_URL = config.FLASK_IA_URL || 'http://localhost:5000';

const generarTokenServicio = () => jwt.sign(
  { service: 'backend-node' },
  config.JWT_SECRET,
  { expiresIn: '5m' },
);

const httpRequest = (path, method, body, timeout) => new Promise((resolve, reject) => {
  const parsedUrl = url.parse(FLASK_URL);
  const data = body ? JSON.stringify(body) : '';
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path,
    method,
    timeout: timeout || 15000,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': `Bearer ${generarTokenServicio()}`,
    },
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        resolve({ status: res.statusCode, data: parsed });
      } catch {
        resolve({ status: res.statusCode, data: responseData });
      }
    });
  });

  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      const error = new Error('Servicio de IA no disponible');
      error.status = 503;
      return reject(error);
    }
    reject(err);
  });

  req.on('timeout', () => {
    req.destroy();
    const error = new Error('Timeout al conectar con servicio de IA');
    error.status = 504;
    reject(error);
  });

  if (data) req.write(data);
  req.end();
});

const descifrarSeguro = (valor) => {
  try {
    return descifrar(valor);
  } catch {
    return valor;
  }
};

const parsearCampoJson = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    return [String(parsed)];
  } catch {
    if (typeof raw === 'string') {
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
};

const CAMPOS_SENSIBLES = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes'];

module.exports = {
  FLASK_URL,
  generarTokenServicio,
  httpRequest,
  descifrarSeguro,
  parsearCampoJson,
  CAMPOS_SENSIBLES,
};
