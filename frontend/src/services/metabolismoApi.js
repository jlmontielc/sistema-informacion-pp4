import api from './api';

const BASE = '/metabolismo';

export const metabolismoApi = {
  /**
   * Calcular TMB y GCT de un usuario.
   * Para admin/entrenador: clienteId es requerido en data.
   * Para instruido: clienteId se infiere del token JWT.
   */
  calcular: (data) => api.post(`${BASE}/calcular`, data),
};
