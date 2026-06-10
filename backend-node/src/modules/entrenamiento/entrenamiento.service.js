const { Rutina } = require('./entrenamiento.model');

const findAll = async () => Rutina.findAll();
const create = async (data) => Rutina.create(data);

module.exports = { findAll, create };
