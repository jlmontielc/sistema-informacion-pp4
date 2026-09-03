const { Entrenador } = require('../../modules/auth/entrenador.model');
const { Instruido } = require('../../modules/instruidos/instruido.model');
const { PerfilMedico } = require('../../modules/instruidos/perfil-medico.model');
const { Certificacion } = require('../../modules/auth/certificacion.model');
const { HitlFeedback } = require('../../modules/entrenamiento/hitl-feedback.model');
const { CalculoMetabolico } = require('../../modules/metabolismo/metabolismo.model');
const { Ejercicio, PlantillaEntrenamiento, RutinaAsignada, RegistroEntrenamiento } = require('../../modules/entrenamiento/entrenamiento.model');
const { SerieEjecutada } = require('../../modules/entrenamiento/series-ejecutadas.model');
const { Dieta } = require('../../modules/dietas/dietas.model');
const { PlanPago, MetodoPago, ConfiguracionPago, Pago } = require('../../modules/pagos/pagos.model');

Entrenador.hasMany(Instruido, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(PlantillaEntrenamiento, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(RutinaAsignada, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(Certificacion, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(PlanPago, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(MetodoPago, { foreignKey: 'entrenadorId' });
Entrenador.hasOne(ConfiguracionPago, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(Pago, { foreignKey: 'entrenadorId' });

Instruido.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });
Instruido.hasOne(PerfilMedico, { foreignKey: 'instruidoId' });
Instruido.hasMany(RutinaAsignada, { foreignKey: 'instruidoId' });
Instruido.hasMany(RegistroEntrenamiento, { foreignKey: 'instruidoId' });

Certificacion.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });

PerfilMedico.belongsTo(Instruido, { foreignKey: 'instruidoId' });

PlantillaEntrenamiento.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });

RutinaAsignada.belongsTo(Instruido, { foreignKey: 'instruidoId' });
RutinaAsignada.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });
RutinaAsignada.belongsTo(PlantillaEntrenamiento, { foreignKey: 'plantillaOrigenId', as: 'plantillaOrigen' });

RegistroEntrenamiento.belongsTo(RutinaAsignada, { foreignKey: 'rutinaAsignadaId' });
RegistroEntrenamiento.belongsTo(Instruido, { foreignKey: 'instruidoId' });
RegistroEntrenamiento.hasMany(SerieEjecutada, { foreignKey: 'registroEntrenamientoId', as: 'series' });

SerieEjecutada.belongsTo(RegistroEntrenamiento, { foreignKey: 'registroEntrenamientoId' });
SerieEjecutada.belongsTo(Ejercicio, { foreignKey: 'ejercicioId', as: 'ejercicio' });
Ejercicio.hasMany(SerieEjecutada, { foreignKey: 'ejercicioId' });

Instruido.hasMany(CalculoMetabolico, { foreignKey: 'clienteId', as: 'calculosMetabolicos' });
CalculoMetabolico.belongsTo(Instruido, { as: 'instruido', foreignKey: 'clienteId' });

Instruido.hasMany(Pago, { foreignKey: 'instruidoId' });
Pago.belongsTo(Instruido, { foreignKey: 'instruidoId' });

PlanPago.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });
MetodoPago.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });
ConfiguracionPago.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });
Pago.belongsTo(Entrenador, { foreignKey: 'entrenadorId' });

PlanPago.hasMany(Pago, { foreignKey: 'planId' });
Pago.belongsTo(PlanPago, { as: 'plan', foreignKey: 'planId' });

MetodoPago.hasMany(Pago, { foreignKey: 'metodoPagoId' });
Pago.belongsTo(MetodoPago, { as: 'metodo', foreignKey: 'metodoPagoId' });

Instruido.hasMany(Dieta, { foreignKey: 'clienteId', as: 'dietas' });
Dieta.belongsTo(Instruido, { foreignKey: 'clienteId', as: 'instruido' });

Entrenador.hasMany(Dieta, { foreignKey: 'entrenadorId', as: 'dietas' });
Dieta.belongsTo(Entrenador, { foreignKey: 'entrenadorId', as: 'entrenador' });

module.exports = {
  Entrenador, Instruido, PerfilMedico, Certificacion,
  Ejercicio, PlantillaEntrenamiento, RutinaAsignada, RegistroEntrenamiento, SerieEjecutada,
  HitlFeedback, CalculoMetabolico, Dieta,
  PlanPago, MetodoPago, ConfiguracionPago, Pago,
};
