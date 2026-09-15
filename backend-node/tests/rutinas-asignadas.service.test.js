const rutinasService = require('../src/modules/entrenamiento/rutinas-asignadas.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => ({
  RutinaAsignada: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  PlantillaEntrenamiento: {
    findOne: jest.fn(),
  },
  Ejercicio: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
}));

const { RutinaAsignada } = require('../src/modules/entrenamiento/entrenamiento.model');

describe('RutinasAsignadasService - caché', () => {
  beforeEach(() => {
    RutinaAsignada.findAll.mockReset();
    RutinaAsignada.findOne.mockReset();
  });

  test('obtenerTodos devuelve resultado cacheado sin consultar DB', async () => {
    const cacheado = [{ id: 1, nombre: 'Fuerza' }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await rutinasService.obtenerTodos(2, {});

    expect(resultado).toEqual(cacheado);
    expect(RutinaAsignada.findAll).not.toHaveBeenCalled();
  });

  test('obtenerTodos consulta DB cuando no hay caché', async () => {
    jest.spyOn(cache, 'obtener').mockResolvedValue(null);
    jest.spyOn(cache, 'guardar').mockResolvedValue();
    RutinaAsignada.findAll.mockResolvedValue([{ id: 1, nombre: 'Fuerza' }]);

    const resultado = await rutinasService.obtenerTodos(2, {});

    expect(RutinaAsignada.findAll).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual([{ id: 1, nombre: 'Fuerza' }]);
  });
});
