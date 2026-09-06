const { sequelize } = require('./shared/database/connection');

require('./shared/database/associations');

const sembrarAdmin = require('./shared/utils/seed-admin');

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await sembrarAdmin();
  } catch (err) {
    console.error('Error al ejecutar seed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();
