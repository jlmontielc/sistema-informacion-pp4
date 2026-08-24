export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('es-ES', defaultOptions).format(new Date(date));
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatNumber(number, decimals = 0) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

export function formatPercentage(value, decimals = 1) {
  return new Intl.NumberFormat('es-ES', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

export function formatCurrency(amount, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatUsd(monto) {
  return `$${Number(monto || 0).toFixed(2)}`;
}

export function formatBs(montoUsd, tasaCambio) {
  const bs = Number(montoUsd || 0) * Number(tasaCambio || 0);
  return `Bs ${formatNumber(bs, 2)}`;
}

export function fechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}
