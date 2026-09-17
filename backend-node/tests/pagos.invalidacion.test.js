const pagosController = require('../src/modules/pagos/pagos.controller');
const pagosService = require('../src/modules/pagos/pagos.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/pagos/pagos.service', () => ({
  listarPlanes: jest.fn(),
  listarMetodos: jest.fn(),
  obtenerConfiguracion: jest.fn(),
  obtenerCatalogo: jest.fn(),
  listarMisPagos: jest.fn(),
  listarPagosEntrenador: jest.fn(),
  obtenerMiSuscripcion: jest.fn(),
  crearPlan: jest.fn(),
  crearMetodo: jest.fn(),
  actualizarPlan: jest.fn(),
  actualizarMetodo: jest.fn(),
  actualizarTasa: jest.fn(),
  eliminarPlan: jest.fn(),
  eliminarMetodo: jest.fn(),
  registrarPago: jest.fn(),
  verificarPago: jest.fn(),
  rechazarPago: jest.fn(),
  obtenerComprobante: jest.fn(),
}));

const entrenadorId = 1;
const instruidoId = 10;

const crearReq = (sobreescribir = {}) => ({
  usuario: { id: entrenadorId, rol: 'entrenador' },
  params: {},
  body: {},
  ...sobreescribir,
});

const crearRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

const claveContiene = (texto) => expect.stringContaining(texto);

describe('PagosController - invalidacion de cache', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.spyOn(cache, 'eliminar').mockResolvedValue();
    jest.spyOn(cache, 'eliminarPorPatron').mockResolvedValue();
  });

  const assertInvalidaCache = () => {
    expect(cache.eliminar.mock.calls.length + cache.eliminarPorPatron.mock.calls.length).toBeGreaterThan(0);
  };

  test('crearPlan invalida cache de planes y catalogo del entrenador', async () => {
    pagosService.crearPlan.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, nombre: 'Plan A' });
    const req = crearReq({ body: { nombre: 'Plan A', montoUsd: 10 } });
    const res = crearRes();

    await pagosController.crearPlan(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`planes:entrenador:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('actualizarPlan invalida cache de planes y catalogo del entrenador', async () => {
    pagosService.actualizarPlan.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, nombre: 'Plan B' });
    const req = crearReq({ params: { planId: '1' }, body: { nombre: 'Plan B' } });
    const res = crearRes();

    await pagosController.actualizarPlan(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`planes:entrenador:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('eliminarPlan invalida cache de planes y catalogo del entrenador', async () => {
    pagosService.eliminarPlan.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, activo: false });
    const req = crearReq({ params: { planId: '1' } });
    const res = crearRes();

    await pagosController.eliminarPlan(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`planes:entrenador:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('crearMetodo invalida cache de metodos y catalogo del entrenador', async () => {
    pagosService.crearMetodo.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, tipo: 'pago_movil' });
    const req = crearReq({ body: { tipo: 'pago_movil', datos: '{}' } });
    const res = crearRes();

    await pagosController.crearMetodo(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`metodos:entrenador:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('actualizarMetodo invalida cache de metodos y catalogo del entrenador', async () => {
    pagosService.actualizarMetodo.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, tipo: 'zelle' });
    const req = crearReq({ params: { metodoId: '1' }, body: { tipo: 'zelle' } });
    const res = crearRes();

    await pagosController.actualizarMetodo(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`metodos:entrenador:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('eliminarMetodo invalida cache de metodos y catalogo del entrenador', async () => {
    pagosService.eliminarMetodo.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, activo: false });
    const req = crearReq({ params: { metodoId: '1' } });
    const res = crearRes();

    await pagosController.eliminarMetodo(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`metodos:entrenador:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('actualizarConfiguracion invalida cache de configuracion y catalogo del entrenador', async () => {
    pagosService.actualizarTasa.mockResolvedValue({ id: 1, entrenadorId: entrenadorId, tasaCambio: 45 });
    const req = crearReq({ body: { tasaCambio: 45 } });
    const res = crearRes();

    await pagosController.actualizarConfiguracion(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`config:${entrenadorId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`catalogo:${entrenadorId}`));
  });

  test('registrarPago invalida cache de misPagos, miSuscripcion e historial del entrenador', async () => {
    pagosService.registrarPago.mockResolvedValue({
      id: 1, instruidoId: instruidoId, entrenadorId: entrenadorId, estado: 'pendiente', toJSON: () => ({ id: 1 }),
    });
    const req = crearReq({ usuario: { id: instruidoId, rol: 'instruido' }, body: { planId: 1, metodoPagoId: 1 } });
    const res = crearRes();

    await pagosController.registrarPago(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`mis-pagos:${instruidoId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`suscripcion:${instruidoId}`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`historial:*:${entrenadorId}:`));
  });

  test('verificarPago invalida cache de misPagos, historial del entrenador y del admin', async () => {
    pagosService.verificarPago.mockResolvedValue({
      id: 1, instruidoId: instruidoId, entrenadorId: entrenadorId, estado: 'verificado',
    });
    const adminId = 99;
    const req = crearReq({ usuario: { id: adminId, rol: 'administrador' }, params: { pagoId: '1' } });
    const res = crearRes();

    await pagosController.verificarPago(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`mis-pagos:${instruidoId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`suscripcion:${instruidoId}`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`historial:administrador:${adminId}:`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`historial:*:${entrenadorId}:`));
  });

  test('rechazarPago invalida cache de misPagos, historial del entrenador y del admin', async () => {
    pagosService.rechazarPago.mockResolvedValue({
      id: 1, instruidoId: instruidoId, entrenadorId: entrenadorId, estado: 'rechazado',
    });
    const adminId = 99;
    const req = crearReq({ usuario: { id: adminId, rol: 'administrador' }, params: { pagoId: '1' }, body: { comentario: 'Rechazado' } });
    const res = crearRes();

    await pagosController.rechazarPago(req, res, next);

    assertInvalidaCache();
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`mis-pagos:${instruidoId}`));
    expect(cache.eliminar).toHaveBeenCalledWith(claveContiene(`suscripcion:${instruidoId}`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`historial:administrador:${adminId}:`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`historial:*:${entrenadorId}:`));
  });
});
