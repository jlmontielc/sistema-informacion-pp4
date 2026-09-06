const plantillasController = require('../src/modules/entrenamiento/plantillas.controller');

jest.mock('../src/modules/entrenamiento/plantillas.service', () => ({
  obtenerTodos: jest.fn(),
  obtenerPorId: jest.fn(),
  crear: jest.fn(),
  actualizar: jest.fn(),
  eliminar: jest.fn(),
  obtenerPorDia: jest.fn(),
  agregarEjercicioADia: jest.fn(),
  editarEjercicioEnDia: jest.fn(),
  eliminarEjercicioDeDia: jest.fn(),
  reordenarDia: jest.fn(),
}));

const plantillasService = require('../src/modules/entrenamiento/plantillas.service');

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
  Object.values(plantillasService).forEach((mock) => {
    if (mock && typeof mock.mockReset === 'function') mock.mockReset();
  });
  next.mockClear();
};

describe('PlantillasController - autorización', () => {
  beforeEach(resetearMocks);

  describe('obtenerTodos', () => {
    test('entrenador no puede hacer bypass con query admin=true', async () => {
      const req = crearReq({ query: { admin: 'true' } });
      const res = crearRes();
      plantillasService.obtenerTodos.mockResolvedValue([{ id: 1, entrenadorId: 2 }]);

      await plantillasController.obtenerTodos(req, res, next);

      expect(plantillasService.obtenerTodos).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ admin: false }),
      );
      expect(res.json).toHaveBeenCalled();
    });

    test('administrador puede listar todas las plantillas', async () => {
      const req = crearReq({ usuario: { id: 1, rol: 'administrador' } });
      const res = crearRes();
      plantillasService.obtenerTodos.mockResolvedValue([{ id: 1, entrenadorId: 2 }, { id: 2, entrenadorId: 3 }]);

      await plantillasController.obtenerTodos(req, res, next);

      expect(plantillasService.obtenerTodos).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ admin: true }),
      );
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    test('entrenador solo ve sus propias plantillas', async () => {
      const req = crearReq();
      const res = crearRes();
      plantillasService.obtenerTodos.mockResolvedValue([{ id: 1, entrenadorId: 2 }]);

      await plantillasController.obtenerTodos(req, res, next);

      expect(plantillasService.obtenerTodos).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ admin: false }),
      );
      expect(res.json).toHaveBeenCalledWith([{ id: 1, entrenadorId: 2 }]);
    });
  });

  describe('obtenerPorId', () => {
    test('propaga el usuario completo al servicio para restringir acceso', async () => {
      const req = crearReq({ params: { id: '5' } });
      const res = crearRes();
      plantillasService.obtenerPorId.mockResolvedValue({ id: 5, entrenadorId: 2 });

      await plantillasController.obtenerPorId(req, res, next);

      expect(plantillasService.obtenerPorId).toHaveBeenCalledWith('5', req.usuario);
      expect(res.json).toHaveBeenCalled();
    });

    test('administrador puede ver plantillas de cualquier entrenador', async () => {
      const req = crearReq({ usuario: { id: 1, rol: 'administrador' }, params: { id: '5' } });
      const res = crearRes();
      plantillasService.obtenerPorId.mockResolvedValue({ id: 5, entrenadorId: 99 });

      await plantillasController.obtenerPorId(req, res, next);

      expect(plantillasService.obtenerPorId).toHaveBeenCalledWith('5', req.usuario);
      expect(res.json).toHaveBeenCalledWith({ id: 5, entrenadorId: 99 });
    });

    test('devuelve 404 si la plantilla no pertenece al entrenador', async () => {
      const req = crearReq({ params: { id: '5' } });
      const res = crearRes();
      plantillasService.obtenerPorId.mockResolvedValue(null);

      await plantillasController.obtenerPorId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Plantilla no encontrada' });
    });
  });

  describe('actualizar', () => {
    test('pasa el usuario completo al servicio para validar permisos', async () => {
      const req = crearReq({ params: { id: '5' }, body: { nombre: 'Actualizada' } });
      const res = crearRes();
      plantillasService.actualizar.mockResolvedValue({ id: 5, nombre: 'Actualizada' });

      await plantillasController.actualizar(req, res, next);

      expect(plantillasService.actualizar).toHaveBeenCalledWith('5', req.body, req.usuario);
      expect(res.json).toHaveBeenCalledWith({ id: 5, nombre: 'Actualizada' });
    });
  });

  describe('eliminar', () => {
    test('pasa el usuario completo al servicio para validar permisos', async () => {
      const req = crearReq({ params: { id: '5' } });
      const res = crearRes();
      plantillasService.eliminar.mockResolvedValue();

      await plantillasController.eliminar(req, res, next);

      expect(plantillasService.eliminar).toHaveBeenCalledWith('5', req.usuario);
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });
});
