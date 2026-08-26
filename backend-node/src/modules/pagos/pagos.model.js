const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const PlanPago = sequelize.define('PlanPago', {
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  ofrecimiento: {
    type: DataTypes.ENUM('entrenamiento', 'dietas', 'ambos'),
    allowNull: false,
    defaultValue: 'entrenamiento',
  },
  montoUsd: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'monto_usd' },
  diasVigencia: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30, field: 'dias_vigencia' },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  underscored: true,
  tableName: 'planes_pago',
});

const MetodoPago = sequelize.define('MetodoPago', {
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  tipo: {
    type: DataTypes.ENUM('pago_movil', 'transferencia', 'zelle', 'binance', 'otro'),
    allowNull: false,
  },
  datos: { type: DataTypes.JSON, allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  underscored: true,
  tableName: 'metodos_pago',
});

const ConfiguracionPago = sequelize.define('ConfiguracionPago', {
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: 'entrenador_id' },
  tasaCambio: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 40.0000, field: 'tasa_cambio' },
}, {
  underscored: true,
  tableName: 'configuracion_pagos',
});

const Pago = sequelize.define('Pago', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  planId: { type: DataTypes.INTEGER, allowNull: false, field: 'plan_id' },
  metodoPagoId: { type: DataTypes.INTEGER, allowNull: false, field: 'metodo_pago_id' },
  montoUsd: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'monto_usd' },
  montoBs: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'monto_bs' },
  tasaAplicada: { type: DataTypes.DECIMAL(10, 4), allowNull: false, field: 'tasa_aplicada' },
  referencia: { type: DataTypes.STRING(100), allowNull: false },
  fechaPago: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha_pago' },
  comprobante: { type: DataTypes.TEXT('long'), allowNull: false },
  comprobanteMime: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'image/jpeg', field: 'comprobante_mime' },
  estado: {
    type: DataTypes.ENUM('pendiente', 'verificado', 'rechazado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
  comentarioRechazo: { type: DataTypes.STRING(255), allowNull: true, field: 'comentario_rechazo' },
  verificadoPor: { type: DataTypes.INTEGER, allowNull: true, field: 'verificado_por' },
  fechaVerificacion: { type: DataTypes.DATE, allowNull: true, field: 'fecha_verificacion' },
  fechaInicio: { type: DataTypes.DATEONLY, allowNull: true, field: 'fecha_inicio' },
  fechaFin: { type: DataTypes.DATEONLY, allowNull: true, field: 'fecha_fin' },
  errorPrediccionIa: { type: DataTypes.TEXT, allowNull: true, field: 'error_prediccion_ia' },
}, {
  underscored: true,
  tableName: 'pagos',
});

module.exports = { PlanPago, MetodoPago, ConfiguracionPago, Pago };
