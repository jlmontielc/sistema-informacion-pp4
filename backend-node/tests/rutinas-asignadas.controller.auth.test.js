const rutinasAsignadasController = require('../src/modules/entrenamiento/rutinas-asignadas.controller');

jest.mock('../src/modules/entrenamiento/rutinas-asignadas.service', () => ({
  obtenerTodos: jest.fn(),
  obtenerPorId: jest.fn(),
  obtenerPorIdPropio: jest.fn(),
  crear: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
  clonarDesdePlantilla: jest.fn(),
  obtenerPorDia: jest.fn(),
  obtenerResumenSemanal: jest.fn(),
  agregarEjercicioADia: jest.fn(),
  editarEjercicioEnDia: jest.fn(),
  eliminarEjercicioDeDia: jest.fn(),
  reordenarDia: jest.fn(),
}));

const rutinasAsignadasService = require('../src/modules/entrenamiento/rutinas-asignadas.service');

const crearReq = (sobreescribir = {}) => ({
  usuario: { id: 2, rol: 'entrenador' },
  query: {},
  params: {},
  body: {},
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

const resetearMocks = () => {
  Object.values(rutinasAsignadasService).forEach((mock) => {
    if (mock && typeof mock.mockReset === 'function') mock.mockReset();
  });
  next.mockClear();
};

describe('RutinasAsignadasController - autorización', () => {
  beforeEach(resetearMocks);

  describe('obtenerTodos', () => {
    test('entrenador no puede hacer bypass con query admin=true', async () => {
      const req = crearReq({ query: { admin: 'true' } });
      const res = crearRes();
      rutinasAsignadasService.obtenerTodos.mockResolvedValue([{ id: 1, entrenadorId: 2 }]);

      await rutinasAsignadasController.obtenerTodos(req, res, next);

      expect(rutinasAsignadasService.obtenerTodos).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ admin: false }),
      );
      expect(res.json).toHaveBeenCalled();
    });

    test('administrador puede listar todas las rutinas', async () => {
      const req = crearReq({ usuario: { id: 1, rol: 'administrador' } });
      const res = crearRes();
      rutinasAsignadasService.obtenerTodos.mockResolvedValue([{ id: 1, entrenadorId: 2 }, { id: 2, entrenadorId: 3 }]);

      await rutinasAsignadasController.obtenerTodos(req, res, next);

      expect(rutinasAsignadasService.obtenerTodos).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ admin: true }),
      );
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    test('entrenador solo ve rutinas de sus instruidos', async () => {
      const req = crearReq();
      const res = crearRes();
      rutinasAsignadasService.obtenerTodos.mockResolvedValue([{ id: 1, entrenadorId: 2 }]);

      await rutinasAsignadasController.obtenerTodos(req, res, next);

      expect(rutinasAsignadasService.obtenerTodos).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ admin: false }),
      );
      expect(res.json).toHaveBeenCalledWith([{ id: 1, entrenadorId: 2 }]);
    });

    test('instruido solo ve sus propias rutinas', async () => {
      const req = crearReq({ usuario: { id: 7, rol: 'instruido' } });
      const res = crearRes();
      rutinasAsignadasService.obtenerTodos.mockResolvedValue([{ id: 1, instruidoId: 7 }]);

      await rutinasAsignadasController.obtenerTodos(req, res, next);

      expect(rutinasAsignadasService.obtenerTodos).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ admin: false, instruidoId: 7, propias: true }),
      );
      expect(res.json).toHaveBeenCalledWith([{ id: 1, instruidoId: 7 }]);
    });
  });

  describe('obtenerPorId', () => {
    test('instruido usa ruta propia restringida por instruidoId', async () => {
      const req = crearReq({ usuario: { id: 7, rol: 'instruido' }, params: { id: '5' } });
      const res = crearRes();
      rutinasAsignadasService.obtenerPorIdPropio.mockResolvedValue({ id: 5, instruidoId: 7 });

      await rutinasAsignadasController.obtenerPorId(req, res, next);

      expect(rutinasAsignadasService.obtenerPorIdPropio).toHaveBeenCalledWith('5', 7);
      expect(res.json).toHaveBeenCalled();
    });

    test('entrenador consulta pasando su usuario completo', async () => {
      const req = crearReq({ params: { id: '5' } });
      const res = crearRes();
      rutinasAsignadasService.obtenerPorId.mockResolvedValue({ id: 5, entrenadorId: 2 });

      await rutinasAsignadasController.obtenerPorId(req, res, next);

      expect(rutinasAsignadasService.obtenerPorId).toHaveBeenCalledWith('5', req.usuario);
    });

    test('entrenador no puede ver rutinas de instruidos ajenos', async () => {
      const req = crearReq({ params: { id: '5' } });
      const res = crearRes();
      rutinasAsignadasService.obtenerPorId.mockResolvedValue(null);

      await rutinasAsignadasController.obtenerPorId(req, res, next);

      expect(rutinasAsignadasService.obtenerPorId).toHaveBeenCalledWith('5', req.usuario);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rutina no encontrada' });
    });
  });
});
