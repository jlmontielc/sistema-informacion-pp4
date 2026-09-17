const app = require('./app');
const { sequelize, connectDB } = require('./shared/database/connection');
const { conectarRedis } = require('./shared/cache/redis');
const config = require('./shared/constants');
const sembrarAdmin = require('./shared/utils/seed-admin');
const ejerciciosService = require('./modules/entrenamiento/ejercicios.service');

const start = async () => {
  try {
    await connectDB();
    const redisConectado = await conectarRedis();
    await sequelize.sync();
    await sembrarAdmin();
    app.listen(config.PORT, async () => {
      console.log(`Backend Node corriendo en puerto ${config.PORT}`);
      if (redisConectado && config.REDIS_ENABLED) {
        try {
          await ejerciciosService.obtenerTodos({});
          console.log('Caché de ejercicios precargada (warming).');
        } catch (err) {
          console.error('Error en warming de ejercicios:', err.message);
        }
      }
    });
  } catch (err) {
    console.error('Error al iniciar servidor:', err.message);
    process.exit(1);
  }
};

start();
