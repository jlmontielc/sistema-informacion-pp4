const {
  esquemaCrear,
  esquemaActualizar,
  esquemaActualizarPropio,
} = require('../src/modules/instruidos/instruido.validation');

const instruidoBase = {
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

describe('InstruidoValidation - esquemaCrear', () => {
  test('acepta datos validos con dias coherentes', () => {
    const { error } = esquemaCrear.validate(instruidoBase);
    expect(error).toBeUndefined();
  });

  test('rechaza cuando falta diasDisponibles', () => {
    const { error } = esquemaCrear.validate({ ...instruidoBase, diasDisponibles: undefined });
    expect(error).toBeDefined();
  });

  test('rechaza cuando falta diasSemana', () => {
    const { error } = esquemaCrear.validate({ ...instruidoBase, diasSemana: undefined });
    expect(error).toBeDefined();
  });

  test('rechaza diasSemana con valores fuera de rango', () => {
    const { error } = esquemaCrear.validate({ ...instruidoBase, diasSemana: [0, 8] });
    expect(error).toBeDefined();
  });

  test('rechaza diasSemana con duplicados', () => {
    const { error } = esquemaCrear.validate({ ...instruidoBase, diasSemana: [1, 1, 3] });
    expect(error).toBeDefined();
  });

  test('rechaza cuando diasDisponibles no coincide con longitud de diasSemana', () => {
    const { error } = esquemaCrear.validate({ ...instruidoBase, diasDisponibles: 4 });
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/coincidir/);
  });
});

describe('InstruidoValidation - esquemaActualizar', () => {
  test('acepta actualizacion parcial sin dias', () => {
    const { error } = esquemaActualizar.validate({ peso: 76 });
    expect(error).toBeUndefined();
  });

  test('acepta actualizacion con dias coherentes', () => {
    const { error } = esquemaActualizar.validate({ diasDisponibles: 2, diasSemana: [2, 4] });
    expect(error).toBeUndefined();
  });

  test('rechaza actualizacion con dias incoherentes', () => {
    const { error } = esquemaActualizar.validate({ diasDisponibles: 2, diasSemana: [1, 3, 5] });
    expect(error).toBeDefined();
  });
});

describe('InstruidoValidation - esquemaActualizarPropio', () => {
  test('rechaza objeto vacio', () => {
    const { error } = esquemaActualizarPropio.validate({});
    expect(error).toBeDefined();
  });

  test('acepta actualizacion con dias coherentes', () => {
    const { error } = esquemaActualizarPropio.validate({ diasDisponibles: 1, diasSemana: [6] });
    expect(error).toBeUndefined();
  });
});
