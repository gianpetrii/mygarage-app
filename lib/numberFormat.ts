/** Solo dígitos (string vacío si no hay). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Formato LATAM: separador de miles con punto (ej. 50.000). */
export function formatGroupedInteger(raw: string | number): string {
  const digits = typeof raw === 'number' ? String(Math.floor(raw)) : digitsOnly(raw);
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseGroupedInteger(value: string): number {
  const digits = digitsOnly(value);
  if (!digits) return NaN;
  return parseInt(digits, 10);
}
