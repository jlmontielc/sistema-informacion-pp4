const perfilMedicoService = require('../src/modules/instruidos/perfil-medico.service');

jest.mock('../src/modules/instruidos/perfil-medico.model', () => ({
  PerfilMedico: {
    findOne: jest.fn(),
    upsert: jest.fn(),
  },
}));

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: {
    findOne: jest.fn(),
  },
}));

jest.mock('../src/shared/utils/crypto', () => ({
  cifrar: jest.fn((valor) => `CIFRADO(${valor})`),
  descifrar: jest.fn((valor) => String(valor).replace(/^CIFRADO\((.*)\)$/, '$1')),
}));

const { PerfilMedico } = require('../src/modules/instruidos/perfil-medico.model');
const { Instruido } = require('../src/modules/instruidos/instruido.model');
const { cifrar, descifrar } = require('../src/shared/utils/crypto');

const crearUsuario = (rol, id = 1) => ({
  id,
  email: `${rol}@test.com`,
  nombre: `Usuario ${rol}`,
  rol,
  tipo: rol === 'instruido' ? 'instruido' : 'entrenador',
});

const crearPerfilMock = (sobreescribir = {}) => ({
  instruidoId: 1,
  alergias: 'CIFRADO(["Polen"])',
  intolerancias: 'CIFRADO(["Lactosa"])',
  lesiones: 'CIFRADO(["rodilla"])',
  condicionesPreexistentes: 'CIFRADO(["asma"])',
  medicacionActual: 'CIFRADO(["Salbutamol"])',
  observaciones: 'Ninguna',
  toJSON() { return { ...this }; },
  ...sobreescribir,
});

const resetearMocks = () => {
  PerfilMedico.findOne.mockReset();
  PerfilMedico.upsert.mockReset();
  Instruido.findOne.mockReset();
  cifrar.mockClear();
  descifrar.mockClear();
};

describe('PerfilMedicoService', () => {
  beforeEach(resetearMocks);

  describe('obtenerPerfilSeguroParaFrontend', () => {
    test('no devuelve campos sensibles descifrados', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente A' });
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock());

      const resultado = await perfilMedicoService.obtenerPerfilSeguroParaFrontend(1, usuario);

      expect(resultado).toEqual({
        instruidoId: 1,
        observaciones: 'Ninguna',
        perfilMedicoCompleto: true,
      });
      expect(descifrar).not.toHaveBeenCalled();
    });

    test('devuelve perfil incompleto cuando no existe', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente A' });
      PerfilMedico.findOne.mockResolvedValue(null);

      const resultado = await perfilMedicoService.obtenerPerfilSeguroParaFrontend(1, usuario);

      expect(resultado).toEqual({
        instruidoId: 1,
        observaciones: null,
        perfilMedicoCompleto: false,
      });
    });

    test('entrenador solo accede a perfil de su instruido', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findOne.mockResolvedValue(null);

      const resultado = await perfilMedicoService.obtenerPerfilSeguroParaFrontend(5, usuario);

      expect(resultado).toBeNull();
      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
    });
  });

  describe('obtenerPerfilDescifradoParaFlask', () => {
    test('devuelve campos sensibles descifrados', async () => {
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock());

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoParaFlask(1);

      expect(resultado).toMatchObject({
        instruidoId: 1,
        alergias: '["Polen"]',
        intolerancias: '["Lactosa"]',
        lesiones: '["rodilla"]',
        condicionesPreexistentes: '["asma"]',
        medicacionActual: '["Salbutamol"]',
        observaciones: 'Ninguna',
      });
      expect(descifrar).toHaveBeenCalledTimes(5);
    });

    test('retorna null si no existe perfil', async () => {
      PerfilMedico.findOne.mockResolvedValue(null);

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoParaFlask(1);

      expect(resultado).toBeNull();
    });
  });

  describe('crearOActualizar', () => {
    test('cifra campos sensibles y devuelve perfil medico descifrado completo', async () => {
      const usuario = crearUsuario('instruido', 1);
      const datos = {
        alergias: '["Polen"]',
        lesiones: '["rodilla"]',
        observaciones: 'Actualizado',
      };
      Instruido.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente A' });
      PerfilMedico.upsert.mockResolvedValue([{}, true]);
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock({ observaciones: 'Actualizado' }));

      const resultado = await perfilMedicoService.crearOActualizar(1, datos, usuario);

      expect(cifrar).toHaveBeenCalledWith('["Polen"]');
      expect(cifrar).toHaveBeenCalledWith('["rodilla"]');
      expect(PerfilMedico.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          instruidoId: 1,
          alergias: 'CIFRADO(["Polen"])',
          lesiones: 'CIFRADO(["rodilla"])',
          observaciones: 'Actualizado',
        }),
      );
      expect(resultado).toMatchObject({
        instruidoId: 1,
        observaciones: 'Actualizado',
        perfilMedicoCompleto: true,
        datosMedicosCorruptos: false,
        alergias: '["Polen"]',
        lesiones: '["rodilla"]',
      });
    });

    test('no permite actualizar perfil de otro instruido', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findOne.mockResolvedValue(null);

      const resultado = await perfilMedicoService.crearOActualizar(2, { observaciones: 'x' }, usuario);

      expect(resultado).toBeNull();
      expect(PerfilMedico.upsert).not.toHaveBeenCalled();
    });

    test('administrador puede actualizar cualquier perfil', async () => {
      const usuario = crearUsuario('administrador', 99);
      Instruido.findOne.mockResolvedValue({ id: 5, nombre: 'Cliente B' });
      PerfilMedico.upsert.mockResolvedValue([{}, true]);
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock({ instruidoId: 5 }));

      const resultado = await perfilMedicoService.crearOActualizar(5, { observaciones: 'ok' }, usuario);

      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(resultado.instruidoId).toBe(5);
    });

    test('perfilMedicoCompleto es false cuando no hay campos sensibles', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente A' });
      PerfilMedico.upsert.mockResolvedValue([{}, true]);
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock({
        alergias: null,
        intolerancias: null,
        lesiones: null,
        condicionesPreexistentes: null,
        medicacionActual: null,
      }));

      const resultado = await perfilMedicoService.crearOActualizar(1, { observaciones: 'solo observaciones' }, usuario);

      expect(resultado.perfilMedicoCompleto).toBe(false);
    });
  });

  describe('obtenerPerfilDescifradoPropio', () => {
    test('devuelve perfil medico completo descifrado para el propio instruido', async () => {
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock());

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPropio(1);

      expect(resultado).toMatchObject({
        instruidoId: 1,
        alergias: '["Polen"]',
        intolerancias: '["Lactosa"]',
        lesiones: '["rodilla"]',
        condicionesPreexistentes: '["asma"]',
        medicacionActual: '["Salbutamol"]',
        observaciones: 'Ninguna',
        perfilMedicoCompleto: true,
        datosMedicosCorruptos: false,
      });
      expect(descifrar).toHaveBeenCalledTimes(5);
    });

    test('detecta datos medicos corruptos cuando no se pueden descifrar', async () => {
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock({
        alergias: 'a80953fe73a30cf2bd0e0ea43d7d64b6',
      }));

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPropio(1);

      expect(resultado).toMatchObject({
        instruidoId: 1,
        alergias: null,
        datosMedicosCorruptos: true,
      });
    });

    test('devuelve perfil vacio cuando no existe', async () => {
      PerfilMedico.findOne.mockResolvedValue(null);

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPropio(1);

      expect(resultado).toEqual({
        instruidoId: 1,
        alergias: null,
        intolerancias: null,
        lesiones: null,
        condicionesPreexistentes: null,
        medicacionActual: null,
        observaciones: null,
        perfilMedicoCompleto: false,
        datosMedicosCorruptos: false,
      });
      expect(descifrar).not.toHaveBeenCalled();
    });
  });

  describe('obtenerPerfilDescifradoPorInstruidoId', () => {
    test('administrador puede ver perfil descifrado de cualquier instruido', async () => {
      const usuario = crearUsuario('administrador', 99);
      Instruido.findOne.mockResolvedValue({ id: 5, nombre: 'Cliente B' });
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock({ instruidoId: 5 }));

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPorInstruidoId(5, usuario);

      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(resultado).toMatchObject({
        instruidoId: 5,
        alergias: '["Polen"]',
        perfilMedicoCompleto: true,
        datosMedicosCorruptos: false,
      });
      expect(descifrar).toHaveBeenCalled();
    });

    test('entrenador solo puede ver perfil descifrado de su instruido', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findOne.mockResolvedValue({ id: 5, nombre: 'Cliente B', entrenadorId: 2 });
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMock({ instruidoId: 5 }));

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPorInstruidoId(5, usuario);

      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
      expect(resultado).toMatchObject({ instruidoId: 5, perfilMedicoCompleto: true, datosMedicosCorruptos: false });
    });

    test('entrenador no puede ver perfil descifrado de instruido ajeno', async () => {
      const usuario = crearUsuario('entrenador', 2);
      Instruido.findOne.mockResolvedValue(null);

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPorInstruidoId(5, usuario);

      expect(resultado).toBeNull();
      expect(Instruido.findOne).toHaveBeenCalledWith({ where: { id: 5, entrenadorId: 2 } });
      expect(descifrar).not.toHaveBeenCalled();
    });

    test('rechaza roles no autorizados', async () => {
      const usuario = crearUsuario('instruido', 1);
      Instruido.findOne.mockResolvedValue({ id: 1, nombre: 'Cliente A' });

      const resultado = await perfilMedicoService.obtenerPerfilDescifradoPorInstruidoId(1, usuario);

      expect(resultado).toBeNull();
      expect(Instruido.findOne).not.toHaveBeenCalled();
      expect(descifrar).not.toHaveBeenCalled();
    });
  });

  describe('calcularPerfilMedicoCompleto', () => {
    test('devuelve false cuando todos los campos sensibles estan vacios', () => {
      expect(perfilMedicoService.calcularPerfilMedicoCompleto({
        alergias: null,
        intolerancias: '',
        lesiones: null,
        condicionesPreexistentes: null,
        medicacionActual: null,
      })).toBe(false);
    });

    test('devuelve true con al menos un campo sensible presente', () => {
      expect(perfilMedicoService.calcularPerfilMedicoCompleto({
        alergias: 'Polen',
        intolerancias: null,
        lesiones: null,
        condicionesPreexistentes: null,
        medicacionActual: null,
      })).toBe(true);
      expect(perfilMedicoService.calcularPerfilMedicoCompleto({
        medicacionActual: 'Aspirina',
      })).toBe(true);
    });

    test('devuelve false con listas u objetos vacios escritos literalmente', () => {
      expect(perfilMedicoService.calcularPerfilMedicoCompleto({
        alergias: '[]',
        intolerancias: '{}',
        lesiones: '[""]',
        condicionesPreexistentes: "['']",
        medicacionActual: '   ',
      })).toBe(false);
    });

    test('devuelve true con array JSON que contiene elementos reales', () => {
      expect(perfilMedicoService.calcularPerfilMedicoCompleto({
        alergias: '["Polen", "Mariscos"]',
        intolerancias: null,
        lesiones: null,
        condicionesPreexistentes: null,
        medicacionActual: null,
      })).toBe(true);
    });

    test('devuelve false con array JSON vacio', () => {
      expect(perfilMedicoService.calcularPerfilMedicoCompleto({
        alergias: '[]',
      })).toBe(false);
    });
  });
});
