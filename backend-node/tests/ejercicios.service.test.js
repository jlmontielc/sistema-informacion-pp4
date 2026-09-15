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

const resetearMocks = () => {
  Ejercicio.findAll.mockReset();
  Ejercicio.findByPk.mockReset();
  Ejercicio.findAndCountAll.mockReset();
};

describe('EjerciciosService - caché', () => {
  beforeEach(resetearMocks);

  test('obtenerTodos devuelve resultado cacheado sin consultar DB', async () => {
    const cacheado = { ejercicios: [{ id: 1, nombre: 'Press banca' }], total: 1, pagina: 1, limite: 20, totalPaginas: 1 };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await ejerciciosService.obtenerTodos({ pagina: 1, limite: 20 });

    expect(resultado).toEqual(cacheado);
    expect(Ejercicio.findAndCountAll).not.toHaveBeenCalled();
  });

  test('obtenerTodos consulta DB cuando no hay caché', async () => {
    jest.spyOn(cache, 'obtener').mockResolvedValue(null);
    jest.spyOn(cache, 'guardar').mockResolvedValue();
    const dbResultado = { rows: [{ id: 1, nombre: 'Press banca' }], count: 1 };
    Ejercicio.findAndCountAll.mockResolvedValue(dbResultado);

    const resultado = await ejerciciosService.obtenerTodos({ pagina: 1, limite: 20 });

    expect(Ejercicio.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(resultado.ejercicios).toEqual(dbResultado.rows);
    expect(resultado.total).toBe(1);
  });

  test('obtenerPorId devuelve ejercicio cacheado sin consultar DB', async () => {
    const cacheado = { id: 5, nombre: 'Sentadilla' };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await ejerciciosService.obtenerPorId(5);

    expect(resultado).toEqual(cacheado);
    expect(Ejercicio.findByPk).not.toHaveBeenCalled();
  });
});
