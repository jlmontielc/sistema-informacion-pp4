const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Rutina = sequelize.define('Rutina', {
  clienteId: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false },
  ejercicios: { type: DataTypes.JSONB, defaultValue: [] },
  frecuencia: { type: DataTypes.STRING },
  duracionSemanas: { type: DataTypes.INTEGER },
  observaciones: { type: DataTypes.TEXT },
});

module.exports = { Rutina };
