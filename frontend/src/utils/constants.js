export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  CLIENTES: '/clientes',
  ENTRENADOR: '/entrenador',
  METABOLISMO: '/metabolismo',
  ENTRENAMIENTO: '/entrenamiento',
  DIETAS: '/dietas',
  REPORTES: '/reportes',
  PLANES: '/planes',
  MI_PLAN: '/mi-plan',
  PERFIL: '/perfil',
};

const BASE_SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Clientes', path: ROUTES.CLIENTES, icon: 'clientes' },
  { label: 'Metabolismo', path: ROUTES.METABOLISMO, icon: 'metabolismo' },
  { label: 'Entrenamiento', path: ROUTES.ENTRENAMIENTO, icon: 'entrenamiento' },
  { label: 'Dietas', path: ROUTES.DIETAS, icon: 'dietas' },
  { label: 'Reportes', path: ROUTES.REPORTES, icon: 'reportes' },
  { label: 'Planes', path: ROUTES.PLANES, icon: 'planes' },
  { label: 'Mi Perfil', path: ROUTES.PERFIL, icon: 'perfil' },
];

export function getSidebarItems(user) {
  if (user?.tipo === 'instruido') {
    return BASE_SIDEBAR_ITEMS
      .filter((item) => item.label !== 'Metabolismo')
      .map((item) => {
        if (item.label === 'Clientes') {
          return { ...item, label: 'Entrenador', path: ROUTES.ENTRENADOR, icon: 'entrenador' };
        }
        if (item.label === 'Planes') {
          return { ...item, label: 'Mi Plan', path: ROUTES.MI_PLAN, icon: 'miplan' };
        }
        return item;
      });
  }
  return BASE_SIDEBAR_ITEMS;
}

export const APP_NAME = 'Entrenador Personal';
export const APP_SHORT_NAME = 'Entrenador';

export const OBJETIVOS_ENTRENAMIENTO = [
  { value: 'perdida_peso', label: 'Perder peso' },
  { value: 'ganancia_muscular', label: 'Ganar masa muscular' },
  { value: 'mantenimiento', label: 'Mantenimiento / Salud y bienestar' },
  { value: 'rendimiento', label: 'Rendimiento deportivo' },
  { value: 'rehabilitacion', label: 'Rehabilitación' },
];

export const NIVELES_EXPERIENCIA = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

export function labelObjetivo(value) {
  const obj = OBJETIVOS_ENTRENAMIENTO.find((o) => o.value === value);
  return obj ? obj.label : value;
}

export function labelNivelExperiencia(value) {
  const nivel = NIVELES_EXPERIENCIA.find((n) => n.value === value);
  return nivel ? nivel.label : value;
}
