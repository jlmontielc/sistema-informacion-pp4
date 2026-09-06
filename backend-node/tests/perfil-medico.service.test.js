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
    test('cifra campos sensibles y devuelve solo instruidoId, observaciones, perfilMedicoCompleto', async () => {
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
      expect(resultado).toEqual({
        instruidoId: 1,
        observaciones: 'Actualizado',
        perfilMedicoCompleto: true,
      });
      expect(resultado).not.toHaveProperty('alergias');
      expect(resultado).not.toHaveProperty('lesiones');
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
  });
});
