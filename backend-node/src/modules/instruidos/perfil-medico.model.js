const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const PerfilMedico = sequelize.define('PerfilMedico', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'cliente_id' },
  alergias: { type: DataTypes.TEXT, field: 'alergias' },
  intolerancias: { type: DataTypes.TEXT, field: 'intolerancias' },
  lesiones: { type: DataTypes.TEXT, field: 'lesiones' },
  condicionesPreexistentes: { type: DataTypes.TEXT, field: 'condiciones_preexistentes' },
  medicacionActual: { type: DataTypes.TEXT, field: 'medicacion_actual' },
  observaciones: { type: DataTypes.TEXT },
}, {
  underscored: true,
  tableName: 'perfil_medico',
});

module.exports = { PerfilMedico };
