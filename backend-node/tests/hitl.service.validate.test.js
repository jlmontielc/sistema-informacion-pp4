const hitlService = require('../src/modules/entrenamiento/hitl.service');

jest.mock('../src/modules/instruidos/instruido.model', () => {
  const crearModeloMock = () => ({
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  });
  return { Instruido: crearModeloMock() };
});

jest.mock('../src/modules/instruidos/perfil-medico.service', () => ({
  obtenerPerfilDescifradoParaFlask: jest.fn(),
}));

jest.mock('../src/shared/utils/flask-client', () => ({
  httpRequest: jest.fn(),
  descifrarSeguro: jest.fn((valor) => valor),
  parsearCampoJson: jest.fn((valor) => {
    if (!valor) return [];
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [String(parsed)];
    } catch {
      if (typeof valor === 'string') return valor.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    }
  }),
  CAMPOS_SENSIBLES: ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes', 'medicacionActual'],
}));

const { Instruido } = require('../src/modules/instruidos/instruido.model');
const perfilMedicoService = require('../src/modules/instruidos/perfil-medico.service');
const { httpRequest } = require('../src/shared/utils/flask-client');

const crearUsuario = (rol, id = 1) => ({
  id,
  email: `${rol}@test.com`,
  nombre: `Usuario ${rol}`,
  rol,
  tipo: rol === 'instruido' ? 'instruido' : 'entrenador',
});

const crearInstruidoMock = (sobreescribir = {}) => ({
  id: 5,
  nombre: 'Cliente A',
  edad: 30,
  peso: 75,
  altura: 1.75,
  sexo: 'masculino',
  nivelActividad: 'moderado',
  entrenadorId: 2,
  ...sobreescribir,
});

const crearPerfilDescifradoMock = () => ({
  instruidoId: 5,
  alergias: '["Polen"]',
  intolerancias: '["Lactosa"]',
  lesiones: '["rodilla - LCA"]',
  condicionesPreexistentes: '["hipertension"]',
  medicacionActual: '["Losartan"]',
  observaciones: 'Ninguna',
});

const resetearMocks = () => {
  Instruido.findOne.mockReset();
  perfilMedicoService.obtenerPerfilDescifradoParaFlask.mockReset();
  httpRequest.mockReset();
};

describe('HITLService - validarEjercicio', () => {
  beforeEach(resetearMocks);

  test('incluye perfilMedico descifrado en el payload enviado a Flask', async () => {
    const usuario = crearUsuario('entrenador', 2);
    Instruido.findOne.mockResolvedValue(crearInstruidoMock());
    perfilMedicoService.obtenerPerfilDescifradoParaFlask.mockResolvedValue(crearPerfilDescifradoMock());
    httpRequest.mockResolvedValue({ status: 200, data: { validacion: { bloqueado: false } } });

    const resultado = await hitlService.validarEjercicio(1, 5, usuario, 80);

    expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
    expect(perfilMedicoService.obtenerPerfilDescifradoParaFlask).toHaveBeenCalledWith(5);
    expect(httpRequest).toHaveBeenCalledWith(
      '/api/predict/validate',
      'POST',
      expect.objectContaining({
        ejercicioId: 1,
        clienteId: 5,
        cargaKg: 80,
        perfilMedico: expect.objectContaining({
          lesiones: ['rodilla - LCA'],
          condicionesPreexistentes: ['hipertension'],
          alergias: ['Polen'],
          medicacion: ['Losartan'],
        }),
      }),
      5000,
    );
    expect(resultado).toEqual({ validacion: { bloqueado: false } });
  });

  test('rechaza si el cliente no pertenece al entrenador', async () => {
    const usuario = crearUsuario('entrenador', 2);
    Instruido.findOne.mockResolvedValue(null);

    await expect(hitlService.validarEjercicio(1, 5, usuario))
      .rejects
      .toMatchObject({ status: 404, message: 'Instruido no encontrado o no pertenece al entrenador' });

    expect(perfilMedicoService.obtenerPerfilDescifradoParaFlask).not.toHaveBeenCalled();
    expect(httpRequest).not.toHaveBeenCalled();
  });

  test('administrador puede validar ejercicio para cualquier cliente', async () => {
    const usuario = crearUsuario('administrador', 99);
    Instruido.findOne.mockResolvedValue(crearInstruidoMock({ entrenadorId: 2 }));
    perfilMedicoService.obtenerPerfilDescifradoParaFlask.mockResolvedValue(crearPerfilDescifradoMock());
    httpRequest.mockResolvedValue({ status: 200, data: { validacion: { bloqueado: false } } });

    await hitlService.validarEjercicio(1, 5, usuario);

    expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
  });
});
