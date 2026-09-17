const plantillasService = require('../src/modules/entrenamiento/plantillas.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => ({
  PlantillaEntrenamiento: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Ejercicio: { findByPk: jest.fn() },
  RutinaAsignada: {},
  RegistroEntrenamiento: {},
}));

const { PlantillaEntrenamiento } = require('../src/modules/entrenamiento/entrenamiento.model');

describe('PlantillasService - cache', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    PlantillaEntrenamiento.findAll.mockReset();
    PlantillaEntrenamiento.findOne.mockReset();
    PlantillaEntrenamiento.findByPk.mockReset();
    cache.reiniciarMetricas();
  });

  test('obtenerTodos devuelve datos cacheados sin consultar DB', async () => {
    const cacheado = [{ id: 1, nombre: 'Plantilla A' }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await plantillasService.obtenerTodos(1, {});

    expect(resultado).toEqual(cacheado);
    expect(PlantillaEntrenamiento.findAll).not.toHaveBeenCalled();
  });

  test('obtenerPorId devuelve dato cacheado sin consultar DB', async () => {
    const cacheado = { id: 1, nombre: 'Plantilla A' };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador' };
    const resultado = await plantillasService.obtenerPorId(1, usuario);

    expect(resultado).toEqual(cacheado);
    expect(PlantillaEntrenamiento.findOne).not.toHaveBeenCalled();
  });

  test('obtenerPorDia devuelve dato cacheado sin consultar DB', async () => {
    const cacheado = { plantillaId: 1, dia: 1, ejercicios: [] };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador' };
    const resultado = await plantillasService.obtenerPorDia(1, 1, usuario);

    expect(resultado).toEqual(cacheado);
    expect(PlantillaEntrenamiento.findOne).not.toHaveBeenCalled();
  });
});
