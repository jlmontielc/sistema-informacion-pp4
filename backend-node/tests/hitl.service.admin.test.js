const hitlService = require('../src/modules/entrenamiento/hitl.service');

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../src/modules/instruidos/perfil-medico.model', () => ({
  PerfilMedico: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../src/modules/entrenamiento/entrenamiento.model', () => ({
  RegistroEntrenamiento: { findAll: jest.fn() },
  RutinaAsignada: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  PlantillaEntrenamiento: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../src/modules/entrenamiento/hitl-feedback.model', () => ({
  HitlFeedback: { create: jest.fn() },
}));

jest.mock('../src/modules/metabolismo/metabolismo.model', () => ({
  CalculoMetabolico: { findOne: jest.fn() },
}));

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
      return typeof valor === 'string' ? valor.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }
  }),
  limpiarArrayMedico: jest.fn((valores) => (Array.isArray(valores) ? valores.filter(Boolean).map(String) : [])),
  CAMPOS_SENSIBLES: ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes', 'medicacionActual'],
}));

jest.mock('../src/shared/cache/cache', () => ({
  obtener: jest.fn(),
  guardar: jest.fn(),
  eliminar: jest.fn(),
  eliminarPorPatron: jest.fn(),
  envolver: jest.fn((clave, fn) => fn()),
}));

const { Instruido } = require('../src/modules/instruidos/instruido.model');
const { PerfilMedico } = require('../src/modules/instruidos/perfil-medico.model');
const { RegistroEntrenamiento, PlantillaEntrenamiento } = require('../src/modules/entrenamiento/entrenamiento.model');
const { CalculoMetabolico } = require('../src/modules/metabolismo/metabolismo.model');
const { httpRequest } = require('../src/shared/utils/flask-client');

const crearUsuario = (rol, id = 1) => ({ id, rol, tipo: rol === 'instruido' ? 'instruido' : 'entrenador' });

const crearInstruidoMock = (sobreescribir = {}) => ({
  id: 5,
  nombre: 'Cliente B',
  edad: 28,
  peso: 75,
  altura: 1.75,
  sexo: 'masculino',
  nivelActividad: 'moderado',
  nivelExperiencia: 'intermedio',
  propositoEntrenamiento: 'ganancia_muscular',
  diasDisponibles: 3,
  diasSemana: [1, 3, 5],
  entrenadorId: 2,
  ...sobreescribir,
});

const plantillaMock = () => ({
  toJSON: () => ({
    id: 1,
    nombre: 'Full Body Fuerza',
    tipo: 'fuerza',
    objetivo: 'ganancia_muscular',
    nivelDificultad: 'intermedio',
    frecuenciaSemanal: 3,
    duracionSemanas: 8,
    diasSemana: {},
  }),
});

const resetearMocks = () => {
  Instruido.findOne.mockReset();
  PerfilMedico.findOne.mockReset();
  RegistroEntrenamiento.findAll.mockReset();
  PlantillaEntrenamiento.findAll.mockReset();
  CalculoMetabolico.findOne.mockReset();
  httpRequest.mockReset();
};

beforeEach(resetearMocks);

describe('HITLService - sugerirRutina (acceso por rol)', () => {
  const prepararRespuesta = () => {
    Instruido.findOne.mockResolvedValue(crearInstruidoMock());
    PerfilMedico.findOne.mockResolvedValue(null);
    RegistroEntrenamiento.findAll.mockResolvedValue([]);
    PlantillaEntrenamiento.findAll.mockResolvedValue([plantillaMock()]);
    httpRequest.mockResolvedValue({ status: 200, data: { success: true, plantillaId: 1, confianza: 80 } });
  };

  test('entrenador solo puede sugerir rutinas a sus instruidos', async () => {
    prepararRespuesta();

    const resultado = await hitlService.sugerirRutina(5, 2, {}, { persistir: false }, crearUsuario('entrenador', 2));

    expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
    expect(PlantillaEntrenamiento.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { entrenadorId: 2, activa: true } }),
    );
    expect(httpRequest).toHaveBeenCalledWith(
      '/api/predict/routine',
      'POST',
      expect.objectContaining({ clienteId: 5, entrenadorId: 2 }),
      10000,
    );
    expect(resultado).toEqual({ success: true, plantillaId: 1, confianza: 80, hasLesiones: false });
  });

  test('entrenador recibe 404 con cliente ajeno', async () => {
    Instruido.findOne.mockResolvedValue(null);

    await expect(hitlService.sugerirRutina(5, 2, {}, { persistir: false }, crearUsuario('entrenador', 2)))
      .rejects
      .toMatchObject({ status: 404, message: 'Instruido no encontrado o no pertenece al entrenador' });

    expect(httpRequest).not.toHaveBeenCalled();
  });

  test('administrador puede sugerir rutina para un cliente de otro entrenador', async () => {
    prepararRespuesta();

    await hitlService.sugerirRutina(5, 1, {}, { persistir: false }, crearUsuario('administrador', 1));

    expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(PlantillaEntrenamiento.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { activa: true } }),
    );
  });
});

describe('HITLService - sugerirDieta (acceso por rol)', () => {
  const prepararRespuesta = () => {
    Instruido.findOne.mockResolvedValue(crearInstruidoMock());
    PerfilMedico.findOne.mockResolvedValue(null);
    CalculoMetabolico.findOne.mockResolvedValue({ tmb: '1500.00', gct: '2100.00' });
    httpRequest.mockResolvedValue({ status: 200, data: { objetivoCalorico: 2400 } });
  };

  test('administrador puede sugerir dieta para un cliente de otro entrenador', async () => {
    prepararRespuesta();

    const resultado = await hitlService.sugerirDieta(5, 1, {}, { persistir: false }, crearUsuario('administrador', 1));

    expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(httpRequest).toHaveBeenCalledWith(
      '/api/predict/dieta',
      'POST',
      expect.objectContaining({ tmb: 1500, gct: 2100 }),
      10000,
    );
    expect(resultado).toEqual({ objetivoCalorico: 2400 });
  });

  test('entrenador recibe 400 sin calculo metabolico previo', async () => {
    Instruido.findOne.mockResolvedValue(crearInstruidoMock());
    PerfilMedico.findOne.mockResolvedValue(null);
    CalculoMetabolico.findOne.mockResolvedValue(null);

    await expect(hitlService.sugerirDieta(5, 2, {}, { persistir: false }, crearUsuario('entrenador', 2)))
      .rejects
      .toMatchObject({ status: 400 });

    expect(httpRequest).not.toHaveBeenCalled();
  });
});
