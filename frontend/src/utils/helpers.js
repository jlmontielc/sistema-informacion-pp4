export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function cn(classes) {
  if (typeof classes === 'string') return classes;
  if (Array.isArray(classes)) return classes.filter(Boolean).join(' ');
  if (typeof classes === 'object') {
    return Object.entries(classes)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
      .join(' ');
  }
  return '';
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(str, length = 100) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + '...';
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
