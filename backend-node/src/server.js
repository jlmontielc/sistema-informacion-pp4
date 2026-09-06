const app = require('./app');
const { sequelize, connectDB } = require('./shared/database/connection');
const config = require('./shared/constants');
const sembrarAdmin = require('./shared/utils/seed-admin');

const start = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    await sembrarAdmin();
    app.listen(config.PORT, () => {
      console.log(`Backend Node corriendo en puerto ${config.PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar servidor:', err.message);
    process.exit(1);
  }
};

start();
