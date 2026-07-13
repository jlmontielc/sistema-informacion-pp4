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
