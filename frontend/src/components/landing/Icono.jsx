const PATHS = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <line x1="12" y1="1.5" x2="12" y2="3.5" />
      <line x1="12" y1="20.5" x2="12" y2="22.5" />
      <line x1="4.6" y1="4.6" x2="6" y2="6" />
      <line x1="18" y1="18" x2="19.4" y2="19.4" />
      <line x1="1.5" y1="12" x2="3.5" y2="12" />
      <line x1="20.5" y1="12" x2="22.5" y2="12" />
      <line x1="4.6" y1="19.4" x2="6" y2="18" />
      <line x1="18" y1="6" x2="19.4" y2="4.6" />
    </>
  ),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  dumbbell: (
    <>
      <path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M3.5 12h17M6.5 8.5h-3M20.5 8.5h-3M6.5 15.5h-3M20.5 15.5h-3" />
    </>
  ),
  heart: (
    <path d="M20.4 5.6a5 5 0 0 0-7.1 0L12 6.9l-1.3-1.3a5 5 0 1 0-7.1 7.1l1.3 1.3L12 21l7.1-7 1.3-1.3a5 5 0 0 0 0-7.1z" />
  ),
  cardio: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  flexibility: (
    <>
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M6.8 17.2 17.2 6.8" />
      <path d="M9 8.5 15.5 15" />
    </>
  ),
  nutrition: (
    <>
      <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M8 10h8M8 14h8" />
      <path d="M12 10v8" />
    </>
  ),
  recovery: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  chart: (
    <>
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="7" y1="20" x2="7" y2="13" />
      <line x1="12" y1="20" x2="12" y2="5" />
      <line x1="17" y1="20" x2="17" y2="10" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  'arrow-right': (
    <>
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </>
  ),
  'chevron-down': <polyline points="6 9 12 15 18 9" />,
  'chevron-left': <polyline points="15 18 9 12 15 6" />,
  'chevron-right': <polyline points="9 18 15 12 9 6" />,
  twitter: (
    <path d="M22 4.5a8.4 8.4 0 0 1-2.4 1.2 4.2 4.2 0 0 0 1.9-2.3 8.3 8.3 0 0 1-2.6 1A4.1 4.1 0 0 0 11.8 7a11.7 11.7 0 0 1-8.5-4.3 4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5 4.1 4.1 0 0 0 3.3 4.1 4.2 4.2 0 0 1-1.9.1 4.1 4.1 0 0 0 3.8 2.9A8.3 8.3 0 0 1 2 17.2a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.3 11.7-11.7v-.5A8.4 8.4 0 0 0 22 4.5z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" />
    </>
  ),
  facebook: (
    <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3H8v8h3v-8h2.5l.5-3H11V7.5A1.5 1.5 0 0 1 12.5 6H15z" />
  ),
  play: <polygon points="6 3 20 12 6 21" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="6" />
      <line x1="16" y1="3" x2="16" y2="6" />
    </>
  ),
  star: (
    <polygon points="12 3 14.9 9 21.5 9.9 16.7 14.4 17.9 21 12 17.8 6.1 21 7.3 14.4 2.5 9.9 9.1 9" />
  ),
  pin: (
    <>
      <path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10.5" r="2.8" />
    </>
  ),
  phone: (
    <path d="M21 16.5v3a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19.2 19.2 0 0 1-6-6 19.5 19.5 0 0 1-3-8.6A2 2 0 0 1 3.3 1.7h3a2 2 0 0 1 2 1.7 12.6 12.6 0 0 0 .7 2.8 2 2 0 0 1-.4 2.1L7.5 9.4a15.7 15.7 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.4 12.6 12.6 0 0 0 2.8.7 2 2 0 0 1 1.5 1.9z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
      <polyline points="3 6 12 13 21 6" />
    </>
  ),
  shield: (
    <path d="M12 22s8-4 8-10V5.5L12 2 4 5.5V12c0 6 8 10 8 10z" />
  ),
};

export function Icono({ name, size = 24, className = '', ...props }) {
  const contenido = PATHS[name];

  if (!contenido) return null;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {contenido}
    </svg>
  );
}
