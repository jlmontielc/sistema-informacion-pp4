const {
  esquemaRegistro,
  esquemaRegistroInstruido,
  esquemaActualizarPerfil,
} = require('../src/modules/auth/auth.validation');

const instruidoRegistro = {
  nombre: 'Cliente A',
  email: 'cliente@test.com',
  contrasena: 'Password123',
  edad: 30,
  peso: 75,
  altura: 1.75,
  sexo: 'masculino',
  nivelActividad: 'moderado',
  diasDisponibles: 3,
  diasSemana: [1, 3, 5],
};

describe('AuthValidation - esquemaRegistroInstruido', () => {
  test('acepta registro de instruido con dias coherentes', () => {
    const { error } = esquemaRegistroInstruido.validate(instruidoRegistro);
    expect(error).toBeUndefined();
  });

  test('rechaza dias incoherentes', () => {
    const { error } = esquemaRegistroInstruido.validate({
      ...instruidoRegistro,
      diasDisponibles: 4,
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/coincidir/);
  });
});

describe('AuthValidation - esquemaRegistro', () => {
  test('acepta registro de instruido con dias coherentes', () => {
    const { error } = esquemaRegistro.validate(instruidoRegistro);
    expect(error).toBeUndefined();
  });

  test('acepta registro de entrenador sin dias', () => {
    const { error } = esquemaRegistro.validate({
      nombre: 'Entrenador A',
      email: 'entrenador@test.com',
      contrasena: 'Password123',
      rol: 'entrenador',
      especialidad: 'Funcional',
    });
    expect(error).toBeUndefined();
  });

  test('rechaza registro de instruido sin diasDisponibles', () => {
    const { error } = esquemaRegistro.validate({
      ...instruidoRegistro,
      diasDisponibles: undefined,
    });
    expect(error).toBeDefined();
  });

  test('rechaza dias incoherentes para instruido', () => {
    const { error } = esquemaRegistro.validate({
      ...instruidoRegistro,
      diasSemana: [1, 3, 5, 6],
    });
    expect(error).toBeDefined();
  });
});

describe('AuthValidation - esquemaActualizarPerfil', () => {
  test('acepta actualizacion de dias coherentes', () => {
    const { error } = esquemaActualizarPerfil.validate({
      diasDisponibles: 2,
      diasSemana: [2, 4],
    });
    expect(error).toBeUndefined();
  });

  test('rechaza actualizacion de dias incoherentes', () => {
    const { error } = esquemaActualizarPerfil.validate({
      diasDisponibles: 2,
      diasSemana: [1, 3, 5],
    });
    expect(error).toBeDefined();
  });
});
