const { DataTypes } = require('sequelize');
const { sequelize } = require('../../shared/database/connection');

const Ejercicio = sequelize.define('Ejercicio', {
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: DataTypes.TEXT,
  grupoMuscular: { type: DataTypes.STRING(50), field: 'grupo_muscular' },
  equipoNecesario: { type: DataTypes.STRING(100), field: 'equipo_necesario' },
  dificultad: { type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado'), defaultValue: 'principiante' },
  contraindicaLesiones: { type: DataTypes.TEXT, field: 'contraindica_lesiones' },
}, {
  underscored: true,
  tableName: 'ejercicios',
});

const PlantillaEntrenamiento = sequelize.define('PlantillaEntrenamiento', {
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: DataTypes.TEXT,
  tipo: {
    type: DataTypes.ENUM('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad'),
    allowNull: false,
  },
  ejercicios: { type: DataTypes.JSON, allowNull: false },
  frecuenciaSemanal: { type: DataTypes.INTEGER, field: 'frecuencia_semanal' },
  duracionSemanas: { type: DataTypes.INTEGER, field: 'duracion_semanas' },
  objetivo: { type: DataTypes.ENUM('perdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento', 'rehabilitacion') },
  nivelDificultad: { type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado'), field: 'nivel_dificultad' },
  activa: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  underscored: true,
  tableName: 'plantillas_entrenamiento',
});

const RutinaAsignada = sequelize.define('RutinaAsignada', {
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  plantillaOrigenId: { type: DataTypes.INTEGER, field: 'plantilla_origen_id' },
  entrenadorId: { type: DataTypes.INTEGER, allowNull: false, field: 'entrenador_id' },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  tipo: {
    type: DataTypes.ENUM('fuerza', 'hipertrofia', 'resistencia', 'cardio', 'funcional', 'flexibilidad'),
    allowNull: false,
  },
  ejercicios: { type: DataTypes.JSON, allowNull: false },
  frecuenciaSemanal: { type: DataTypes.INTEGER, field: 'frecuencia_semanal' },
  duracionSemanas: { type: DataTypes.INTEGER, field: 'duracion_semanas' },
  observaciones: DataTypes.TEXT,
  personalizadaPorEntrenador: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'personalizada_por_entrenador' },
  fechaInicio: { type: DataTypes.DATEONLY, field: 'fecha_inicio' },
  fechaFin: { type: DataTypes.DATEONLY, field: 'fecha_fin' },
  activa: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  underscored: true,
  tableName: 'rutinas_asignadas',
});

const RegistroEntrenamiento = sequelize.define('RegistroEntrenamiento', {
  rutinaAsignadaId: { type: DataTypes.INTEGER, allowNull: false, field: 'rutina_asignada_id' },
  instruidoId: { type: DataTypes.INTEGER, allowNull: false, field: 'cliente_id' },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  ejerciciosRealizados: { type: DataTypes.JSON, allowNull: false, field: 'ejercicios_realizados' },
  duracionMinutos: { type: DataTypes.INTEGER, field: 'duracion_minutos' },
  percepcionEsfuerzo: { type: DataTypes.TINYINT, field: 'percepcion_esfuerzo' },
  observaciones: DataTypes.TEXT,
}, {
  underscored: true,
  tableName: 'registro_entrenamiento',
  timestamps: false,
});

module.exports = { Ejercicio, PlantillaEntrenamiento, RutinaAsignada, RegistroEntrenamiento };
