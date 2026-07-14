const https = require('https');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../shared/database/connection');
const { Ejercicio } = require('../modules/entrenamiento/entrenamiento.model');

require('../shared/database/associations');

const DATA_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const LOCAL_CACHE = path.join(__dirname, '..', '..', 'data', 'exercises.json');

const CATEGORIA_MAP = {
  'upper arms': 'Brazos',
  'upper legs': 'Piernas',
  'back': 'Espalda',
  'waist': 'Cintura',
  'chest': 'Pecho',
  'shoulders': 'Hombros',
  'lower legs': 'Gemelos',
  'lower arms': 'Antebrazos',
  'cardio': 'Cardio',
  'neck': 'Cuello',
};

const EQUIPO_MAP = {
  'body weight': 'Peso corporal',
  'dumbbell': 'Mancuernas',
  'cable': 'Polea',
  'barbell': 'Barra',
  'leverage machine': 'Maquina',
  'band': 'Banda',
  'smith machine': 'Maquina Smith',
  'kettlebell': 'Pesa rusa',
  'weighted': 'Con peso',
  'stability ball': 'Balon aerobico',
  'ez barbell': 'Barra Z',
  'other': 'Otro',
};

function descargarJSON() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(LOCAL_CACHE)) {
      console.log('Usando exercises.json local...');
      const data = JSON.parse(fs.readFileSync(LOCAL_CACHE, 'utf-8'));
      return resolve(data);
    }

    console.log('Descargando exercises.json desde GitHub...');
    https.get(DATA_URL, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const dir = path.dirname(LOCAL_CACHE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(LOCAL_CACHE, body, 'utf-8');
        console.log(`Guardado en ${LOCAL_CACHE}`);
        resolve(JSON.parse(body));
      });
    }).on('error', reject);
  });
}

function mapearEjercicio(ex) {
  const grupoRaw = (ex.category || ex.body_part || '').toLowerCase().trim();
  const equipoRaw = (ex.equipment || '').toLowerCase().trim();

  return {
    nombre: ex.name,
    descripcion: null,
    instruccionesEs: ex.instructions?.es || ex.instructions?.en || null,
    grupoMuscular: CATEGORIA_MAP[grupoRaw] || ex.category || null,
    target: ex.target || null,
    equipoNecesario: EQUIPO_MAP[equipoRaw] || ex.equipment || null,
    dificultad: null,
    musculosSecundarios: ex.secondary_muscles || [],
    contraindicaLesiones: null,
    imagenUrl: ex.image || null,
    gifUrl: ex.gif_url || null,
  };
}

const seed = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const totalExistente = await Ejercicio.count();
    if (totalExistente > 0) {
      console.log(`Ya existen ${totalExistente} ejercicios en la base de datos.`);
      console.log('Limpiando tabla para re-insertar...');
      await Ejercicio.destroy({ where: {} });
    }

    const exercises = await descargarJSON();
    console.log(`Total de ejercicios en el dataset: ${exercises.length}`);

    const registros = exercises.map(mapearEjercicio);

    const BATCH_SIZE = 100;
    let insertados = 0;
    let errores = 0;

    for (let i = 0; i < registros.length; i += BATCH_SIZE) {
      const batch = registros.slice(i, i + BATCH_SIZE);
      try {
        const result = await Ejercicio.bulkCreate(batch, {
          validate: true,
          returning: false,
        });
        insertados += batch.length;
        process.stdout.write(`\rInsertados: ${insertados}/${registros.length}`);
      } catch (err) {
        errores += batch.length;
        console.error(`\nError en lote ${Math.floor(i / BATCH_SIZE) + 1}:`, err.message);
      }
    }

    console.log('\n');
    console.log('=== RESUMEN ===');
    console.log(`Total en dataset: ${exercises.length}`);
    console.log(`Insertados: ${insertados}`);
    console.log(`Errores: ${errores}`);

    const porGrupo = await Ejercicio.findAll({
      attributes: ['grupoMuscular', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['grupoMuscular'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true,
    });

    console.log('\nPor grupo muscular:');
    porGrupo.forEach(g => {
      if (g.grupoMuscular) console.log(`  ${g.grupoMuscular}: ${g.total}`);
    });

  } catch (err) {
    console.error('Error fatal:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

seed();
