const icons = {
  dumbbell: {
    path: 'M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M3 8L6 5M18 19L21 16M8 3L5 6M19 18L16 21',
    fill: 'none',
  },
  apple: {
    path: 'M12 8C10.5 6 7 6 7 10C7 12 9 13 12 16C15 13 17 12 17 10C17 6 13.5 6 12 8Z',
    fill: 'none',
  },
  users: {
    path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    fill: 'none',
  },
  chart: { path: 'M18 20V10M12 20V4M6 20v-6', fill: 'none' },
  heart: {
    path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    fill: 'none',
  },
  target: {
    path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    fill: 'none',
  },
  food: {
    path: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
    fill: 'none',
  },
  camera: {
    path: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    fill: 'none',
  },
  next: { path: 'M9 18l6-6-6-6', fill: 'none' },
  prev: { path: 'M15 18l-6-6 6-6', fill: 'none' },
  arrow: { path: 'M5 12h14M12 5l7 7-7 7', fill: 'none' },
  check: { path: 'M20 6L9 17l-5-5', fill: 'none' },
  menu: { path: 'M3 12h18M3 6h18M3 18h18', fill: 'none' },
  close: { path: 'M18 6L6 18M6 6l12 12', fill: 'none' },
  /* ===== Iconos agregados (Fase 1+2, convención en inglés del archivo) ===== */
  /* Dashboard: cuadrícula tipo tablero */
  dashboard: {
    path: 'M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 15h8v6H3z',
    fill: 'none',
  },
  /* Reportes: línea de tendencia con eje */
  chartline: {
    path: 'M3 3v18h18M7 14l4-4 3 3 6-6M17 7h3v3',
    fill: 'none',
  },
  /* Planes de pago: tarjeta de crédito */
  creditcard: {
    path: 'M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM1 10h22M5 15h4',
    fill: 'none',
  },
  /* Mi plan: recibo con borde dentado */
  receipt: {
    path: 'M4 2h16v20l-2-1.5-2 1.5-2-1.5L12 22l-2-1.5L8 22l-2-1.5L4 22zM8 7h8M8 11h8M8 15h5',
    fill: 'none',
  },
  /* Perfil: usuario individual */
  user: {
    path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    fill: 'none',
  },
  /* Cerrar sesión: puerta con flecha de salida */
  logout: {
    path: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    fill: 'none',
  },
  /* Tema claro: sol */
  sun: {
    path: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
    fill: 'none',
  },
  /* Tema oscuro: luna creciente */
  moon: {
    path: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    fill: 'none',
  },
  /* Metabolismo: rayo */
  bolt: {
    path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    fill: 'none',
  },
  /* Entrenador: pizerra/presentación con pie */
  teacher: {
    path: 'M2 3h20v11H2zM12 14v2M8 22l4-4 4 4',
    fill: 'none',
  },
  /* Página no encontrada: lupa (Fase 3, Lote C) */
  search: {
    path: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
    fill: 'none',
  },
  /* Sin conexión: wifi tachado (Fase 3, Lote C) */
  'wifi-off': {
    path: 'M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
    fill: 'none',
  },
  /* Reloj: descanso y duraciones (reemplaza el emoji de cronómetro) */
  clock: {
    path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    fill: 'none',
  },
  /* ===== Iconos del Dashboard del Atleta (Material 3 oscuro) ===== */
  /* Báscula: pesa con asa superior */
  scale: {
    path: 'M9 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0M12 6L4 21h16L12 6',
    fill: 'none',
  },
  /* Regla inclinada con marcas */
  ruler: {
    path: 'M22 7L7 22l-5-5L17 2l5 5zM9 13.5l1.5 1.5M12 10.5l1.5 1.5M15 7.5l1.5 1.5',
    fill: 'none',
  },
  /* Llama */
  flame: {
    path: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
    fill: 'none',
  },
  /* Monitoreo: pantalla con línea de progreso y base */
  monitoring: {
    path: 'M2 4h20v12H2zM6 11l3-3 3 3 4-5M8 20h8',
    fill: 'none',
  },
  /* Historial: reloj con flecha circular */
  history: {
    path: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2',
    fill: 'none',
  },
  /* Calendario */
  calendar: {
    path: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    fill: 'none',
  },
  /* Más (añadir) */
  plus: {
    path: 'M12 5v14M5 12h14',
    fill: 'none',
  },
  /* Tendencia a la baja */
  'trending-down': {
    path: 'M22 17l-8.5-8.5-5 5L2 7M16 17h6v-6',
    fill: 'none',
  },
  /* Engranaje de ajustes */
  settings: {
    path: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    fill: 'none',
  },
  /* Evento: calendario con punto */
  event: {
    path: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    fill: 'none',
  },
  /* Restaurante: cubiertos */
  restaurant: {
    path: 'M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zM21 15v7',
    fill: 'none',
  },
  /* Reproducir: triángulo */
  play: {
    path: 'M6 3l14 9-14 9V3z',
    fill: 'none',
  },
  /* Grupo de tres personas (usado en KPI de clientes del entrenador) */
  groups: {
    path: 'M12 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM6.5 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM17.5 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM1 20a5.5 5.5 0 0 1 11 0M6.5 14.5c-1.9 0-4 1-4.5 3M23 20a5.5 5.5 0 0 0-11 0M17.5 14.5c1.9 0 4 1 4.5 3',
    fill: 'none',
  },
  /* Tendencia ascendente con eje (usado en KPI de nuevos clientes) */
  'trending-up': {
    path: 'M22 7l-8.5 8.5-5-5L2 17M16 7h6v6',
    fill: 'none',
  },
  /* Candado con arco (guard de acceso del módulo de metabolismo) */
  lock: {
    path: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4',
    fill: 'none',
  },
  /* Ojo: ver y revisar recomendaciones IA */
  eye: {
    path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    fill: 'none',
  },
};

export function Icon({ name, size = 24, color = 'currentColor', className = '' }) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={icon.fill}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}
