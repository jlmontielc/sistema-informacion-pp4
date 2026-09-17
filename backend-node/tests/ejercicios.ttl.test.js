const ejerciciosService = require('../src/modules/entrenamiento/ejercicios.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => ({
  Ejercicio: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

const { Ejercicio } = require('../src/modules/entrenamiento/entrenamiento.model');

describe('EjerciciosService - TTL', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Ejercicio.findAll.mockReset();
    Ejercicio.findAndCountAll.mockReset();
    cache.reiniciarMetricas();
  });

  test('TTL_EJERCICIOS debe ser 1800 segundos', async () => {
    jest.spyOn(cache, 'obtener').mockResolvedValue(null);
    const guardarSpy = jest.spyOn(cache, 'guardar').mockResolvedValue();
    Ejercicio.findAll.mockResolvedValue([{ id: 1, nombre: 'Press banca' }]);

    await ejerciciosService.obtenerTodos({});

    expect(guardarSpy).toHaveBeenCalledWith(expect.any(String), expect.anything(), 1800);
  });
});
