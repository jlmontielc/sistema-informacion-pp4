const cache = require('../src/shared/cache/cache');

describe('Cache - modo fallback (Redis deshabilitado)', () => {
  test('obtener devuelve null cuando Redis no está habilitado', async () => {
    const resultado = await cache.obtener('clave:inexistente');
    expect(resultado).toBeNull();
  });

  test('guardar no falla cuando Redis no está habilitado', async () => {
    await expect(cache.guardar('clave', { dato: 1 }, 60)).resolves.toBeUndefined();
  });

  test('eliminar no falla cuando Redis no está habilitado', async () => {
    await expect(cache.eliminar('clave')).resolves.toBeUndefined();
  });

  test('eliminarPorPatron no falla cuando Redis no está habilitado', async () => {
    await expect(cache.eliminarPorPatron('patron:*')).resolves.toBeUndefined();
  });

  test('envolver ejecuta la función y retorna el resultado', async () => {
    const fn = jest.fn().mockResolvedValue({ valor: 42 });
    const resultado = await cache.envolver('clave:test', fn, 60);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({ valor: 42 });
  });

  test('hashClave genera el mismo hash para los mismos argumentos', () => {
    const a = cache.hashClave('ejercicios', { pagina: 1 });
    const b = cache.hashClave('ejercicios', { pagina: 1 });
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
});
