const { Entrenador } = require('../../modules/auth/entrenador.model');
const { Instruido } = require('../../modules/instruidos/instruido.model');
const { PerfilMedico } = require('../../modules/instruidos/perfil-medico.model');
const { Certificacion } = require('../../modules/auth/certificacion.model');
const { HitlFeedback } = require('../../modules/entrenamiento/hitl-feedback.model');
const { CalculoMetabolico } = require('../../modules/metabolismo/metabolismo.model');
const { Ejercicio, PlantillaEntrenamiento, RutinaAsignada, RegistroEntrenamiento } = require('../../modules/entrenamiento/entrenamiento.model');

Entrenador.hasMany(Instruido, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(PlantillaEntrenamiento, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(RutinaAsignada, { foreignKey: 'entrenadorId' });
Entrenador.hasMany(Certificacion, { foreignKey: 'entrenadorId' });

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

Instruido.hasMany(CalculoMetabolico, { foreignKey: 'clienteId', as: 'calculosMetabolicos' });
CalculoMetabolico.belongsTo(Instruido, { as: 'instruido', foreignKey: 'clienteId' });

module.exports = {
  Entrenador, Instruido, PerfilMedico, Certificacion,
  Ejercicio, PlantillaEntrenamiento, RutinaAsignada, RegistroEntrenamiento,
  HitlFeedback, CalculoMetabolico,
};
