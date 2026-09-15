const blacklist = require('../src/shared/utils/blacklist');
const jwt = require('jsonwebtoken');

describe('Blacklist JWT - modo fallback (Redis deshabilitado)', () => {
  const generarToken = (payload) => jwt.sign(payload, 'secreto-test', { expiresIn: '1h' });

  test('token no está invalidado inicialmente', async () => {
    const token = generarToken({ id: 1, tipo: 'instruido' });
    const invalidado = await blacklist.estaInvalidado(token);
    expect(invalidado).toBe(false);
  });

  test('invalida un token y luego lo detecta', async () => {
    const token = generarToken({ id: 1, tipo: 'instruido' });
    await blacklist.agregar(token);
    const invalidado = await blacklist.estaInvalidado(token);
    expect(invalidado).toBe(true);
  });

  test('dos tokens diferentes son independientes', async () => {
    const tokenA = generarToken({ id: 1, tipo: 'instruido' });
    const tokenB = generarToken({ id: 2, tipo: 'instruido' });
    await blacklist.agregar(tokenA);
    expect(await blacklist.estaInvalidado(tokenA)).toBe(true);
    expect(await blacklist.estaInvalidado(tokenB)).toBe(false);
  });
});
