const bcrypt = require('bcryptjs');
const { sequelize } = require('./shared/database/connection');
const { Entrenador } = require('./modules/auth/entrenador.model');

require('./shared/database/associations');

const ADMIN_EMAIL = 'admin@sistema.com';
const ADMIN_PASSWORD = 'Admin123!';

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existe = await Entrenador.findOne({ where: { email: ADMIN_EMAIL } });
    if (existe) {
      console.log(`Admin ya existe: ${ADMIN_EMAIL}`);
      return;
    }

    const contrasenaHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await Entrenador.create({
      nombre: 'Administrador',
      email: ADMIN_EMAIL,
      contrasenaHash,
      rol: 'administrador',
    });

    console.log('Admin creado exitosamente:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Contraseña: ${ADMIN_PASSWORD}`);
  } catch (err) {
    console.error('Error al ejecutar seed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();
