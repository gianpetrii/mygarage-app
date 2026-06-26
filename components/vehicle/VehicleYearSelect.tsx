import * as React from 'react';
import { SearchableSelect } from '@/components/vehicle/SearchableSelect';
import { VEHICLE_YEAR_OPTIONS } from '@/constants/vehicles';

interface VehicleYearSelectProps {
  label?: string;
  value: string;
  onChange: (year: string) => void;
  error?: string;
  className?: string;
}

function VehicleYearSelect({
  label = 'Año *',
  value,
  onChange,
  error,
  className,
}: VehicleYearSelectProps) {
  return (
    <SearchableSelect
      label={label}
      placeholder="Seleccioná el año"
      value={value || undefined}
      options={VEHICLE_YEAR_OPTIONS}
      onChange={onChange}
      error={error}
      searchPlaceholder="Buscar año..."
      numericSearch
      className={className}
    />
  );
}

export { VehicleYearSelect };
