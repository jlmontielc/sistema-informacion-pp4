const http = require('http');
const https = require('https');
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
  const esHttps = parsedUrl.protocol === 'https:';
  const cliente = esHttps ? https : http;
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (esHttps ? 443 : 80),
    path,
    method,
    timeout: timeout || 15000,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': `Bearer ${generarTokenServicio()}`,
    },
  };

  const req = cliente.request(options, (res) => {
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

const CAMPOS_SENSIBLES = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes', 'medicacionActual'];

const normalizarTextoLimpieza = (texto) => {
  if (typeof texto !== 'string') return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const VALORES_VACIOS_MEDICOS = new Set([
  '', '0', 'n/a', 'n a', 'na', 's/n', 's n', 'no', 'none', 'nada',
  'ninguna', 'ningunas', 'ninguno', 'ningunos',
  'ninguna lesion', 'ninguna lesiones', 'ningun lesion',
  'ninguna condicion', 'ninguna condiciones', 'ningun condicion',
  'ninguna alergia', 'ninguna alergias', 'ningun alergia',
  'ninguna intolerancia', 'ninguna intolerancias', 'ningun intolerancia',
  'ninguna medicacion', 'ninguna medicaciones', 'ningun medicacion',
  'ningun medicamento', 'ninguna medicamento', 'ningunos medicamentos',
  'sin', 'sin lesiones', 'sin lesion', 'sin condiciones', 'sin condicion',
  'sin alergias', 'sin alergia', 'sin intolerancias', 'sin intolerancia',
  'sin medicacion', 'sin medicamentos', 'sin medicamento',
]);

const limpiarArrayMedico = (valores) => {
  if (!Array.isArray(valores)) return [];
  return valores
    .filter((valor) => valor !== null && valor !== undefined)
    .map((valor) => String(valor).trim())
    .filter((valor) => valor.length > 0)
    .filter((valor) => !VALORES_VACIOS_MEDICOS.has(normalizarTextoLimpieza(valor)));
};

module.exports = {
  FLASK_URL,
  generarTokenServicio,
  httpRequest,
  descifrarSeguro,
  parsearCampoJson,
  limpiarArrayMedico,
  CAMPOS_SENSIBLES,
};
