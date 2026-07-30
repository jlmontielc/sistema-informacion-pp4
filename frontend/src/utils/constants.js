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
  PERFIL: '/perfil',
};

const BASE_SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Clientes', path: ROUTES.CLIENTES, icon: 'clientes' },
  { label: 'Metabolismo', path: ROUTES.METABOLISMO, icon: 'metabolismo' },
  { label: 'Entrenamiento', path: ROUTES.ENTRENAMIENTO, icon: 'entrenamiento' },
  { label: 'Dietas', path: ROUTES.DIETAS, icon: 'dietas' },
  { label: 'Reportes', path: ROUTES.REPORTES, icon: 'reportes' },
  { label: 'Mi Perfil', path: ROUTES.PERFIL, icon: 'perfil' },
];

export function getSidebarItems(user) {
  if (user?.tipo === 'instruido') {
    return BASE_SIDEBAR_ITEMS
      .filter((item) => item.label !== 'Metabolismo')
      .map((item) =>
        item.label === 'Clientes'
          ? { ...item, label: 'Entrenador', path: ROUTES.ENTRENADOR, icon: 'entrenador' }
          : item
      );
  }
  return BASE_SIDEBAR_ITEMS;
}

export const APP_NAME = 'Entrenador Personal';
export const APP_SHORT_NAME = 'Entrenador';
