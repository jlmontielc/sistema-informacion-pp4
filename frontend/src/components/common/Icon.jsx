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
