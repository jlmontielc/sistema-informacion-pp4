const crypto = require('../backend-node/src/shared/utils/crypto');

describe('Cifrado/descifrado AES-256-CBC', () => {
  it('debe cifrar y descifrar un texto correctamente', () => {
    const original = 'test data for medical fields';
    const cifrado = crypto.cifrar(original);
    const descifrado = crypto.descifrar(cifrado);
    expect(descifrado).toBe(original);
  });

  it('debe retornar null para valores nulos o vacíos', () => {
    expect(crypto.cifrar(null)).toBeNull();
    expect(crypto.cifrar('')).toBeNull();
    expect(crypto.descifrar(null)).toBeNull();
    expect(crypto.descifrar('')).toBeNull();
  });

  it('debe manejar datos médicos comunes', () => {
    const campos = ['alergias: "penicilina"', 'intolerancias: "nada"', 'lesiones: "nada"', 'condicionesPreexistentes: "hipertensión"'];
    for (const campo of campos) {
      const cifrado = crypto.cifrar(campo);
      const descifrado = crypto.descifrar(cifrado);
      expect(descifrado).toBe(campo);
    }
  });
});