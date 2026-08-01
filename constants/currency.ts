export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
  locale: string;
}

/** Monedas habituales en LATAM (ARS por defecto). */
export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'ARS', label: 'Peso argentino', symbol: '$', locale: 'es-AR' },
  { code: 'USD', label: 'Dólar estadounidense', symbol: 'US$', locale: 'en-US' },
  { code: 'BRL', label: 'Real brasileño', symbol: 'R$', locale: 'pt-BR' },
  { code: 'CLP', label: 'Peso chileno', symbol: '$', locale: 'es-CL' },
  { code: 'MXN', label: 'Peso mexicano', symbol: '$', locale: 'es-MX' },
  { code: 'UYU', label: 'Peso uruguayo', symbol: '$', locale: 'es-UY' },
];

export const DEFAULT_CURRENCY = 'ARS';

export function getCurrencyOption(code?: string): CurrencyOption {
  return CURRENCY_OPTIONS.find((c) => c.code === code) ?? CURRENCY_OPTIONS[0];
}
