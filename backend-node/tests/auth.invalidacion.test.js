const authController = require('../src/modules/auth/auth.controller');
const authService = require('../src/modules/auth/auth.service');
const cache = require('../src/shared/cache/cache');
const cacheKeys = require('../src/shared/cache/cacheKeys');

jest.mock('../src/modules/auth/auth.service', () => ({
  iniciarSesion: jest.fn(),
  registrar: jest.fn(),
  refrescarToken: jest.fn(),
  cerrarSesion: jest.fn(),
  obtenerPerfil: jest.fn(),
  actualizarPerfil: jest.fn(),
  obtenerPerfilEntrenador: jest.fn(),
  obtenerTodosLosPerfiles: jest.fn(),
  crearCertificacion: jest.fn(),
  eliminarCertificacion: jest.fn(),
}));

const usuarioId = 1;

const crearReq = (sobreescribir = {}) => ({
  usuario: { id: usuarioId, rol: 'entrenador', tipo: 'entrenador' },
  params: {},
  body: {},
  token: 'token',
  ...sobreescribir,
});

const crearRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

describe('AuthController - invalidacion de cache', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.spyOn(cache, 'eliminar').mockResolvedValue();
    jest.spyOn(cache, 'eliminarPorPatron').mockResolvedValue();
  });

  test('actualizarPerfil invalida las claves de perfil de auth para entrenador', async () => {
    authService.actualizarPerfil.mockResolvedValue({ id: usuarioId, nombre: 'Nuevo' });
    const req = crearReq({ body: { nombre: 'Nuevo' } });
    const res = crearRes();

    await authController.actualizarPerfil(req, res, next);

    expect(cache.eliminar).toHaveBeenCalledWith(cacheKeys.auth.perfil('entrenador', usuarioId));
    expect(cache.eliminar).toHaveBeenCalledWith(cacheKeys.auth.profiles('all'));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(cacheKeys.auth.trainer('*'));
  });

  test('actualizarPerfil invalida las claves de perfil de auth para instruido', async () => {
    authService.actualizarPerfil.mockResolvedValue({ id: usuarioId, nombre: 'Nuevo' });
    const req = crearReq({ usuario: { id: usuarioId, rol: 'instruido', tipo: 'instruido' }, body: { nombre: 'Nuevo' } });
    const res = crearRes();

    await authController.actualizarPerfil(req, res, next);

    expect(cache.eliminar).toHaveBeenCalledWith(cacheKeys.auth.perfil('instruido', usuarioId));
    expect(cache.eliminar).toHaveBeenCalledWith(cacheKeys.dashboard.stats('instruido', usuarioId));
    expect(cache.eliminar).not.toHaveBeenCalledWith(cacheKeys.auth.profiles('all'));
    expect(cache.eliminarPorPatron).not.toHaveBeenCalledWith(cacheKeys.auth.trainer('*'));
  });

  const assertInvalidaPerfilesEntrenador = () => {
    expect(cache.eliminar).toHaveBeenCalledWith(cacheKeys.auth.perfil('entrenador', usuarioId));
    expect(cache.eliminar).toHaveBeenCalledWith(cacheKeys.auth.profiles('all'));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(cacheKeys.auth.trainer('*'));
  };

  test('crearCertificacion invalida las claves de perfiles de entrenadores', async () => {
    authService.crearCertificacion.mockResolvedValue({ id: 1, entrenadorId: usuarioId, nombre: 'Cert A' });
    const req = crearReq({ body: { nombre: 'Cert A' } });
    const res = crearRes();

    await authController.crearCertificacion(req, res, next);

    assertInvalidaPerfilesEntrenador();
  });

  test('eliminarCertificacion invalida las claves de perfiles de entrenadores', async () => {
    authService.eliminarCertificacion.mockResolvedValue({ message: 'Certificacion eliminada' });
    const req = crearReq({ params: { id: '5' } });
    const res = crearRes();

    await authController.eliminarCertificacion(req, res, next);

    assertInvalidaPerfilesEntrenador();
  });
});
