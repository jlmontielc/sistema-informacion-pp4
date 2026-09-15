const dietasService = require('../src/modules/dietas/dietas.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/dietas/dietas.model', () => ({
  Dieta: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

const { Dieta } = require('../src/modules/dietas/dietas.model');

describe('DietasService - caché', () => {
  beforeEach(() => {
    Dieta.findAll.mockReset();
    Dieta.findByPk.mockReset();
  });

  test('listarPorUsuario devuelve resultado cacheado sin consultar DB', async () => {
    const cacheado = [{ id: 1, objetivoCalorico: 2000 }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 5, rol: 'entrenador' };
    const resultado = await dietasService.listarPorUsuario(usuario);

    expect(resultado).toEqual(cacheado);
    expect(Dieta.findAll).not.toHaveBeenCalled();
  });

  test('listarPorUsuario consulta DB cuando no hay caché', async () => {
    jest.spyOn(cache, 'obtener').mockResolvedValue(null);
    jest.spyOn(cache, 'guardar').mockResolvedValue();
    Dieta.findAll.mockResolvedValue([{ id: 1 }]);

    const usuario = { id: 5, rol: 'entrenador' };
    const resultado = await dietasService.listarPorUsuario(usuario);

    expect(Dieta.findAll).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual([{ id: 1 }]);
  });

  test('obtenerPorId devuelve dieta cacheada sin consultar DB', async () => {
    const cacheado = { id: 3, instruidoId: 2 };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'administrador' };
    const resultado = await dietasService.obtenerPorId(usuario, 3);

    expect(resultado).toEqual(cacheado);
    expect(Dieta.findByPk).not.toHaveBeenCalled();
  });
});
