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

const pareceHashHexadecimal = (valor) => {
  if (!valor || typeof valor !== 'string') return false;
  return /^[a-f0-9]{32,}$/i.test(valor);
};

const descifrarSeguro = (valor) => {
  if (!valor) return valor;
  try {
    return descifrar(valor);
  } catch {
    return valor;
  }
};

const descifrarCampos = (registro) => {
  if (!registro) return registro;
  const datos = registro.toJSON ? registro.toJSON() : { ...registro };
  let datosMedicosCorruptos = false;
  for (const campo of CAMPOS_SENSIBLES) {
    if (datos[campo]) {
      const descifrado = descifrarSeguro(datos[campo]);
      if (descifrado === datos[campo] && pareceHashHexadecimal(datos[campo])) {
        datos[campo] = null;
        datosMedicosCorruptos = true;
      } else {
        datos[campo] = descifrado;
      }
    }
  }
  datos.datosMedicosCorruptos = datosMedicosCorruptos;
  return datos;
};

const tieneContenidoReal = (valor) => {
  if (!valor) return false;
  if (typeof valor !== 'string') return false;
  const limpio = valor.trim();
  if (!limpio) return false;
  // Rechazar listas u objetos vacíos escritos literalmente
  if (['[]', '{}', '[""]', "['']"].includes(limpio)) return false;
  // Si parece un array JSON, verificar que tenga al menos un elemento con contenido
  if (limpio.startsWith('[')) {
    try {
      const parsed = JSON.parse(limpio);
      if (Array.isArray(parsed)) {
        return parsed.some((item) => item && String(item).trim());
      }
    } catch {
      // No es JSON válido: se trata como texto libre con contenido real
    }
  }
  return true;
};

const calcularPerfilMedicoCompleto = (perfil) => {
  if (!perfil) return false;
  return !!(
    tieneContenidoReal(perfil.alergias) ||
    tieneContenidoReal(perfil.intolerancias) ||
    tieneContenidoReal(perfil.lesiones) ||
    tieneContenidoReal(perfil.condicionesPreexistentes) ||
    tieneContenidoReal(perfil.medicacionActual)
  );
};

const perfilMedicoVacio = (instruidoId) => ({
  instruidoId: Number(instruidoId),
  alergias: null,
  intolerancias: null,
  lesiones: null,
  condicionesPreexistentes: null,
  medicacionActual: null,
  observaciones: null,
  perfilMedicoCompleto: false,
  datosMedicosCorruptos: false,
});

const obtenerPerfilSeguroParaFrontend = async (instruidoId, usuario) => {
  const where = { id: instruidoId };
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido' && Number(instruidoId) !== Number(usuario.id)) return null;
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  return {
    instruidoId: Number(instruidoId),
    observaciones: perfil ? perfil.observaciones || null : null,
    perfilMedicoCompleto: calcularPerfilMedicoCompleto(perfil),
  };
};

const obtenerPerfilDescifradoParaFlask = async (instruidoId) => {
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  return perfil ? descifrarCampos(perfil) : null;
};

const construirPerfilDescifradoRespuesta = (instruidoId, datos) => ({
  instruidoId: Number(instruidoId),
  alergias: datos.alergias || null,
  intolerancias: datos.intolerancias || null,
  lesiones: datos.lesiones || null,
  condicionesPreexistentes: datos.condicionesPreexistentes || null,
  medicacionActual: datos.medicacionActual || null,
  observaciones: datos.observaciones || null,
  perfilMedicoCompleto: calcularPerfilMedicoCompleto(datos),
  datosMedicosCorruptos: datos.datosMedicosCorruptos || false,
});

const obtenerPerfilDescifradoPropio = async (instruidoId) => {
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  if (!perfil) return perfilMedicoVacio(instruidoId);
  const datos = descifrarCampos(perfil);
  return construirPerfilDescifradoRespuesta(instruidoId, datos);
};

const obtenerPerfilDescifradoPorInstruidoId = async (instruidoId, usuario) => {
  const where = { id: instruidoId };
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol !== 'administrador' && usuario.rol !== 'entrenador') return null;
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const perfil = await PerfilMedico.findOne({ where: { instruidoId } });
  if (!perfil) return perfilMedicoVacio(instruidoId);
  const datos = descifrarCampos(perfil);
  return construirPerfilDescifradoRespuesta(instruidoId, datos);
};

const crearOActualizar = async (instruidoId, datos, usuario) => {
  const where = { id: instruidoId };
  if (usuario.rol === 'entrenador') where.entrenadorId = usuario.id;
  if (usuario.rol === 'instruido' && Number(instruidoId) !== Number(usuario.id)) return null;
  const instruido = await Instruido.findOne({ where });
  if (!instruido) return null;
  const datosCifrados = cifrarCampos(datos);
  await PerfilMedico.upsert({ instruidoId, ...datosCifrados });
  if (usuario.rol === 'instruido') {
    return obtenerPerfilDescifradoPropio(instruidoId);
  }
  return obtenerPerfilDescifradoPorInstruidoId(instruidoId, usuario);
};

module.exports = {
  obtenerPerfilSeguroParaFrontend,
  obtenerPerfilDescifradoParaFlask,
  obtenerPerfilDescifradoPropio,
  obtenerPerfilDescifradoPorInstruidoId,
  crearOActualizar,
  calcularPerfilMedicoCompleto,
};
