const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Dieta = sequelize.define('Dieta', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  objetivoCalorico: { type: DataTypes.INTEGER, field: 'objetivo_calorico' },
  proteinas: { type: DataTypes.DECIMAL(7, 2), field: 'proteinas_gramos' },
  carbohidratos: { type: DataTypes.DECIMAL(7, 2), field: 'carbohidratos_gramos' },
  grasas: { type: DataTypes.DECIMAL(7, 2), field: 'grasas_gramos' },
  observaciones: { type: DataTypes.TEXT },
  fechaInicio: { type: DataTypes.DATEONLY, field: 'fecha_inicio' },
  fechaFin: { type: DataTypes.DATEONLY, field: 'fecha_fin' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  underscored: true,
  tableName: 'planes_dieta',
});

module.exports = { Dieta };
