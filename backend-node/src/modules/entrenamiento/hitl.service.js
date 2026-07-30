const http = require('http');
const url = require('url');
const config = require('../../shared/constants');
const { Instruido } = require('../instruidos/instruido.model');
const { PerfilMedico } = require('../instruidos/perfil-medico.model');
const { RegistroEntrenamiento, RutinaAsignada } = require('./entrenamiento.model');
const { descifrar } = require('../../shared/utils/crypto');

const FLASK_URL = config.FLASK_IA_URL || 'http://localhost:5000';

const CAMPOS_SENSIBLES = ['alergias', 'intolerancias', 'lesiones', 'condicionesPreexistentes'];

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

const parsearCampoJson = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    return [String(parsed)];
  } catch {
    if (typeof raw === 'string') {
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }
};

const httpRequest = (path, method, body, timeout) => new Promise((resolve, reject) => {
  const parsedUrl = url.parse(FLASK_URL);
  const data = body ? JSON.stringify(body) : '';
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    path,
    method,
    timeout: timeout || 10000,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => { responseData += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        resolve({ status: res.statusCode, data: parsed });
      } catch {
        resolve({ status: res.statusCode, data: responseData });
      }
    });
  });

  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      const error = new Error('Servicio de IA no disponible');
      error.status = 503;
      return reject(error);
    }
    reject(err);
  });

  req.on('timeout', () => {
    req.destroy();
    const error = new Error('Timeout al conectar con servicio de IA');
    error.status = 504;
    reject(error);
  });

  if (data) req.write(data);
  req.end();
});

const sugerirRutina = async (clienteId, entrenadorId, preferencias = {}) => {
  const instruido = await Instruido.findOne({
    where: { id: clienteId, entrenadorId },
  });
  if (!instruido) {
    const err = new Error('Instruido no encontrado o no pertenece al entrenador');
    err.status = 404;
    throw err;
  }

  const perfilMedicoRaw = await PerfilMedico.findOne({
    where: { instruidoId: clienteId },
  });
  const perfilDescifrado = perfilMedicoRaw ? descifrarCampos(perfilMedicoRaw) : null;

  const historial = await RegistroEntrenamiento.findAll({
    where: { instruidoId: clienteId },
    order: [['fecha', 'DESC']],
    limit: 20,
  });

  const historialFormateado = historial.map(reg => ({
    fecha: reg.fecha,
    ejercicios_realizados: reg.ejerciciosRealizados,
    percepcion_esfuerzo: reg.percepcionEsfuerzo,
    duracion_minutos: reg.duracionMinutos,
  }));

  const payload = {
    cliente_id: clienteId,
    edad: instruido.edad,
    peso: Number(instruido.peso),
    altura: Number(instruido.altura),
    sexo: instruido.sexo,
    nivel_actividad: instruido.nivelActividad,
    nivel_experiencia: instruido.nivelExperiencia || null,
    proposito: instruido.propositoEntrenamiento || 'mantenimiento',
    dias_disponibles: instruido.diasDisponibles || 3,
    perfil_medico: {
      lesiones: perfilDescifrado ? parsearCampoJson(perfilDescifrado.lesiones) : [],
      condiciones_preexistentes: perfilDescifrado ? parsearCampoJson(perfilDescifrado.condicionesPreexistentes) : [],
      alergias: perfilDescifrado ? parsearCampoJson(perfilDescifrado.alergias) : [],
      medicacion: perfilDescifrado ? parsearCampoJson(perfilDescifrado.medicacionActual) : [],
    },
    historial_reciente: {
      ultimas_4_semanas: historialFormateado,
    },
    preferencias: {
      ejercicios_excluir: preferencias.excluir || [],
      equipamiento_disponible: preferencias.equipamiento || [],
    },
  };

  const response = await httpRequest('/api/predict/routine', 'POST', payload, 10000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  return response.data;
};

const validarEjercicio = async (ejercicioId, clienteId, cargaKg = null) => {
  const payload = {
    ejercicio_id: ejercicioId,
    cliente_id: clienteId,
  };
  if (cargaKg !== null) {
    payload.carga_kg = cargaKg;
  }

  const response = await httpRequest('/api/predict/validate', 'POST', payload, 5000);

  if (response.status >= 400) {
    const err = new Error(`Flask API error: ${response.status}`);
    err.status = response.status;
    err.data = response.data;
    throw err;
  }

  return response.data;
};

module.exports = { sugerirRutina, validarEjercicio };
