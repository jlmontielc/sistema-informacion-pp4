const { PerfilMedico } = require('./perfil-medico.model');
const { Instruido } = require('./instruido.model');
const { cifrar, descifrar } = require('../../shared/utils/crypto');

const CAMPOS_SENSIBLES = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes', 'medicacionActual'];

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

const descifrarSeguro = (valor) => {
  try {
    return descifrar(valor);
  } catch {
    return valor;
  }
};

const descifrarCampos = (registro) => {
  if (!registro) return registro;
  const datos = registro.toJSON ? registro.toJSON() : { ...registro };
  for (const campo of CAMPOS_SENSIBLES) {
    if (datos[campo]) {
      datos[campo] = descifrarSeguro(datos[campo]);
    }
  }
  return datos;
};

const obtenerPerfilSeguroParaFrontend = async (instruidoId, usuario) => {
  const where = { id: instruidoId };
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido' && Number(instruidoId) !== Number(usuario.id)) return null;
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  if (!perfil) {
    return { instruidoId: Number(instruidoId), observaciones: null, perfilMedicoCompleto: false };
  }
  return {
    instruidoId: Number(instruidoId),
    observaciones: perfil.observaciones || null,
    perfilMedicoCompleto: true,
  };
};

const obtenerPerfilDescifradoParaFlask = async (instruidoId) => {
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
  await PerfilMedico.upsert({ instruidoId, ...datosCifrados });
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  return {
    instruidoId: Number(instruidoId),
    observaciones: perfil ? perfil.observaciones || null : null,
    perfilMedicoCompleto: !!perfil,
  };
};

module.exports = {
  obtenerPerfilSeguroParaFrontend,
  obtenerPerfilDescifradoParaFlask,
  crearOActualizar,
};
