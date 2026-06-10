const app = require('./app');
const { connectDB } = require('./shared/database/connection');
const config = require('./shared/constants');

const start = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(`Backend Node corriendo en puerto ${config.PORT}`);
  });
};

start();
