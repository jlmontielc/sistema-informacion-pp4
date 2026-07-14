const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Instruido = sequelize.define('Instruido', {
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true },
  contrasenaHash: { type: DataTypes.STRING(255), field: 'password_hash' },
  edad: { type: DataTypes.INTEGER, allowNull: false },
  peso: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  altura: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  sexo: { type: DataTypes.ENUM('masculino', 'femenino'), allowNull: false },
  nivelActividad: {
    type: DataTypes.ENUM('sedentario', 'ligero', 'moderado', 'activo', 'muy_activo'),
    allowNull: false,
    field: 'nivel_actividad',
  },
  propositoEntrenamiento: { type: DataTypes.TEXT, field: 'proposito_entrenamiento' },
  diasDisponibles: { type: DataTypes.INTEGER, field: 'dias_disponibles' },
  fechaRegistro: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW, field: 'fecha_registro' },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  entrenadorId: { type: DataTypes.INTEGER, allowNull: true, field: 'entrenador_id' },
  rol: { type: DataTypes.STRING(20), defaultValue: 'instruido' },
}, {
  underscored: true,
  tableName: 'instruidos',
});

module.exports = { Instruido };
