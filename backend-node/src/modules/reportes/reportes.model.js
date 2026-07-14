const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Rendimiento = sequelize.define('Rendimiento', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  peso: { type: DataTypes.DECIMAL(5, 2) },
  repeticionesTotales: { type: DataTypes.INTEGER, field: 'repeticiones_totales' },
  cargaTotalKg: { type: DataTypes.DECIMAL(7, 2), field: 'carga_total_kg' },
  imc: { type: DataTypes.DECIMAL(5, 2) },
  observaciones: { type: DataTypes.TEXT },
}, {
  underscored: true,
  tableName: 'rendimiento',
});

module.exports = { Rendimiento };
