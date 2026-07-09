const { Instruido } = require('./instruido.model');
const bcrypt = require('bcryptjs');

const encriptarContrasena = async (contrasena) => bcrypt.hash(contrasena, 10);

const obtenerTodos = async (entrenadorId) => Instruido.findAll({ where: { entrenadorId } });

const obtenerPorId = async (id, entrenadorId) => Instruido.findOne({ where: { id, entrenadorId } });

const obtenerPorIdAdmin = async (id) => Instruido.findByPk(id);

const crear = async (datos, entrenadorId) => {
  const datosCrear = { ...datos, entrenadorId };
  if (datos.contrasena) {
    datosCrear.contrasenaHash = await encriptarContrasena(datos.contrasena);
    delete datosCrear.contrasena;
  }
  return Instruido.create(datosCrear);
};

const actualizar = async (id, datos, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id, entrenadorId } });
  if (!instruido) return null;
  const datosActualizar = { ...datos };
  if (datosActualizar.contrasena) {
    datosActualizar.contrasenaHash = await encriptarContrasena(datosActualizar.contrasena);
    delete datosActualizar.contrasena;
  }
  return instruido.update(datosActualizar);
};

const eliminar = async (id, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id, entrenadorId } });
  if (!instruido) return null;
  return instruido.destroy();
};

const obtenerPorIdPropio = async (id) => Instruido.findByPk(id, {
  attributes: { exclude: ['contrasenaHash'] },
});

const actualizarPropio = async (id, datos) => {
  const instruido = await Instruido.findByPk(id);
  if (!instruido) return null;
  const datosActualizar = {};
  if (datos.nombre) datosActualizar.nombre = datos.nombre;
  if (datos.email) datosActualizar.email = datos.email;
  if (datos.contrasena) datosActualizar.contrasenaHash = await encriptarContrasena(datos.contrasena);
  await instruido.update(datosActualizar);
  return Instruido.findByPk(id, { attributes: { exclude: ['contrasenaHash'] } });
};

module.exports = { obtenerTodos, obtenerPorId, obtenerPorIdAdmin, crear, actualizar, eliminar, obtenerPorIdPropio, actualizarPropio };
