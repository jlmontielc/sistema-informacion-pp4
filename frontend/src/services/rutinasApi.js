import api from './api';

const BASE = '/entrenamiento';

export const ejerciciosApi = {
  listar: (params) => api.get(`${BASE}/ejercicios`, { params }),
  obtenerPorId: (id) => api.get(`${BASE}/ejercicios/${id}`),
  crear: (data) => api.post(`${BASE}/ejercicios`, data),
  actualizar: (id, data) => api.put(`${BASE}/ejercicios/${id}`, data),
  eliminar: (id) => api.delete(`${BASE}/ejercicios/${id}`),
};

export const plantillasApi = {
  listar: (params) => api.get(`${BASE}/plantillas`, { params }),
  obtenerPorId: (id) => api.get(`${BASE}/plantillas/${id}`),
  crear: (data) => api.post(`${BASE}/plantillas`, data),
  actualizar: (id, data) => api.put(`${BASE}/plantillas/${id}`, data),
  eliminar: (id) => api.delete(`${BASE}/plantillas/${id}`),
  obtenerPorDia: (id, dia) => api.get(`${BASE}/plantillas/${id}/dia/${dia}`),
  agregarEjercicioADia: (id, dia, data) =>
    api.post(`${BASE}/plantillas/${id}/dia/${dia}/ejercicios`, data),
  editarEjercicioEnDia: (id, dia, idx, data) =>
    api.put(`${BASE}/plantillas/${id}/dia/${dia}/ejercicios/${idx}`, data),
  eliminarEjercicioDeDia: (id, dia, idx) =>
    api.delete(`${BASE}/plantillas/${id}/dia/${dia}/ejercicios/${idx}`),
  reordenarDia: (id, dia, data) =>
    api.put(`${BASE}/plantillas/${id}/dia/${dia}/reordenar`, data),
};

export const rutinasAsignadasApi = {
  listar: (params) => api.get(`${BASE}/asignadas`, { params }),
  obtenerPorId: (id) => api.get(`${BASE}/asignadas/${id}`),
  crear: (data) => api.post(`${BASE}/asignadas`, data),
  actualizar: (id, data) => api.put(`${BASE}/asignadas/${id}`, data),
  eliminar: (id) => api.delete(`${BASE}/asignadas/${id}`),
  clonarDesdePlantilla: (plantillaId, data) =>
    api.post(`${BASE}/asignadas/clonar/${plantillaId}`, data),
  obtenerPorDia: (id, dia) => api.get(`${BASE}/asignadas/${id}/dia/${dia}`),
  obtenerResumen: (id) => api.get(`${BASE}/asignadas/${id}/resumen`),
  agregarEjercicioADia: (id, dia, data) =>
    api.post(`${BASE}/asignadas/${id}/dia/${dia}/ejercicios`, data),
  editarEjercicioEnDia: (id, dia, idx, data) =>
    api.put(`${BASE}/asignadas/${id}/dia/${dia}/ejercicios/${idx}`, data),
  eliminarEjercicioDeDia: (id, dia, idx) =>
    api.delete(`${BASE}/asignadas/${id}/dia/${dia}/ejercicios/${idx}`),
  reordenarDia: (id, dia, data) =>
    api.put(`${BASE}/asignadas/${id}/dia/${dia}/reordenar`, data),
};

export const registroEntrenamientoApi = {
  listar: (params) => api.get(`${BASE}/registro`, { params }),
  obtenerPorId: (id) => api.get(`${BASE}/registro/${id}`),
  crear: (data) => api.post(`${BASE}/registro`, data),
  eliminar: (id) => api.delete(`${BASE}/registro/${id}`),
};

export const instruidosApi = {
  listar: () => api.get('/instruidos'),
};
