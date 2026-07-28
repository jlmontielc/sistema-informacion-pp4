const { Sequelize } = require('sequelize');
const config = require('../constants');

const sequelize = new Sequelize(config.DB.NAME, config.DB.USER, config.DB.PASSWORD, {
  host: config.DB.HOST,
  port: config.DB.PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const MAX_INTENTOS = 5;
const INTERVALO_MS = 5000;

const connectDB = async (intento = 1) => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida.');
  } catch (error) {
    console.error(`Intento ${intento}/${MAX_INTENTOS} - Error conectando a MySQL: ${error.message}`);
    if (intento >= MAX_INTENTOS) {
      console.error('Se agotaron los reintentos. No se pudo conectar a MySQL.');
      process.exit(1);
    }
    console.log(`Reintentando en ${INTERVALO_MS / 1000}s...`);
    await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS));
    return connectDB(intento + 1);
  }
};

module.exports = { sequelize, connectDB };
