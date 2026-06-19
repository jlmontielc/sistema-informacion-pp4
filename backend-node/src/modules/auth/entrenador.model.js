const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Entrenador = sequelize.define('Entrenador', {
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  especialidad: { type: DataTypes.STRING(100) },
}, {
  underscored: true,
  tableName: 'entrenadores',
});

module.exports = { Entrenador };
