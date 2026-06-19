const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Entrenador } = require('./entrenador.model');
const config = require('../../shared/constants');

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const generateToken = (entrenador) => jwt.sign(
  { id: entrenador.id, email: entrenador.email, nombre: entrenador.nombre },
  config.JWT_SECRET,
  { expiresIn: config.JWT_EXPIRES_IN },
);

const register = async (data) => {
  const exists = await Entrenador.findOne({ where: { email: data.email } });
  if (exists) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }
  const passwordHash = await hashPassword(data.password);
  const entrenador = await Entrenador.create({
    nombre: data.nombre,
    email: data.email,
    passwordHash,
    especialidad: data.especialidad || null,
  });
  const token = generateToken(entrenador);
  return { token, user: { id: entrenador.id, nombre: entrenador.nombre, email: entrenador.email, especialidad: entrenador.especialidad } };
};

const login = async (data) => {
  const entrenador = await Entrenador.findOne({ where: { email: data.email } });
  if (!entrenador) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }
  const valid = await comparePassword(data.password, entrenador.passwordHash);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }
  const token = generateToken(entrenador);
  return { token, user: { id: entrenador.id, nombre: entrenador.nombre, email: entrenador.email, especialidad: entrenador.especialidad } };
};

const getProfile = async (entrenadorId) => {
  const entrenador = await Entrenador.findByPk(entrenadorId, {
    attributes: { exclude: ['passwordHash'] },
  });
  if (!entrenador) {
    const err = new Error('Entrenador no encontrado');
    err.status = 404;
    throw err;
  }
  return entrenador;
};

const updateProfile = async (entrenadorId, data) => {
  const entrenador = await Entrenador.findByPk(entrenadorId);
  if (!entrenador) {
    const err = new Error('Entrenador no encontrado');
    err.status = 404;
    throw err;
  }
  const updateData = {};
  if (data.nombre) updateData.nombre = data.nombre;
  if (data.especialidad) updateData.especialidad = data.especialidad;
  if (data.password) updateData.passwordHash = await hashPassword(data.password);
  await entrenador.update(updateData);
  const updated = await Entrenador.findByPk(entrenadorId, {
    attributes: { exclude: ['passwordHash'] },
  });
  return updated;
};

module.exports = { register, login, getProfile, updateProfile };
