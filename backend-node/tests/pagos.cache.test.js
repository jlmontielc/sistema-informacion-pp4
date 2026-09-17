const pagosService = require('../src/modules/pagos/pagos.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/shared/database/associations', () => ({
  PlanPago: {
    findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn(),
  },
  MetodoPago: {
    findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn(), update: jest.fn(),
  },
  ConfiguracionPago: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Pago: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  Instruido: { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn() },
}));

jest.mock('../src/modules/entrenamiento/hitl.service', () => ({}));

const {
  PlanPago, MetodoPago, ConfiguracionPago, Pago, Instruido,
} = require('../src/shared/database/associations');

describe('PagosService - cache', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    PlanPago.findAll.mockReset();
    PlanPago.findOne.mockReset();
    MetodoPago.findAll.mockReset();
    ConfiguracionPago.findOrCreate.mockReset();
    ConfiguracionPago.findOne.mockReset();
    Pago.findAll.mockReset();
    Pago.findOne.mockReset();
    Pago.findByPk.mockReset();
    Instruido.findOne.mockReset();
    cache.reiniciarMetricas();
  });

  test('listarPlanes devuelve datos cacheados sin consultar DB', async () => {
    const cacheado = [{ id: 1, nombre: 'Plan A' }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador' };
    const resultado = await pagosService.listarPlanes(usuario);

    expect(resultado).toEqual(cacheado);
    expect(PlanPago.findAll).not.toHaveBeenCalled();
  });

  test('listarMetodos devuelve datos cacheados sin consultar DB', async () => {
    const cacheado = [{ id: 1, tipo: 'pago_movil' }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador' };
    const resultado = await pagosService.listarMetodos(usuario);

    expect(resultado).toEqual(cacheado);
    expect(MetodoPago.findAll).not.toHaveBeenCalled();
  });

  test('obtenerConfiguracion devuelve dato cacheado sin consultar DB', async () => {
    const cacheado = { id: 1, entrenadorId: 1, tasaCambio: 42 };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await pagosService.obtenerConfiguracion(1);

    expect(resultado).toEqual(cacheado);
    expect(ConfiguracionPago.findOrCreate).not.toHaveBeenCalled();
  });

  test('obtenerCatalogo devuelve dato cacheado sin consultar DB', async () => {
    const cacheado = { planes: [], metodos: [], tasaCambio: 42 };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await pagosService.obtenerCatalogo(10, 1);

    expect(resultado).toEqual(cacheado);
    expect(Instruido.findOne).not.toHaveBeenCalled();
    expect(PlanPago.findAll).not.toHaveBeenCalled();
    expect(MetodoPago.findAll).not.toHaveBeenCalled();
    expect(ConfiguracionPago.findOrCreate).not.toHaveBeenCalled();
  });

  test('listarMisPagos devuelve datos cacheados sin consultar DB', async () => {
    const cacheado = [{ id: 1, estado: 'pendiente' }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await pagosService.listarMisPagos(10);

    expect(resultado).toEqual(cacheado);
    expect(Pago.findAll).not.toHaveBeenCalled();
  });

  test('listarPagosEntrenador devuelve datos cacheados sin consultar DB', async () => {
    const cacheado = [{ id: 1, estado: 'verificado' }];
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const usuario = { id: 1, rol: 'entrenador' };
    const resultado = await pagosService.listarPagosEntrenador(usuario, { estado: 'verificado' });

    expect(resultado).toEqual(cacheado);
    expect(Pago.findAll).not.toHaveBeenCalled();
  });

  test('obtenerMiSuscripcion devuelve dato cacheado sin consultar DB', async () => {
    const cacheado = { activa: false, mensaje: 'Sin suscripciones registradas' };
    jest.spyOn(cache, 'obtener').mockResolvedValue(cacheado);

    const resultado = await pagosService.obtenerMiSuscripcion(10);

    expect(resultado).toEqual(cacheado);
    expect(Pago.findOne).not.toHaveBeenCalled();
    expect(Pago.findAll).not.toHaveBeenCalled();
  });
});
