const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const SerieEjecutada = sequelize.define('SerieEjecutada', {
  registroEntrenamientoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'registro_entrenamiento_id',
  },
  ejercicioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ejercicio_id',
  },
  numeroSerie: {
    type: DataTypes.TINYINT,
    allowNull: false,
    field: 'numero_serie',
  },
  repeticionesRealizadas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'repeticiones_realizadas',
  },
  pesoKg: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    field: 'peso_kg',
  },
  descansoSegundos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'descanso_segundos',
  },
  rpe: { type: DataTypes.TINYINT },
  notas: DataTypes.TEXT,
}, {
  underscored: true,
  tableName: 'series_ejecutadas',
  timestamps: false,
});

module.exports = { SerieEjecutada };
