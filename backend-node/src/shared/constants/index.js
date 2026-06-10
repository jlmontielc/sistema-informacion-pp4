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
  FLASK_IA_URL: process.env.FLASK_IA_URL || 'http://localhost:5000',
};
