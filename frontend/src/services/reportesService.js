import api from './api';

const BASE = '/reportes';

function buildParams(periodo) {
  return periodo ? { params: { periodo } } : {};
}

export const reportesService = {
  obtenerGruposMuscularesPropios(periodo) {
    return api.get(`${BASE}/grupos-musculares/yo`, buildParams(periodo));
  },

  obtenerGruposMuscularesPorInstruido(instruidoId, periodo) {
    return api.get(`${BASE}/grupos-musculares/${instruidoId}`, buildParams(periodo));
  },

  obtenerEvolucionPropia(grupoMuscular, periodo) {
    return api.get(`${BASE}/evolucion/yo/${encodeURIComponent(grupoMuscular)}`, buildParams(periodo));
  },

  obtenerEvolucionPorInstruido(instruidoId, grupoMuscular, periodo) {
    return api.get(
      `${BASE}/grupos-musculares/${instruidoId}/${encodeURIComponent(grupoMuscular)}/evolucion`,
      buildParams(periodo)
    );
  },

  obtenerComparativaPropia(periodo) {
    return api.get(`${BASE}/comparativa/yo`, buildParams(periodo));
  },

  obtenerComparativaPorInstruido(instruidoId, periodo) {
    return api.get(`${BASE}/comparativa/${instruidoId}`, buildParams(periodo));
  },

  listarInstruidos() {
    return api.get(`${BASE}/instruidos`);
  },
};

export default reportesService;
