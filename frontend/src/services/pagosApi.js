import api from './api';

const BASE = '/pagos';

export const planesPagoApi = {
  listar: () => api.get(`${BASE}/planes`),
  crear: (data) => api.post(`${BASE}/planes`, data),
  actualizar: (planId, data) => api.put(`${BASE}/planes/${planId}`, data),
  eliminar: (planId) => api.delete(`${BASE}/planes/${planId}`),
};

export const metodosPagoApi = {
  listar: () => api.get(`${BASE}/metodos`),
  crear: (data) => api.post(`${BASE}/metodos`, data),
  actualizar: (metodoId, data) => api.put(`${BASE}/metodos/${metodoId}`, data),
  eliminar: (metodoId) => api.delete(`${BASE}/metodos/${metodoId}`),
};

export const configuracionPagosApi = {
  obtener: () => api.get(`${BASE}/configuracion`),
  actualizarTasa: (tasaCambio) => api.put(`${BASE}/configuracion`, { tasaCambio }),
};

export const pagosApi = {
  catalogo: (entrenadorId) => api.get(`${BASE}/catalogo/${entrenadorId}`),
  registrar: (data) => api.post(BASE, data),
  misPagos: () => api.get(`${BASE}/mis-pagos`),
  miSuscripcion: () => api.get(`${BASE}/mi-suscripcion`),
  historial: (params) => api.get(`${BASE}/historial`, { params }),
  verificar: (pagoId) => api.post(`${BASE}/${pagoId}/verificar`),
  rechazar: (pagoId, comentario) =>
    api.post(`${BASE}/${pagoId}/rechazar`, comentario ? { comentario } : {}),
  obtenerComprobante: (pagoId) =>
    api.get(`${BASE}/${pagoId}/comprobante`, { responseType: 'blob' }),
};
