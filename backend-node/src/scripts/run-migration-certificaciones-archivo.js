/**
 * Aplica migracion certificaciones-archivo: agrega columnas archivo,
 * archivo_mime y tiene_archivo a la tabla certificaciones.
 *
 * Ejecucion:
 *   cd backend-node
 *   node src/scripts/run-migration-certificaciones-archivo.js
 *
 * Idempotente: si alguna columna ya existe en la tabla, su statement
 * correspondiente se omite y no se vuelve a aplicar.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../shared/database/connection');

const MIGRATION_PATH = path.join(__dirname, '..', '..', '..', 'database', 'migrations', '20260927_certificaciones_archivo.sql');

// Quita lineas de comentario (-- ...) y lineas vacias de un fragmento de SQL.
const limpiarFragmento = (fragmento) =>
  fragmento
    .split('\n')
    .filter((linea) => {
      const recortada = linea.trim();
      return recortada.length > 0 && !recortada.startsWith('--');
    })
    .join('\n')
    .trim();

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a MySQL establecida.');

    const sql = fs.readFileSync(MIGRATION_PATH, 'utf-8');

    // Parte el contenido por ';' y descarta fragmentos que quedan vacios
    // (los comentarios de cabecera no se envian al motor).
    const sentencias = sql
      .split(';')
      .map(limpiarFragmento)
      .filter((sentencia) => sentencia.length > 0);

    // Consulta una vez las columnas actuales para no re-aplicar la migracion.
    const columnasActuales = await sequelize.query('SHOW COLUMNS FROM certificaciones');
    const columnasExistentes = new Set(columnasActuales[0].map((c) => c.Field));

    for (const sentencia of sentencias) {
      const coincidencias = sentencia.match(/ADD COLUMN (\w+)/gi) || [];
      const columnasNuevas = coincidencias.map((coincidencia) => coincidencia.replace(/ADD COLUMN /i, ''));

      if (columnasNuevas.length > 0 && columnasNuevas.every((columna) => columnasExistentes.has(columna))) {
        console.log(`Omitido (columnas ya existentes): ${sentencia.replace(/\s+/g, ' ')}`);
        continue;
      }

      await sequelize.query(sentencia);
      console.log(`Aplicado: ${sentencia.replace(/\s+/g, ' ')}`);
    }

    // Verificacion final de las columnas de la tabla.
    const columnasFinales = await sequelize.query('SHOW COLUMNS FROM certificaciones');
    console.log(`Columnas finales: ${columnasFinales[0].map((c) => c.Field).join(', ')}`);
    console.log('Migracion certificaciones-archivo aplicada exitosamente.');
  } catch (error) {
    console.error('Error aplicando migracion:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();
