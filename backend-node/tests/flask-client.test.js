const { limpiarArrayMedico } = require('../src/shared/utils/flask-client');

jest.mock('../src/shared/constants', () => ({
  FLASK_IA_URL: 'http://localhost:5000',
  JWT_SECRET: 'test-secret',
  ENC_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  ENC_IV: '0123456789abcdef0123456789abcdef',
}));

describe('flask-client - limpiarArrayMedico', () => {
  test('elimina valores vacios, nulos y en blanco', () => {
    const resultado = limpiarArrayMedico(['', null, undefined, '  ', 'rodilla']);
    expect(resultado).toEqual(['rodilla']);
  });

  test('elimina variantes de "ninguna" y "sin lesiones" sin importar acentos o mayusculas', () => {
    const resultado = limpiarArrayMedico([
      'Ninguna',
      'NINGUNA',
      'sin lesiones',
      'Sin Lesion',
      'ningun medicamento',
      'rodilla - LCA',
    ]);
    expect(resultado).toEqual(['rodilla - LCA']);
  });

  test('elimina valores no validos como "n/a" o "no"', () => {
    const resultado = limpiarArrayMedico(['n/a', 'N/A', 'no', 'No', 'hipertension']);
    expect(resultado).toEqual(['hipertension']);
  });

  test('devuelve array vacio si todos los valores son vacios', () => {
    expect(limpiarArrayMedico(['ninguna', ''])).toEqual([]);
  });

  test('devuelve array vacio si la entrada no es un array', () => {
    expect(limpiarArrayMedico(null)).toEqual([]);
    expect(limpiarArrayMedico('texto')).toEqual([]);
  });

  test('mantiene valores medicos reales', () => {
    const resultado = limpiarArrayMedico(['rodilla - LCA', 'hipertension', 'polen']);
    expect(resultado).toEqual(['rodilla - LCA', 'hipertension', 'polen']);
  });
});
