require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 3306,
    NAME: process.env.DB_NAME || 'sistema_entrenador',
    USER: process.env.DB_USER || 'postgres',
    PASSWORD: process.env.DB_PASSWORD || 'postgres',
  },
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ENC_KEY: process.env.ENC_KEY || '0123456789abcdef0123456789abcdef',
  ENC_IV: process.env.ENC_IV || '0123456789abcdef',
  FLASK_IA_URL: process.env.FLASK_IA_URL || 'http://localhost:5000',
};
