require('dotenv').config();

const REQUERIDOS = ['JWT_SECRET', 'ENC_KEY', 'ENC_IV'];
for (const varName of REQUERIDOS) {
  if (!process.env[varName]) {
    throw new Error(`Variable de entorno faltante: ${varName}. Configúrala en el archivo .env`);
  }
}

const esHexValido = (valor) => /^[0-9a-fA-F]+$/.test(valor);
if (!esHexValido(process.env.ENC_KEY) || process.env.ENC_KEY.length !== 64) {
  throw new Error('ENC_KEY invalida: debe ser hexadecimal de exactamente 64 caracteres (32 bytes para AES-256)');
}
if (!esHexValido(process.env.ENC_IV) || process.env.ENC_IV.length !== 32) {
  throw new Error('ENC_IV invalido: debe ser hexadecimal de exactamente 32 caracteres (16 bytes para AES-256-CBC)');
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || null;

if (ADMIN_PASSWORD && process.env.NODE_ENV === 'production' && ADMIN_PASSWORD.length < 12) {
  throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres en produccion');
}

module.exports = {
  PORT: process.env.PORT || 3000,
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 3306,
    NAME: process.env.DB_NAME || 'sistema_entrenador',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
  },
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '10d',
  ENC_KEY: process.env.ENC_KEY,
  ENC_IV: process.env.ENC_IV,
  FLASK_IA_URL: process.env.FLASK_IA_URL || 'http://localhost:5000',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379/0',
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
};
