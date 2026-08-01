import type { MaintenanceType } from '@/types';

export type MovementKind = 'service' | 'repair' | 'other';

export const MOVEMENT_KIND_OPTIONS: {
  id: MovementKind;
  label: string;
  type: MaintenanceType;
  defaultTitle: string;
}[] = [
  { id: 'service', label: 'Service', type: 'oil_change', defaultTitle: 'Service' },
  { id: 'repair', label: 'Arreglo', type: 'repair', defaultTitle: 'Arreglo' },
  { id: 'other', label: 'Otro', type: 'other', defaultTitle: '' },
];

export function getMovementKindOption(kind: MovementKind) {
  return MOVEMENT_KIND_OPTIONS.find((o) => o.id === kind) ?? MOVEMENT_KIND_OPTIONS[0];
}
