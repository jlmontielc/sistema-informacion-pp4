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

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida.');
  } catch (error) {
    console.error('Error conectando a MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
