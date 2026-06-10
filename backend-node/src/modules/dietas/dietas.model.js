const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Dieta = sequelize.define('Dieta', {
  clienteId: { type: DataTypes.INTEGER, allowNull: false },
  objetivoCalorico: { type: DataTypes.INTEGER },
  proteinas: { type: DataTypes.FLOAT },
  carbohidratos: { type: DataTypes.FLOAT },
  grasas: { type: DataTypes.FLOAT },
  planSemanal: { type: DataTypes.JSONB, defaultValue: {} },
});

module.exports = { Dieta };
