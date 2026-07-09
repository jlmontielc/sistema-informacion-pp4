const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Rendimiento = sequelize.define('Rendimiento', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  peso: { type: DataTypes.FLOAT },
  repeticiones: { type: DataTypes.INTEGER },
  carga: { type: DataTypes.FLOAT },
  observaciones: { type: DataTypes.TEXT },
}, {
  underscored: true,
  tableName: 'rendimiento',
});

module.exports = { Rendimiento };
