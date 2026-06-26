import { MAINTENANCE_TYPE_LABELS, EXPENSE_CATEGORY_LABELS } from '@/constants/domain';
import type {
  MaintenanceRecord,
  FuelEntry,
  Expense,
  TimelineEntry,
  TimelineEntryType,
} from '@/types';

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

export function fuelToTimeline(entry: FuelEntry): TimelineEntry {
  return {
    id: entry.id,
    type: 'fuel',
    vehicleId: entry.vehicleId,
    date: entry.date,
    title: entry.gasStation ? `Carga — ${entry.gasStation}` : 'Carga de combustible',
    amount: entry.totalCost,
    mileage: entry.mileage,
    source: entry,
  };
}

export function expenseToTimeline(expense: Expense): TimelineEntry {
  return {
    id: expense.id,
    type: 'expense',
    vehicleId: expense.vehicleId,
    date: expense.date,
    title: expense.title || EXPENSE_CATEGORY_LABELS[expense.category],
    amount: expense.amount,
    mileage: expense.mileage,
    source: expense,
  };
}

export function buildTimeline(
  maintenance: MaintenanceRecord[],
  fuel: FuelEntry[],
  expenses: Expense[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...maintenance.map(maintenanceToTimeline),
    ...fuel.map(fuelToTimeline),
    ...expenses.map(expenseToTimeline),
  ];
  return entries.sort((a, b) => b.date - a.date);
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
  if (entry.type === 'expense') {
    const exp = entry.source as Expense;
    return EXPENSE_CATEGORY_LABELS[exp.category];
  }
  return 'Nafta';
}
