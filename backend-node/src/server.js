const app = require('./app');
const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('./shared/database/connection');
const { Entrenador } = require('./modules/auth/entrenador.model');
const config = require('./shared/constants');

const ADMIN_EMAIL = '***REDACTADO***';
const ADMIN_PASSWORD = '***ROTADA***';

const sembrarAdmin = async () => {
  try {
    const existe = await Entrenador.findOne({ where: { email: ADMIN_EMAIL } });
    if (existe) return;
    const contrasenaHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await Entrenador.create({
      nombre: 'Administrador',
      email: ADMIN_EMAIL,
      contrasenaHash,
      rol: 'administrador',
    });
    console.log('Admin por defecto creado: ***REDACTADO*** / ***ROTADA***');
  } catch (err) {
    console.error('Error al sembrar admin por defecto:', err.message);
  }
};

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
