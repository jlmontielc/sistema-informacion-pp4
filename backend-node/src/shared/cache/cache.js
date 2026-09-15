const crypto = require('crypto');
const { obtenerCliente, estaConectado } = require('./redis');

const serializar = (valor) => JSON.stringify(valor);
const deserializar = (valor) => (valor !== null && valor !== undefined ? JSON.parse(valor) : null);

const metricas = {
  hits: 0,
  misses: 0,
  sets: 0,
  dels: 0,
  errores: 0,
};

const incrementar = (contador) => {
  metricas[contador] += 1;
};

const hashClave = (...partes) => {
  const texto = partes.map((p) => JSON.stringify(p)).join('|');
  return crypto.createHash('sha256').update(texto).digest('hex');
};

const cache = {
  obtener: async (clave) => {
    const cliente = obtenerCliente();
    if (!cliente || !estaConectado()) {
      incrementar('misses');
      return null;
    }

    try {
      const valor = await cliente.get(clave);
      if (valor !== null && valor !== undefined) {
        incrementar('hits');
        return deserializar(valor);
      }
      incrementar('misses');
      return null;
    } catch (err) {
      incrementar('errores');
      console.error(`Error leyendo caché ${clave}:`, err.message);
      return null;
    }
  },

  guardar: async (clave, valor, ttlSegundos = 60) => {
    const cliente = obtenerCliente();
    if (!cliente || !estaConectado()) return;

    try {
      await cliente.setex(clave, ttlSegundos, serializar(valor));
      incrementar('sets');
    } catch (err) {
      incrementar('errores');
      console.error(`Error guardando caché ${clave}:`, err.message);
    }
  },

  eliminar: async (clave) => {
    const cliente = obtenerCliente();
    if (!cliente || !estaConectado()) return;

    try {
      await cliente.del(clave);
      incrementar('dels');
    } catch (err) {
      incrementar('errores');
      console.error(`Error eliminando caché ${clave}:`, err.message);
    }
  },

  eliminarPorPatron: async (patron) => {
    const cliente = obtenerCliente();
    if (!cliente || !estaConectado()) return;

    try {
      const stream = cliente.scanStream({ match: patron, count: 100 });
      const pipeline = cliente.pipeline();
      let total = 0;

      await new Promise((resolve, reject) => {
        stream.on('data', (claves) => {
          if (claves.length) {
            claves.forEach((clave) => pipeline.del(clave));
            total += claves.length;
          }
        });
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      if (total > 0) {
        await pipeline.exec();
        metricas.dels += total;
      }
    } catch (err) {
      incrementar('errores');
      console.error(`Error eliminando caché por patrón ${patron}:`, err.message);
    }
  },

  envolver: async (clave, fn, ttlSegundos = 60) => {
    const cacheado = await cache.obtener(clave);
    if (cacheado !== null) return cacheado;

    const resultado = await fn();
    await cache.guardar(clave, resultado, ttlSegundos);
    return resultado;
  },

  hashClave: (...partes) => hashClave(...partes),

  obtenerMetricas: () => ({ ...metricas }),

  reiniciarMetricas: () => {
    metricas.hits = 0;
    metricas.misses = 0;
    metricas.sets = 0;
    metricas.dels = 0;
    metricas.errores = 0;
  },
};

module.exports = cache;
