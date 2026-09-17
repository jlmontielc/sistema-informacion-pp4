const plantillasController = require('../src/modules/entrenamiento/plantillas.controller');
const plantillasService = require('../src/modules/entrenamiento/plantillas.service');
const cache = require('../src/shared/cache/cache');

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

const entrenadorId = 1;
const adminId = 99;
const plantillaId = 5;

const crearReq = (sobreescribir = {}) => ({
  usuario: { id: entrenadorId, rol: 'entrenador' },
  params: {},
  query: {},
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

const claveContiene = (texto) => expect.stringContaining(texto);

describe('PlantillasController - invalidacion de cache', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.spyOn(cache, 'eliminar').mockResolvedValue();
    jest.spyOn(cache, 'eliminarPorPatron').mockResolvedValue();
  });

  test('crear invalida listado y claves de la plantilla', async () => {
    plantillasService.crear.mockResolvedValue({ id: plantillaId, entrenadorId });
    const req = crearReq({ body: { nombre: 'Nueva' } });
    const res = crearRes();

    await plantillasController.crear(req, res, next);

    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:listado:${entrenadorId}:`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:id:*:${plantillaId}`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:dia:*:${plantillaId}:`));
  });

  test('actualizar invalida listado y claves de la plantilla', async () => {
    plantillasService.actualizar.mockResolvedValue({ id: plantillaId, entrenadorId });
    const req = crearReq({ params: { id: String(plantillaId) }, body: { nombre: 'Actualizada' } });
    const res = crearRes();

    await plantillasController.actualizar(req, res, next);

    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:listado:${entrenadorId}:`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:id:*:${plantillaId}`));
  });

  test('eliminar invalida listado del entrenador propietario, no del admin', async () => {
    plantillasService.eliminar.mockResolvedValue({ id: plantillaId, entrenadorId });
    const req = crearReq({ usuario: { id: adminId, rol: 'administrador' }, params: { id: String(plantillaId) } });
    const res = crearRes();

    await plantillasController.eliminar(req, res, next);

    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:listado:${entrenadorId}:`));
    expect(cache.eliminarPorPatron).not.toHaveBeenCalledWith(claveContiene(`plantillas:listado:${adminId}:`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:id:*:${plantillaId}`));
  });

  test('agregarEjercicioADia invalida claves de la plantilla', async () => {
    plantillasService.agregarEjercicioADia.mockResolvedValue({ id: 1, ejercicioId: 2 });
    plantillasService.obtenerPorId.mockResolvedValue({ id: plantillaId, entrenadorId });
    const req = crearReq({ params: { id: String(plantillaId), dia: '1' }, body: { ejercicioId: 2 } });
    const res = crearRes();

    await plantillasController.agregarEjercicioADia(req, res, next);

    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:id:*:${plantillaId}`));
    expect(cache.eliminarPorPatron).toHaveBeenCalledWith(claveContiene(`plantillas:dia:*:${plantillaId}:`));
  });
});
