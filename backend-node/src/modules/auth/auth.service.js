const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Entrenador } = require('./entrenador.model');
const { Instruido } = require('../instruidos/instruido.model');
const config = require('../../shared/constants');

const encriptarContrasena = async (contrasena) => bcrypt.hash(contrasena, 10);

const verificarContrasena = async (contrasena, hash) => bcrypt.compare(contrasena, hash);

const generarPayload = (usuario, tipo) => ({
  id: usuario.id,
  email: usuario.email,
  nombre: usuario.nombre,
  rol: usuario.rol,
  tipo,
});

const generarAccessToken = (usuario, tipo) => jwt.sign(
  generarPayload(usuario, tipo),
  config.JWT_SECRET,
  { expiresIn: '15m' },
);

const generarRefreshToken = (usuario, tipo) => jwt.sign(
  generarPayload(usuario, tipo),
  config.JWT_SECRET,
  { expiresIn: config.JWT_REFRESH_EXPIRES_IN },
);

const buscarUsuario = async (id, tipo) => {
  if (tipo === 'entrenador') return Entrenador.findByPk(id);
  return Instruido.findByPk(id);
};

const iniciarSesion = async (datos) => {
  let usuario = await Entrenador.findOne({ where: { email: datos.email } });
  let tipo = 'entrenador';

  if (!usuario) {
    usuario = await Instruido.findOne({ where: { email: datos.email } });
    tipo = 'instruido';
  }

  if (!usuario) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const valido = await verificarContrasena(datos.contrasena, usuario.contrasenaHash);
  if (!valido) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const accessToken = generarAccessToken(usuario, tipo);
  const refreshToken = generarRefreshToken(usuario, tipo);
  const respuesta = {
    accessToken,
    refreshToken,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      tipo,
    },
  };
  if (tipo === 'entrenador') {
    respuesta.usuario.especialidad = usuario.especialidad;
  }
  return respuesta;
};

const registrar = async (datos, usuarioSolicitante) => {
  if (datos.rol === 'administrador' || datos.rol === 'entrenador') {
    if (!usuarioSolicitante || usuarioSolicitante.rol !== 'administrador') {
      const err = new Error('Solo un administrador puede crear administradores o entrenadores');
      err.status = 403;
      throw err;
    }
    const existe = await Entrenador.findOne({ where: { email: datos.email } });
    if (existe) {
      const err = new Error('El email ya está registrado');
      err.status = 409;
      throw err;
    }
    const contrasenaHash = await encriptarContrasena(datos.contrasena);
    const entrenador = await Entrenador.create({
      nombre: datos.nombre,
      email: datos.email,
      contrasenaHash,
      especialidad: datos.especialidad || null,
      rol: datos.rol,
    });
    const accessToken = generarAccessToken(entrenador, 'entrenador');
    const refreshToken = generarRefreshToken(entrenador, 'entrenador');
    return {
      accessToken,
      refreshToken,
      usuario: {
        id: entrenador.id, nombre: entrenador.nombre, email: entrenador.email,
        rol: entrenador.rol, tipo: 'entrenador', especialidad: entrenador.especialidad,
      },
    };
  }

  const existe = await Instruido.findOne({ where: { email: datos.email } });
  if (existe) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const entrenadorId = usuarioSolicitante ? usuarioSolicitante.id : null;
  const contrasenaHash = await encriptarContrasena(datos.contrasena);
  const instruido = await Instruido.create({
    nombre: datos.nombre,
    email: datos.email,
    contrasenaHash,
    edad: datos.edad,
    peso: datos.peso,
    altura: datos.altura,
    sexo: datos.sexo,
    nivelActividad: datos.nivelActividad,
    propositoEntrenamiento: datos.propositoEntrenamiento || null,
    diasDisponibles: datos.diasDisponibles || null,
    entrenadorId,
    rol: 'instruido',
  });
  const accessToken = generarAccessToken(instruido, 'instruido');
  const refreshToken = generarRefreshToken(instruido, 'instruido');
  return {
    accessToken,
    refreshToken,
    usuario: {
      id: instruido.id, nombre: instruido.nombre, email: instruido.email,
      rol: instruido.rol, tipo: 'instruido',
    },
  };
};

const refrescarToken = async (token) => {
  let decodificado;
  try {
    decodificado = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    const error = new Error('Refresh token inválido o expirado');
    error.status = 401;
    throw error;
  }
  const usuario = await buscarUsuario(decodificado.id, decodificado.tipo);
  if (!usuario || usuario.rol !== decodificado.rol) {
    const err = new Error('Refresh token inválido');
    err.status = 401;
    throw err;
  }
  const accessToken = generarAccessToken(usuario, decodificado.tipo);
  const refreshToken = generarRefreshToken(usuario, decodificado.tipo);
  return { accessToken, refreshToken };
};

const obtenerPerfil = async (usuarioId, tipo) => {
  if (tipo === 'entrenador') {
    const entrenador = await Entrenador.findByPk(usuarioId, {
      attributes: { exclude: ['contrasenaHash'] },
    });
    if (!entrenador) {
      const err = new Error('Entrenador no encontrado');
      err.status = 404;
      throw err;
    }
    return entrenador;
  }
  const instruido = await Instruido.findByPk(usuarioId, {
    attributes: { exclude: ['contrasenaHash'] },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado');
    err.status = 404;
    throw err;
  }
  return instruido;
};

const actualizarPerfil = async (usuarioId, tipo, datos) => {
  if (tipo === 'entrenador') {
    const entrenador = await Entrenador.findByPk(usuarioId);
    if (!entrenador) {
      const err = new Error('Entrenador no encontrado');
      err.status = 404;
      throw err;
    }
    const datosActualizar = {};
    if (datos.nombre) datosActualizar.nombre = datos.nombre;
    if (datos.especialidad) datosActualizar.especialidad = datos.especialidad;
    if (datos.contrasena) datosActualizar.contrasenaHash = await encriptarContrasena(datos.contrasena);
    await entrenador.update(datosActualizar);
    return Entrenador.findByPk(usuarioId, { attributes: { exclude: ['contrasenaHash'] } });
  }

  const instruido = await Instruido.findByPk(usuarioId);
  if (!instruido) {
    const err = new Error('Instruido no encontrado');
    err.status = 404;
    throw err;
  }
  const datosActualizar = {};
  if (datos.nombre) datosActualizar.nombre = datos.nombre;
  if (datos.email) datosActualizar.email = datos.email;
  if (datos.contrasena) datosActualizar.contrasenaHash = await encriptarContrasena(datos.contrasena);
  await instruido.update(datosActualizar);
  return Instruido.findByPk(usuarioId, { attributes: { exclude: ['contrasenaHash'] } });
};

module.exports = { iniciarSesion, registrar, refrescarToken, obtenerPerfil, actualizarPerfil };
