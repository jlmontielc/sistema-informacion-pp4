const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Cliente = sequelize.define('Cliente', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  edad: { type: DataTypes.INTEGER, allowNull: false },
  peso: { type: DataTypes.FLOAT, allowNull: false },
  altura: { type: DataTypes.FLOAT, allowNull: false },
  sexo: { type: DataTypes.ENUM('masculino', 'femenino'), allowNull: false },
  nivelActividad: { type: DataTypes.STRING, allowNull: false },
  propositoEntrenamiento: { type: DataTypes.TEXT },
  diasDisponibles: { type: DataTypes.INTEGER },
  historialMedico: { type: DataTypes.TEXT },
});

module.exports = { Cliente };
