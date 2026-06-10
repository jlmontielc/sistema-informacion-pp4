const { Dieta } = require('./dietas.model');

const findAll = async () => Dieta.findAll();
const create = async (data) => Dieta.create(data);

module.exports = { findAll, create };
