import * as React from 'react';
import { formatCurrency } from '@/lib/currency';
import { DEFAULT_CURRENCY } from '@/constants/currency';

/** Formato de montos en ARS (mercado principal de la app). */
export function useCurrency() {
  const formatMoney = React.useCallback(
    (amount: number) => formatCurrency(amount, DEFAULT_CURRENCY),
    [],
  );

  return { currency: DEFAULT_CURRENCY, formatMoney };
}
