import { getCurrencyOption } from '@/constants/currency';

export function formatCurrency(amount: number, currencyCode?: string): string {
  const { code, locale, symbol } = getCurrencyOption(currencyCode);
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${symbol}${formatted}`;
}
