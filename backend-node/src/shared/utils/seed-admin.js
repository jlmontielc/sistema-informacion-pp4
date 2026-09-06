const bcrypt = require('bcryptjs');
const config = require('../constants');
const { Entrenador } = require('../../modules/auth/entrenador.model');

const sembrarAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = config;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD no configurados; saltando seed de admin');
    return;
  }

  try {
    const existe = await Entrenador.findOne({ where: { email: ADMIN_EMAIL } });
    if (existe) {
      console.log('Admin por defecto ya existe');
      return;
    }

    const contrasenaHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await Entrenador.create({
      nombre: 'Administrador',
      email: ADMIN_EMAIL,
      contrasenaHash,
      rol: 'administrador',
    });

    console.log('Admin por defecto creado');
  } catch (err) {
    console.error('Error al sembrar admin por defecto:', err.message);
    throw err;
  }
};

module.exports = sembrarAdmin;
