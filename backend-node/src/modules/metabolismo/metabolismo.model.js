const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const CalculoMetabolico = sequelize.define('CalculoMetabolico', {
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id',
  },
  tmb: {
    type: DataTypes.DECIMAL(7, 2),
    allowNull: false,
  },
  gct: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  nivelActividadUsado: {
    type: DataTypes.STRING(20),
    field: 'nivel_actividad_usado',
  },
  pesoUsado: {
    type: DataTypes.DECIMAL(5, 2),
    field: 'peso_usado',
  },
  fechaCalculo: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'fecha_calculo',
  },
}, {
  underscored: true,
  tableName: 'calculos_metabolicos',
  timestamps: false,
});

module.exports = { CalculoMetabolico };
