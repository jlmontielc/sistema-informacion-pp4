const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Rendimiento = sequelize.define('Rendimiento', {
  clienteId: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  peso: { type: DataTypes.FLOAT },
  repeticiones: { type: DataTypes.INTEGER },
  carga: { type: DataTypes.FLOAT },
  observaciones: { type: DataTypes.TEXT },
});

module.exports = { Rendimiento };
