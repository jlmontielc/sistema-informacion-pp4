const reportesService = require('../src/modules/reportes/reportes.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: { findByPk: jest.fn(), findOne: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => ({
  Ejercicio: {},
  PlantillaEntrenamiento: {},
  RutinaAsignada: {},
  RegistroEntrenamiento: {},
}));

jest.mock('../src/modules/entrenamiento/series-ejecutadas.model', () => ({
  SerieEjecutada: { findAll: jest.fn() },
}));

jest.mock('../src/shared/database/connection', () => ({
  sequelize: { query: jest.fn(), QueryTypes: { SELECT: 'SELECT' } },
}));

const { Instruido } = require('../src/modules/instruidos/instruido.model');
const { SerieEjecutada } = require('../src/modules/entrenamiento/series-ejecutadas.model');
const { sequelize } = require('../src/shared/database/connection');

describe('ReportesService - TTL', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Instruido.findOne.mockReset();
    SerieEjecutada.findAll.mockReset();
    sequelize.query.mockReset();
    cache.reiniciarMetricas();
  });

  test('TTL_REPORTES debe ser 900 segundos', async () => {
    jest.spyOn(cache, 'obtener').mockResolvedValue(null);
    const guardarSpy = jest.spyOn(cache, 'guardar').mockResolvedValue();
    Instruido.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente A' });
    SerieEjecutada.findAll.mockResolvedValue([]);
    sequelize.query.mockResolvedValue([{ volumen_total: 0, semanas: 1 }]);

    const usuario = { id: 1, rol: 'entrenador', tipo: 'entrenador' };
    await reportesService.comparativa(1, '30d', usuario);

    expect(guardarSpy).toHaveBeenCalledWith(expect.any(String), expect.anything(), 900);
  });
});
