import api from './api';

const BASE = '/dietas';

export const dietasApi = {
  listar: () => api.get(BASE),
  obtenerPorId: (id) => api.get(`${BASE}/${id}`),
  crear: (data) => api.post(BASE, data),
  actualizar: (id, data) => api.put(`${BASE}/${id}`, data),
  eliminar: (id) => api.delete(`${BASE}/${id}`),
  generar: (instruidoId, data) => api.post(`${BASE}/generar/${instruidoId}`, data),
  decidir: (id, data) => api.post(`${BASE}/${id}/decision`, data),
};
