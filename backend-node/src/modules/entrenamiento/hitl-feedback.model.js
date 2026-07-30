const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const HitlFeedback = sequelize.define('HitlFeedback', {
  rutinaSugeridaId: {
    type: DataTypes.INTEGER,
    field: 'rutina_sugerida_id',
  },
  entrenadorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'entrenador_id',
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'cliente_id',
  },
  accion: {
    type: DataTypes.ENUM('aprobada', 'rechazada', 'modificada'),
    allowNull: false,
  },
  rutinaOriginal: {
    type: DataTypes.JSON,
    field: 'rutina_original',
  },
  rutinaFinal: {
    type: DataTypes.JSON,
    field: 'rutina_final',
  },
  ejerciciosAgregados: {
    type: DataTypes.JSON,
    field: 'ejercicios_agregados',
  },
  ejerciciosEliminados: {
    type: DataTypes.JSON,
    field: 'ejercicios_eliminados',
  },
  modificacionCargas: {
    type: DataTypes.JSON,
    field: 'modificacion_cargas',
  },
  confianzaIa: {
    type: DataTypes.DECIMAL(3, 2),
    field: 'confianza_ia',
  },
  tiempoRevisionSeg: {
    type: DataTypes.INTEGER,
    field: 'tiempo_revision_seg',
  },
  observaciones: DataTypes.TEXT,
}, {
  underscored: true,
  tableName: 'feedback_hitl',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = { HitlFeedback };
