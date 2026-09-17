const authService = require('../src/modules/auth/auth.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/auth/entrenador.model', () => ({
  Entrenador: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../src/modules/auth/certificacion.model', () => ({
  Certificacion: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../src/modules/instruidos/perfil-medico.model', () => ({
  PerfilMedico: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../src/modules/instruidos/perfil-medico.service', () => ({
  calcularPerfilMedicoCompleto: jest.fn(),
}));

const { Entrenador } = require('../src/modules/auth/entrenador.model');
const { Instruido } = require('../src/modules/instruidos/instruido.model');

describe('AuthService - cache', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Entrenador.findByPk.mockReset();
    Entrenador.findAll.mockReset();
    Instruido.findByPk.mockReset();
    Instruido.findOne.mockReset();
    cache.reiniciarMetricas();
  });

  test('obtenerPerfil devuelve entrenador cacheado sin consultar DB', async () => {
    const cacheado = { id: 1, nombre: 'Entrenador A', rol: 'entrenador' };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await authService.obtenerPerfil(1, 'entrenador');

    expect(resultado).toEqual(cacheado);
    expect(Entrenador.findByPk).not.toHaveBeenCalled();
  });

  test('obtenerPerfil devuelve instruido cacheado sin consultar DB', async () => {
    const cacheado = { id: 2, nombre: 'Instruido A', perfilMedicoCompleto: false };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await authService.obtenerPerfil(2, 'instruido');

    expect(resultado).toEqual(cacheado);
    expect(Instruido.findByPk).not.toHaveBeenCalled();
  });

  test('obtenerPerfilEntrenador devuelve perfil cacheado sin consultar DB', async () => {
    const cacheado = { id: 1, nombre: 'Entrenador A', certificaciones: [] };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await authService.obtenerPerfilEntrenador(10);

    expect(resultado).toEqual(cacheado);
    expect(Instruido.findByPk).not.toHaveBeenCalled();
    expect(Entrenador.findByPk).not.toHaveBeenCalled();
  });

  test('obtenerTodosLosPerfiles devuelve perfiles cacheados sin consultar DB', async () => {
    const cacheado = [{ id: 1, nombre: 'Entrenador A', certificaciones: [] }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await authService.obtenerTodosLosPerfiles();

    expect(resultado).toEqual(cacheado);
    expect(Entrenador.findAll).not.toHaveBeenCalled();
  });
});
