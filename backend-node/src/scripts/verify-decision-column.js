/**
 * Verifica estado de la columna decision en rutinas_asignadas.
 */
require('dotenv').config();
const { sequelize } = require('../shared/database/connection');

const main = async () => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT decision, COUNT(*) as total
      FROM rutinas_asignadas
      GROUP BY decision
    `);
    console.log('Estado de decision en rutinas_asignadas:');
    console.table(results);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

main();
