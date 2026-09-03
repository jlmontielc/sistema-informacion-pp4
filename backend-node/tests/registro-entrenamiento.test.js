const service = require('../src/modules/entrenamiento/registro-entrenamiento.service');

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => {
  const crearModeloMock = () => ({
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  });
  return {
    Ejercicio: crearModeloMock(),
    PlantillaEntrenamiento: crearModeloMock(),
    RutinaAsignada: crearModeloMock(),
    RegistroEntrenamiento: crearModeloMock(),
  };
});

jest.mock('../src/modules/entrenamiento/series-ejecutadas.model', () => {
  const crearModeloMock = () => ({
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  });
  return { SerieEjecutada: crearModeloMock() };
});

jest.mock('../src/modules/instruidos/instruido.model', () => {
  const crearModeloMock = () => ({
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  });
  return { Instruido: crearModeloMock() };
});

const { RegistroEntrenamiento, RutinaAsignada, Ejercicio } = require('../src/modules/entrenamiento/entrenamiento.model');
const { SerieEjecutada } = require('../src/modules/entrenamiento/series-ejecutadas.model');
const { Instruido } = require('../src/modules/instruidos/instruido.model');

const crearMockModelo = (sobreescribir = {}) => {
  const modelo = {
    id: 1,
    destroy: jest.fn().mockResolvedValue(undefined),
    ...sobreescribir,
  };
  modelo.update = jest.fn(function actualizar(campos) {
    Object.assign(this, campos);
    return Promise.resolve(this);
  });
  return modelo;
};

const crearUsuario = (rol, id = 1) => ({
  id,
  email: `${rol}@test.com`,
  nombre: `Usuario ${rol}`,
  rol,
  tipo: rol === 'instruido' ? 'instruido' : 'entrenador',
});

const resetearMocks = () => {
  RegistroEntrenamiento.findByPk.mockReset();
  RegistroEntrenamiento.findAll.mockReset();
  RegistroEntrenamiento.create.mockReset();
  RutinaAsignada.findByPk.mockReset();
  RutinaAsignada.findAll.mockReset();
  RutinaAsignada.findOne.mockReset();
  SerieEjecutada.findAll.mockReset();
  SerieEjecutada.findOne.mockReset();
  SerieEjecutada.create.mockReset();
  Instruido.findOne.mockReset();
  Instruido.findByPk.mockReset();
  Ejercicio.findByPk.mockReset();
};

describe('Registro de entrenamiento - series en tiempo real', () => {
  beforeEach(resetearMocks);

  describe('iniciar sesión', () => {
    test('instruido puede iniciar una sesión propia', async () => {
      const usuario = crearUsuario('instruido');
      const rutina = crearMockModelo({
        id: 10,
        instruidoId: usuario.id,
        entrenadorId: 2,
        ejercicios: [{ ejercicio_id: 1 }],
      });

      const nuevoRegistro = crearMockModelo({
        id: 100,
        rutinaAsignadaId: 10,
        instruidoId: usuario.id,
        estado: 'en_progreso',
      });

      RutinaAsignada.findOne.mockResolvedValue(rutina);
      RegistroEntrenamiento.create.mockResolvedValue(nuevoRegistro);

      const resultado = await service.iniciar(usuario, { rutinaAsignadaId: 10 });

      expect(RutinaAsignada.findOne).toHaveBeenCalledWith({ where: { id: 10, instruidoId: 1 } });
      expect(RegistroEntrenamiento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rutinaAsignadaId: 10,
          instruidoId: 1,
          estado: 'en_progreso',
          observaciones: null,
        }),
      );
      expect(resultado.estado).toBe('en_progreso');
    });

    test('instruido no puede iniciar sesión de otro instruido', async () => {
      const usuario = crearUsuario('instruido', 1);
      const rutina = crearMockModelo({
        id: 10,
        instruidoId: 2,
        entrenadorId: 3,
        ejercicios: [{ ejercicio_id: 1 }],
      });

      RutinaAsignada.findOne.mockResolvedValue(null);

      await expect(service.iniciar(usuario, { rutinaAsignadaId: 10 }))
        .rejects
        .toMatchObject({ status: 404, message: 'Rutina asignada no encontrada' });
    });

    test('entrenador puede iniciar sesión para su instruido', async () => {
      const usuario = crearUsuario('entrenador', 2);
      const instruido = crearMockModelo({ id: 5, entrenadorId: 2 });
      const rutina = crearMockModelo({
        id: 10,
        instruidoId: 5,
        entrenadorId: 2,
        ejercicios: [{ ejercicio_id: 1 }],
      });
      const nuevoRegistro = crearMockModelo({
        id: 100,
        rutinaAsignadaId: 10,
        instruidoId: 5,
        estado: 'en_progreso',
      });

      Instruido.findOne.mockResolvedValue(instruido);
      Instruido.findByPk.mockResolvedValue(instruido);
      RutinaAsignada.findOne.mockResolvedValue(rutina);
      RegistroEntrenamiento.create.mockResolvedValue(nuevoRegistro);

      const resultado = await service.iniciar(usuario, { rutinaAsignadaId: 10, instruidoId: 5 });

      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
      expect(resultado.estado).toBe('en_progreso');
    });

    test('entrenador requiere instruidoId', async () => {
      const usuario = crearUsuario('entrenador');

      await expect(service.iniciar(usuario, { rutinaAsignadaId: 10 }))
        .rejects
        .toMatchObject({ status: 400, message: 'instruidoId es requerido para iniciar el entrenamiento' });
    });
  });

  describe('agregar series', () => {
    test('crea serie cuando el registro está en progreso y el ejercicio pertenece a la rutina', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        rutinaAsignadaId: 10,
        estado: 'en_progreso',
      });
      const rutina = crearMockModelo({
        id: 10,
        ejercicios: [{ ejercicio_id: 1 }],
      });
      const serieCreada = crearMockModelo({ id: 50, registroEntrenamientoId: 100, ejercicioId: 1 });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      RutinaAsignada.findByPk.mockResolvedValue(rutina);
      SerieEjecutada.create.mockResolvedValue(serieCreada);

      const resultado = await service.crearSerie(100, usuario, {
        ejercicioId: 1,
        numeroSerie: 1,
        repeticionesRealizadas: 10,
        pesoKg: 50,
        descansoSegundos: 90,
      });

      expect(SerieEjecutada.create).toHaveBeenCalledWith(
        expect.objectContaining({
          registroEntrenamientoId: 100,
          ejercicioId: 1,
          numeroSerie: 1,
          repeticionesRealizadas: 10,
          pesoKg: 50,
          descansoSegundos: 90,
        }),
      );
      expect(resultado.ejercicioId).toBe(1);
    });

    test('rechaza serie si el ejercicio no está en la rutina', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        rutinaAsignadaId: 10,
        estado: 'en_progreso',
      });
      const rutina = crearMockModelo({
        id: 10,
        ejercicios: [{ ejercicio_id: 2 }],
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      RutinaAsignada.findByPk.mockResolvedValue(rutina);

      await expect(service.crearSerie(100, usuario, {
        ejercicioId: 1,
        numeroSerie: 1,
        repeticionesRealizadas: 10,
        pesoKg: 50,
        descansoSegundos: 90,
      })).rejects.toMatchObject({ status: 400, message: 'El ejercicio no pertenece a la rutina asignada' });
    });

    test('rechaza serie si el registro no está en progreso', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        rutinaAsignadaId: 10,
        estado: 'completado',
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);

      await expect(service.crearSerie(100, usuario, {
        ejercicioId: 1,
        numeroSerie: 1,
        repeticionesRealizadas: 10,
        pesoKg: 50,
        descansoSegundos: 90,
      })).rejects.toMatchObject({ status: 400, message: 'No se pueden modificar series de una sesión que no está en progreso' });
    });
  });

  describe('editar y eliminar series', () => {
    test('edita una serie en progreso', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        rutinaAsignadaId: 10,
        estado: 'en_progreso',
      });
      const serie = crearMockModelo({
        id: 50,
        registroEntrenamientoId: 100,
        ejercicioId: 1,
        pesoKg: 50,
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      SerieEjecutada.findOne.mockResolvedValue(serie);

      const resultado = await service.editarSerie(100, 50, usuario, { pesoKg: 55 });

      expect(serie.update).toHaveBeenCalledWith(expect.objectContaining({ pesoKg: 55 }));
      expect(resultado).toBe(serie);
    });

    test('elimina una serie en progreso', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        rutinaAsignadaId: 10,
        estado: 'en_progreso',
      });
      const serie = crearMockModelo({
        id: 50,
        registroEntrenamientoId: 100,
        ejercicioId: 1,
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      SerieEjecutada.findOne.mockResolvedValue(serie);

      const resultado = await service.eliminarSerie(100, 50, usuario);

      expect(serie.destroy).toHaveBeenCalled();
      expect(resultado.message).toBe('Serie eliminada correctamente');
    });
  });

  describe('finalizar sesión', () => {
    test('finaliza con duracionMinutos proporcionada', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        estado: 'en_progreso',
        fechaInicio: new Date('2026-09-03T10:00:00Z'),
        observaciones: null,
      });
      const series = [
        crearMockModelo({ ejercicioId: 1, pesoKg: 50, repeticionesRealizadas: 10 }),
        crearMockModelo({ ejercicioId: 1, pesoKg: 50, repeticionesRealizadas: 10 }),
      ];

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      SerieEjecutada.findAll.mockResolvedValue(series);

      const resultado = await service.finalizar(100, usuario, { duracionMinutos: 45 });

      expect(registro.update).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'completado',
          duracionMinutos: 45,
        }),
      );
      expect(resultado.estado).toBe('completado');
    });

    test('finaliza calculando duración desde fechaInicio', async () => {
      const usuario = crearUsuario('instruido');
      const unaHoraAtras = new Date(Date.now() - 60 * 60000);

      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        estado: 'en_progreso',
        fechaInicio: unaHoraAtras,
        observaciones: null,
      });
      const series = [];

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      SerieEjecutada.findAll.mockResolvedValue(series);

      const resultado = await service.finalizar(100, usuario, {});

      const llamada = registro.update.mock.calls[0][0];
      expect(llamada.estado).toBe('completado');
      expect(typeof llamada.duracionMinutos).toBe('number');
      expect(llamada.duracionMinutos).toBeGreaterThanOrEqual(60);
      expect(resultado.estado).toBe('completado');
    });
  });

  describe('cancelar sesión', () => {
    test('cancela una sesión en progreso', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        estado: 'en_progreso',
        observaciones: null,
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);

      const resultado = await service.cancelar(100, usuario, { observaciones: 'Me lastimé' });

      expect(registro.update).toHaveBeenCalledWith(
        expect.objectContaining({
          estado: 'cancelado',
          observaciones: 'Me lastimé',
        }),
      );
      expect(resultado.estado).toBe('cancelado');
    });

    test('no puede cancelar una sesión ya finalizada', async () => {
      const usuario = crearUsuario('instruido');
      const registro = crearMockModelo({
        id: 100,
        instruidoId: usuario.id,
        estado: 'completado',
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);

      await expect(service.cancelar(100, usuario, {}))
        .rejects
        .toMatchObject({ status: 400, message: 'Solo se pueden cancelar sesiones en progreso' });
    });
  });

  describe('restricciones de autorización', () => {
    test('instruido no puede ver registro de otro instruido', async () => {
      const usuario = crearUsuario('instruido', 1);
      const registro = crearMockModelo({
        id: 100,
        instruidoId: 2,
        estado: 'en_progreso',
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);

      const resultado = await service.obtenerPorId(100, usuario);
      expect(resultado).toBeNull();
    });

    test('entrenador puede ver registros de sus instruidos', async () => {
      const usuario = crearUsuario('entrenador', 2);
      const registro = crearMockModelo({
        id: 100,
        instruidoId: 5,
        rutinaAsignadaId: 10,
        estado: 'en_progreso',
      });
      const rutina = crearMockModelo({ id: 10, entrenadorId: 2 });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);
      RutinaAsignada.findByPk.mockResolvedValue(rutina);

      const resultado = await service.obtenerPorId(100, usuario);
      expect(resultado).not.toBeNull();
    });

    test('administrador puede operar sobre cualquier registro', async () => {
      const usuario = crearUsuario('administrador', 99);
      const registro = crearMockModelo({
        id: 100,
        instruidoId: 5,
        estado: 'en_progreso',
      });

      RegistroEntrenamiento.findByPk.mockResolvedValue(registro);

      const resultado = await service.obtenerPorId(100, usuario);
      expect(resultado).not.toBeNull();
    });
  });
});
