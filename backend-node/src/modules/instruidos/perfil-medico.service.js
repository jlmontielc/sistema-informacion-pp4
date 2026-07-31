const { PerfilMedico } = require('./perfil-medico.model');
const { Instruido } = require('./instruido.model');
const { cifrar, descifrar } = require('../../shared/utils/crypto');

const CAMPOS_SENSIBLES = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes'];

const cifrarCampos = (datos) => {
  const cifrados = { ...datos };
  for (const campo of CAMPOS_SENSIBLES) {
    if (cifrados[campo] !== undefined) {
      if (cifrados[campo] === '') {
        cifrados[campo] = null;
      } else {
        cifrados[campo] = cifrar(cifrados[campo]);
      }
    }
  }
  return cifrados;
};

const descifrarCampos = (registro) => {
  if (!registro) return registro;
  const datos = registro.toJSON ? registro.toJSON() : { ...registro };
  for (const campo of CAMPOS_SENSIBLES) {
    if (datos[campo]) {
      datos[campo] = descifrar(datos[campo]);
    }
  }
  return datos;
};

const obtenerPorInstruidoId = async (instruidoId, usuario) => {
  const where = { id: instruidoId };
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido' && Number(instruidoId) !== Number(usuario.id)) return null;
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  return perfil ? descifrarCampos(perfil) : null;
};

const crearOActualizar = async (instruidoId, datos, usuario) => {
  const where = { id: instruidoId };
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido' && Number(instruidoId) !== Number(usuario.id)) return null;
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const datosCifrados = cifrarCampos(datos);
  const [perfil] = await PerfilMedico.upsert({ instruidoId, ...datosCifrados });
  return descifrarCampos(perfil);
};

module.exports = { obtenerPorInstruidoId, crearOActualizar };
