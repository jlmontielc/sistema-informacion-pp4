const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Dieta = sequelize.define('Dieta', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  objetivoCalorico: { type: DataTypes.INTEGER, field: 'objetivo_calorico' },
  proteinas: { type: DataTypes.FLOAT },
  carbohidratos: { type: DataTypes.FLOAT },
  grasas: { type: DataTypes.FLOAT },
  planSemanal: { type: DataTypes.JSONB, defaultValue: {}, field: 'plan_semanal' },
}, {
  underscored: true,
  tableName: 'planes_dieta',
});

module.exports = { Dieta };
