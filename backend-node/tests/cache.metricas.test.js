const reportesService = require('../src/modules/reportes/reportes.service');
const cache = require('../src/shared/cache/cache');

jest.mock('../src/modules/reportes/reportes.service', () => {
  const original = jest.requireActual('../src/modules/reportes/reportes.service');
  return {
    ...original,
    metricasPorGrupo: jest.fn(),
    evolucionPorGrupo: jest.fn(),
    comparativa: jest.fn(),
  };
});

describe('Metricas de cache', () => {
  beforeEach(() => {
    cache.reiniciarMetricas();
  });

  test('obtenerMetricas inicia en cero', () => {
    expect(cache.obtenerMetricas()).toEqual({
      hits: 0,
      misses: 0,
      sets: 0,
      dels: 0,
      errores: 0,
    });
  });

  test('envolver incrementa misses cuando no hay cache', async () => {
    await cache.envolver('clave:metricas', () => Promise.resolve({ ok: true }), 60);
    const metricas = cache.obtenerMetricas();
    expect(metricas.misses).toBe(1);
    expect(metricas.sets).toBe(0);
  });
});
