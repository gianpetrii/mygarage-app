import * as React from 'react';
import { Input, type InputProps } from '@/components/ui/input';
import { digitsOnly, formatGroupedInteger } from '@/lib/numberFormat';

interface MileageInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  /** Valor numérico en crudo (solo dígitos), ej. "50000". */
  value: string;
  onChangeValue: (rawDigits: string) => void;
}

function MileageInput({ value, onChangeValue, placeholder = '50.000', ...props }: MileageInputProps) {
  const display = formatGroupedInteger(value);

  const handleChange = (text: string) => {
    onChangeValue(digitsOnly(text));
  };

  return (
    <Input
      {...props}
      value={display}
      onChangeText={handleChange}
      keyboardType="number-pad"
      placeholder={placeholder}
    />
  );
}

export { MileageInput };
