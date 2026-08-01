import { MAINTENANCE_TYPE_LABELS } from '@/constants/domain';
import type { MaintenanceRecord, TimelineEntry, TimelineEntryType } from '@/types';

export function maintenanceToTimeline(record: MaintenanceRecord): TimelineEntry {
  return {
    id: record.id,
    type: 'maintenance',
    vehicleId: record.vehicleId,
    date: record.date,
    title: record.title,
    amount: record.cost,
    mileage: record.mileage,
    source: record,
  };
}

export function buildTimeline(maintenance: MaintenanceRecord[]): TimelineEntry[] {
  return maintenance.map(maintenanceToTimeline).sort((a, b) => b.date - a.date);
}

export function filterTimeline(
  entries: TimelineEntry[],
  options?: {
    vehicleId?: string | null;
    type?: TimelineEntryType | 'all';
    fromDate?: number;
    toDate?: number;
  },
): TimelineEntry[] {
  let result = entries;
  if (options?.vehicleId) {
    result = result.filter((e) => e.vehicleId === options.vehicleId);
  }
  if (options?.type && options.type !== 'all') {
    result = result.filter((e) => e.type === options.type);
  }
  if (options?.fromDate) {
    result = result.filter((e) => e.date >= options.fromDate!);
  }
  if (options?.toDate) {
    result = result.filter((e) => e.date <= options.toDate!);
  }
  return result;
}

export const TIMELINE_TYPE_LABELS: Record<TimelineEntryType, string> = {
  maintenance: 'Service',
  fuel: 'Combustible',
  expense: 'Gasto',
};

export function getTimelineSubtitle(entry: TimelineEntry): string {
  if (entry.type === 'maintenance') {
    const record = entry.source as MaintenanceRecord;
    return MAINTENANCE_TYPE_LABELS[record.type] ?? 'Mantenimiento';
  }
  return 'Registro';
}
