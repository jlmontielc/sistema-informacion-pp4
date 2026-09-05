const reportesService = require('../src/modules/reportes/reportes.service');

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => ({
  Ejercicio: {},
  PlantillaEntrenamiento: {},
  RutinaAsignada: {},
  RegistroEntrenamiento: {},
}));

jest.mock('../src/modules/entrenamiento/series-ejecutadas.model', () => ({
  SerieEjecutada: {
    findAll: jest.fn(),
  },
}));

jest.mock('../src/shared/database/connection', () => ({
  sequelize: {
    query: jest.fn(),
    QueryTypes: { SELECT: 'SELECT' },
  },
}));

const { Instruido } = require('../src/modules/instruidos/instruido.model');
const { SerieEjecutada } = require('../src/modules/entrenamiento/series-ejecutadas.model');
const { Ejercicio, RegistroEntrenamiento } = require('../src/modules/entrenamiento/entrenamiento.model');
const { sequelize } = require('../src/shared/database/connection');

const crearUsuario = (rol, id = 1) => ({
  id,
  email: `${rol}@test.com`,
  nombre: `Usuario ${rol}`,
  rol,
  tipo: rol === 'instruido' ? 'instruido' : 'entrenador',
});

const crearSerie = (sobreescribir = {}) => ({
  id: 1,
  numeroSerie: 1,
  repeticionesRealizadas: 10,
  pesoKg: 50,
  ejercicioId: 1,
  registroEntrenamiento: { fecha: '2026-09-01' },
  ejercicio: { grupoMuscular: 'Pecho' },
  ...sobreescribir,
});

const resetearMocks = () => {
  Instruido.findByPk.mockReset();
  Instruido.findAll.mockReset();
  SerieEjecutada.findAll.mockReset();
  sequelize.query.mockReset();
};

describe('Reportes', () => {
  beforeEach(resetearMocks);

  describe('listarInstruidos', () => {
    test('entrenador ve solo sus instruidos', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findAll.mockResolvedValue([{ id: 5, nombre: 'Cliente A', entrenadorId: 2 }]);

      const resultado = await reportesService.listarInstruidos(usuario);

      expect(Instruido.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entrenadorId: 2 },
          attributes: expect.not.arrayContaining(['password_hash', 'contrasenaHash']),
        }),
      );
      expect(resultado.instruidos).toHaveLength(1);
    });

    test('administrador ve todos los instruidos', async () => {
      const usuario = crearUsuario('administrador', 99);
      Instruido.findAll.mockResolvedValue([{ id: 5, nombre: 'Cliente A' }, { id: 6, nombre: 'Cliente B' }]);

      const resultado = await reportesService.listarInstruidos(usuario);

      expect(Instruido.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          attributes: expect.not.arrayContaining(['password_hash', 'contrasenaHash']),
        }),
      );
      expect(resultado.instruidos).toHaveLength(2);
    });
  });

  describe('metricasPorGrupo', () => {
    test('devuelve métricas agrupadas y evolución semanal', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findByPk.mockResolvedValue({ id: 1, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll.mockResolvedValue([
        crearSerie({ id: 1, repeticionesRealizadas: 10, pesoKg: 50, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
        crearSerie({ id: 2, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
        crearSerie({ id: 3, repeticionesRealizadas: 12, pesoKg: 40, ejercicio: { grupoMuscular: 'Brazos' }, registroEntrenamiento: { fecha: '2026-09-02' } }),
      ]);

      const resultado = await reportesService.metricasPorGrupo(1, '30d', usuario);

      expect(resultado.instruidoId).toBe(1);
      expect(resultado.grupos).toHaveLength(2);
      const pecho = resultado.grupos.find((g) => g.grupoMuscular === 'Pecho');
      expect(pecho.volumenTotal).toBe(10 * 50 + 8 * 60);
      expect(pecho.pesoMaximoLevantado).toBe(60);
      expect(pecho.totalSeries).toBe(2);
      expect(pecho.sesionesEntrenadas).toBe(1);
      expect(resultado.evolucionSemanal).toHaveLength(2);
    });
  });

  describe('evolucionPorGrupo', () => {
    test('devuelve evolución filtrada por grupo muscular', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findByPk.mockResolvedValue({ id: 5, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll.mockResolvedValue([
        crearSerie({ id: 1, repeticionesRealizadas: 10, pesoKg: 50, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
        crearSerie({ id: 2, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-08' } }),
        crearSerie({ id: 3, repeticionesRealizadas: 12, pesoKg: 40, ejercicio: { grupoMuscular: 'Brazos' }, registroEntrenamiento: { fecha: '2026-09-02' } }),
      ]);

      const resultado = await reportesService.evolucionPorGrupo(5, 'Pecho', '30d', usuario);

      expect(resultado.grupoMuscular).toBe('Pecho');
      expect(resultado.evolucion).toHaveLength(2);
    });
  });

  describe('comparativa', () => {
    test('devuelve comparativa con promedio histórico y otros instruidos', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findByPk.mockResolvedValue({ id: 5, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll
        .mockResolvedValueOnce([
          crearSerie({ id: 1, repeticionesRealizadas: 10, pesoKg: 50, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
        ])
        .mockResolvedValueOnce([
          crearSerie({ id: 2, repeticionesRealizadas: 10, pesoKg: 55, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-08-01' } }),
        ]);
      sequelize.query.mockResolvedValue([{ volumen_total: 20000, semanas: 4 }]);

      const resultado = await reportesService.comparativa(5, '30d', usuario);

      expect(resultado.volumenTotalPeriodo).toBe(500);
      expect(resultado.promedioHistoricoGlobal.volumenPromedioSemanal).toBe(550);
      expect(resultado.comparativaOtros.volumenPromedioSemanal).toBe(5000);
    });
  });

  describe('autorización', () => {
    test('instruido no puede consultar reportes de otro instruido', async () => {
      const usuario = crearUsuario('instruido', 1);

      await expect(reportesService.metricasPorGrupo(2, '30d', usuario))
        .rejects
        .toMatchObject({ status: 403, message: 'No puede consultar reportes de otro instruido' });
    });

    test('entrenador puede consultar reportes de cualquier instruido', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findByPk.mockResolvedValue({ id: 5, nombre: 'Cliente A', entrenadorId: 3 });
      SerieEjecutada.findAll.mockResolvedValue([]);

      const resultado = await reportesService.metricasPorGrupo(5, '30d', usuario);

      expect(resultado.instruidoId).toBe(5);
    });
  });

  describe('asociaciones de reportes', () => {
    test('los includes de SerieEjecutada usan el alias correcto', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findByPk.mockResolvedValue({ id: 1, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll.mockResolvedValue([]);

      await reportesService.metricasPorGrupo(1, '30d', usuario);

      const llamada = SerieEjecutada.findAll.mock.calls[0][0];
      const includes = llamada.include || [];
      expect(includes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ model: RegistroEntrenamiento, as: 'registroEntrenamiento' }),
          expect.objectContaining({ model: Ejercicio, as: 'ejercicio' }),
        ]),
      );
    });
  });

  describe('validaciones defensivas', () => {
    test('ignora series sin asociaciones y trata valores no numéricos como cero', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findByPk.mockResolvedValue({ id: 1, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll.mockResolvedValue([
        crearSerie({ id: 1, repeticionesRealizadas: 10, pesoKg: 50, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
        crearSerie({ id: 2, repeticionesRealizadas: null, pesoKg: 'no numerico', ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
        crearSerie({ id: 3, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: undefined, registroEntrenamiento: { fecha: '2026-09-01' } }),
        crearSerie({ id: 4, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: undefined }),
      ]);

      const resultado = await reportesService.metricasPorGrupo(1, '30d', usuario);

      expect(resultado.grupos).toHaveLength(1);
      const pecho = resultado.grupos.find((g) => g.grupoMuscular === 'Pecho');
      expect(pecho.volumenTotal).toBe(10 * 50);
      expect(pecho.totalSeries).toBe(2);
      expect(pecho.sesionesEntrenadas).toBe(1);
    });

    test('promedio historico no falla con fechas nulas ni sin series', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findByPk.mockResolvedValue({ id: 5, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          crearSerie({ id: 1, repeticionesRealizadas: 10, pesoKg: 50, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: null } }),
          crearSerie({ id: 2, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: undefined }),
        ]);
      sequelize.query.mockResolvedValue([{ volumen_total: 0, semanas: 1 }]);

      const resultado = await reportesService.comparativa(5, '30d', usuario);

      expect(resultado.promedioHistoricoGlobal).toEqual({
        volumenPromedioSemanal: 0,
        pesoMaximo: 0,
        sesionesPromedioSemanal: 0,
      });
    });

    test('comparativa no falla con series sin asociaciones o valores no numéricos', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findByPk.mockResolvedValue({ id: 5, nombre: 'Cliente A', entrenadorId: 2 });
      SerieEjecutada.findAll
        .mockResolvedValueOnce([
          crearSerie({ id: 1, repeticionesRealizadas: 10, pesoKg: 50, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
          crearSerie({ id: 2, repeticionesRealizadas: null, pesoKg: 'no numerico', ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: '2026-09-01' } }),
          crearSerie({ id: 3, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: undefined, registroEntrenamiento: { fecha: '2026-09-01' } }),
          crearSerie({ id: 4, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: undefined }),
          crearSerie({ id: 5, repeticionesRealizadas: 8, pesoKg: 60, ejercicio: { grupoMuscular: 'Pecho' }, registroEntrenamiento: { fecha: null } }),
        ])
        .mockResolvedValueOnce([]);
      sequelize.query.mockResolvedValue([{ volumen_total: 0, semanas: 1 }]);

      const resultado = await reportesService.comparativa(5, '30d', usuario);

      expect(resultado.volumenTotalPeriodo).toBe(500);
      expect(resultado.volumenPromedioSemanalPeriodo).toBe(500);
    });
  });
});
