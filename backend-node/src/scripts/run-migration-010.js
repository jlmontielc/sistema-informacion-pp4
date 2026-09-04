/**
 * Aplica migracion 010: agrega columna decision a rutinas_asignadas.
 *
 * Ejecucion:
 *   cd backend-node
 *   node src/scripts/run-migration-010.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../shared/database/connection');

const MIGRATION_PATH = path.join(__dirname, '..', '..', '..', 'database', 'migrations', '010_add_decision_rutinas_asignadas.sql');

const main = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexion a MySQL establecida.');

    const sql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
    await sequelize.query(sql);
    console.log('Migracion 010 aplicada exitosamente.');
  } catch (error) {
    console.error('Error aplicando migracion:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();
