const reportesService = require('../src/modules/reportes/reportes.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
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
const { sequelize } = require('../src/shared/database/connection');

describe('Reportes - caché', () => {
  beforeEach(() => {
    Instruido.findOne.mockReset();
    SerieEjecutada.findAll.mockReset();
    sequelize.query.mockReset();
    cache.reiniciarMetricas();
  });

  test('metricasPorGrupo devuelve resultado cacheado sin consultar DB', async () => {
    const cacheado = {
      instruidoId: 1,
      nombre: 'Cliente A',
      periodo: '30d',
      grupos: [],
      evolucionSemanal: [],
    };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador', tipo: 'entrenador' };
    const resultado = await reportesService.metricasPorGrupo(1, '30d', usuario);

    expect(resultado).toEqual(cacheado);
    expect(Instruido.findOne).not.toHaveBeenCalled();
  });

  test('evolucionPorGrupo devuelve resultado cacheado sin consultar DB', async () => {
    const cacheado = {
      instruidoId: 1,
      nombre: 'Cliente A',
      grupoMuscular: 'Pecho',
      periodo: '30d',
      evolucion: [],
    };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador', tipo: 'entrenador' };
    const resultado = await reportesService.evolucionPorGrupo(1, 'Pecho', '30d', usuario);

    expect(resultado).toEqual(cacheado);
    expect(Instruido.findOne).not.toHaveBeenCalled();
  });

  test('comparativa devuelve resultado cacheado sin consultar DB', async () => {
    const cacheado = {
      instruidoId: 1,
      nombre: 'Cliente A',
      periodo: '30d',
      volumenTotalPeriodo: 0,
      promedioHistoricoGlobal: {},
      comparativaOtros: {},
    };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador', tipo: 'entrenador' };
    const resultado = await reportesService.comparativa(1, '30d', usuario);

    expect(resultado).toEqual(cacheado);
    expect(Instruido.findOne).not.toHaveBeenCalled();
  });
});
