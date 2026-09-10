const authService = require('../src/modules/auth/auth.service');

jest.mock('../src/modules/auth/entrenador.model', () => ({
  Entrenador: { findOne: jest.fn(), findByPk: jest.fn() },
}));

jest.mock('../src/modules/instruidos/instruido.model', () => ({
  Instruido: { findOne: jest.fn(), findByPk: jest.fn() },
}));

jest.mock('../src/modules/instruidos/perfil-medico.model', () => ({
  PerfilMedico: { findOne: jest.fn() },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'token-mock'),
  verify: jest.fn(),
}));

const { Entrenador } = require('../src/modules/auth/entrenador.model');
const { Instruido } = require('../src/modules/instruidos/instruido.model');
const { PerfilMedico } = require('../src/modules/instruidos/perfil-medico.model');
const bcrypt = require('bcryptjs');

const crearEntrenadorMock = (sobreescribir = {}) => ({
  id: 1,
  nombre: 'Entrenador A',
  email: 'entrenador@test.com',
  contrasenaHash: 'hash',
  rol: 'entrenador',
  especialidad: 'Funcional',
  ...sobreescribir,
});

const crearInstruidoMock = (sobreescribir = {}) => ({
  id: 2,
  nombre: 'Instruido A',
  email: 'instruido@test.com',
  contrasenaHash: 'hash',
  rol: 'instruido',
  ...sobreescribir,
});

const crearPerfilMedicoMock = (sobreescribir = {}) => ({
  instruidoId: 2,
  alergias: 'CIFRADO(Polen)',
  intolerancias: null,
  lesiones: null,
  condicionesPreexistentes: null,
  medicacionActual: null,
  observaciones: 'Ninguna',
  ...sobreescribir,
});

const resetearMocks = () => {
  Entrenador.findOne.mockReset();
  Instruido.findOne.mockReset();
  PerfilMedico.findOne.mockReset();
  bcrypt.compare.mockReset();
};

describe('AuthService', () => {
  beforeEach(resetearMocks);

  describe('iniciarSesion', () => {
    test('login de entrenador devuelve user sin perfilMedicoCompleto', async () => {
      Entrenador.findOne.mockResolvedValue(crearEntrenadorMock());
      bcrypt.compare.mockResolvedValue(true);

      const resultado = await authService.iniciarSesion({ email: 'entrenador@test.com', contrasena: 'Password123' });

      expect(resultado.user).not.toHaveProperty('perfilMedicoCompleto');
      expect(resultado.user).toHaveProperty('especialidad');
      expect(PerfilMedico.findOne).not.toHaveBeenCalled();
    });

    test('login de instruido devuelve perfilMedicoCompleto true cuando tiene datos medicos', async () => {
      Entrenador.findOne.mockResolvedValue(null);
      Instruido.findOne.mockResolvedValue(crearInstruidoMock());
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMedicoMock());
      bcrypt.compare.mockResolvedValue(true);

      const resultado = await authService.iniciarSesion({ email: 'instruido@test.com', contrasena: 'Password123' });

      expect(resultado.user.perfilMedicoCompleto).toBe(true);
      expect(PerfilMedico.findOne).toHaveBeenCalledWith({ where: { instruidoId: 2 } });
    });

    test('login de instruido devuelve perfilMedicoCompleto false cuando no tiene datos medicos', async () => {
      Entrenador.findOne.mockResolvedValue(null);
      Instruido.findOne.mockResolvedValue(crearInstruidoMock());
      PerfilMedico.findOne.mockResolvedValue(null);
      bcrypt.compare.mockResolvedValue(true);

      const resultado = await authService.iniciarSesion({ email: 'instruido@test.com', contrasena: 'Password123' });

      expect(resultado.user.perfilMedicoCompleto).toBe(false);
    });

    test('login de instruido devuelve perfilMedicoCompleto false con perfil vacio', async () => {
      Entrenador.findOne.mockResolvedValue(null);
      Instruido.findOne.mockResolvedValue(crearInstruidoMock());
      PerfilMedico.findOne.mockResolvedValue(crearPerfilMedicoMock({
        alergias: null,
        intolerancias: null,
        lesiones: null,
        condicionesPreexistentes: null,
        medicacionActual: null,
      }));
      bcrypt.compare.mockResolvedValue(true);

      const resultado = await authService.iniciarSesion({ email: 'instruido@test.com', contrasena: 'Password123' });

      expect(resultado.user.perfilMedicoCompleto).toBe(false);
    });
  });
});
