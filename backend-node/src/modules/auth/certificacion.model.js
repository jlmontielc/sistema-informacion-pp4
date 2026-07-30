const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Certificacion = sequelize.define('Certificacion', {
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  institucion: { type: DataTypes.STRING(150) },
  fechaObtencion: { type: DataTypes.DATEONLY, field: 'fecha_obtencion' },
  fechaExpiracion: { type: DataTypes.DATEONLY, field: 'fecha_expiracion' },
  descripcion: { type: DataTypes.TEXT },
  imagenUrl: { type: DataTypes.STRING(500), field: 'imagen_url' },
}, {
  underscored: true,
  tableName: 'certificaciones',
});

module.exports = { Certificacion };
