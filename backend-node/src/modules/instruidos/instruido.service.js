const { Instruido } = require('./instruido.model');
const bcrypt = require('bcryptjs');

const ATRIBUTOS_SEGUROS = { attributes: { exclude: ['contrasenaHash'] } };

const encriptarContrasena = async (contrasena) => bcrypt.hash(contrasena, 10);

const obtenerTodos = async (usuarioId, rol) => {
  if (rol === 'administrador') return Instruido.findAll(ATRIBUTOS_SEGUROS);
  return Instruido.findAll({ ...ATRIBUTOS_SEGUROS, where: { entrenadorId: usuarioId } });
};

const obtenerPorId = async (id, usuarioId, rol) => {
  if (rol === 'administrador') return Instruido.findByPk(id, ATRIBUTOS_SEGUROS);
  return Instruido.findOne({ ...ATRIBUTOS_SEGUROS, where: { id, entrenadorId: usuarioId } });
};

const crear = async (datos, entrenadorId) => {
  const datosCrear = { ...datos, entrenadorId };
  if (datos.contrasena) {
    datosCrear.contrasenaHash = await encriptarContrasena(datos.contrasena);
    delete datosCrear.contrasena;
  }
  const instruido = await Instruido.create(datosCrear);
  return Instruido.findByPk(instruido.id, ATRIBUTOS_SEGUROS);
};

const actualizar = async (id, datos, usuarioId, rol) => {
  const where = rol === 'administrador' ? { id } : { id, entrenadorId: usuarioId };
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const datosActualizar = {};
  if (datos.nombre) datosActualizar.nombre = datos.nombre;
  if (datos.email) datosActualizar.email = datos.email;
  if (datos.edad) datosActualizar.edad = datos.edad;
  if (datos.peso) datosActualizar.peso = datos.peso;
  if (datos.altura) datosActualizar.altura = datos.altura;
  if (datos.sexo) datosActualizar.sexo = datos.sexo;
  if (datos.nivelActividad) datosActualizar.nivelActividad = datos.nivelActividad;
  if (datos.propositoEntrenamiento !== undefined) datosActualizar.propositoEntrenamiento = datos.propositoEntrenamiento;
  if (datos.diasDisponibles !== undefined) datosActualizar.diasDisponibles = datos.diasDisponibles;
  if (datos.activo !== undefined) datosActualizar.activo = datos.activo;
  if (datos.entrenadorId !== undefined) datosActualizar.entrenadorId = datos.entrenadorId;
  if (datos.contrasena) {
    datosActualizar.contrasenaHash = await encriptarContrasena(datos.contrasena);
  }
  await instruido.update(datosActualizar);
  return Instruido.findByPk(id, ATRIBUTOS_SEGUROS);
};

const eliminar = async (id, usuarioId, rol) => {
  const where = rol === 'administrador' ? { id } : { id, entrenadorId: usuarioId };
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  return instruido.destroy();
};

const obtenerPorIdPropio = async (id) => Instruido.findByPk(id, ATRIBUTOS_SEGUROS);

const actualizarPropio = async (id, datos) => {
  const instruido = await Instruido.findByPk(id);
  if (!instruido) return null;
  const datosActualizar = {};
  if (datos.nombre) datosActualizar.nombre = datos.nombre;
  if (datos.email) datosActualizar.email = datos.email;
  if (datos.contrasena) datosActualizar.contrasenaHash = await encriptarContrasena(datos.contrasena);
  await instruido.update(datosActualizar);
  return Instruido.findByPk(id, ATRIBUTOS_SEGUROS);
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, obtenerPorIdPropio, actualizarPropio };
