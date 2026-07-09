const { PerfilMedico } = require('./perfil-medico.model');
const { Instruido } = require('./instruido.model');
const { cifrar, descifrar } = require('../../shared/utils/crypto');

const CAMPOS_SENSIBLES = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes'];

const cifrarCampos = (datos) => {
  const cifrados = { ...datos };
  for (const campo of CAMPOS_SENSIBLES) {
    if (cifrados[campo] !== undefined) {
      cifrados[campo] = cifrar(cifrados[campo]);
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

const obtenerPorInstruidoId = async (instruidoId, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id: instruidoId, entrenadorId } });
  if (!instruido) return null;
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  return perfil ? descifrarCampos(perfil) : null;
};

const crearOActualizar = async (instruidoId, datos, entrenadorId) => {
  const instruido = await Instruido.findOne({ where: { id: instruidoId, entrenadorId } });
  if (!instruido) return null;
  const datosCifrados = cifrarCampos(datos);
  const [perfil] = await PerfilMedico.upsert({ instruidoId, ...datosCifrados });
  return descifrarCampos(perfil);
};

module.exports = { obtenerPorInstruidoId, crearOActualizar };
