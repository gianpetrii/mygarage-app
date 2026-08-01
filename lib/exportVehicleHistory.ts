import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BRAND } from '@/constants/brand';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from '@/constants/domain';
import { formatCurrency } from './currency';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { getTimelineSubtitle, maintenanceToTimeline } from './timeline';
import type { Vehicle, MaintenanceRecord, ServiceReminder } from '@/types';

export interface VehicleExportOptions {
  manualUrl?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatReminderSchedule(reminder: ServiceReminder): string {
  const parts: string[] = [];
  if (reminder.targetDate) {
    parts.push(`Vence ${format(reminder.targetDate, 'dd/MM/yyyy')}`);
  }
  if (reminder.targetMileage != null) {
    parts.push(`Obj. ${reminder.targetMileage.toLocaleString()} km`);
  }
  return parts.join(' · ') || '—';
}

export function buildVehicleExportHtml(
  vehicle: Vehicle,
  maintenance: MaintenanceRecord[],
  reminders: ServiceReminder[],
  options?: VehicleExportOptions,
): string {
  const currency = DEFAULT_CURRENCY;
  const vehicleMaintenance = maintenance
    .filter((m) => m.vehicleId === vehicle.id)
    .sort((a, b) => b.date - a.date);

  const timeline = vehicleMaintenance.map(maintenanceToTimeline);

  const historyRows = timeline
    .map((entry) => {
      const record = entry.source as MaintenanceRecord;
      const details = [
        getTimelineSubtitle(entry),
        record.serviceProvider ? `Taller: ${record.serviceProvider}` : null,
        record.notes ? `Notas: ${record.notes}` : null,
      ]
        .filter(Boolean)
        .join(' · ');

      return `
      <tr>
        <td>${format(entry.date, 'dd/MM/yyyy')}</td>
        <td>
          <strong>${escapeHtml(entry.title)}</strong>
          ${details ? `<br/><span class="sub">${escapeHtml(details)}</span>` : ''}
        </td>
        <td>${entry.amount != null && entry.amount > 0 ? formatCurrency(entry.amount, currency) : '—'}</td>
        <td>${entry.mileage != null ? `${entry.mileage.toLocaleString()} km` : '—'}</td>
      </tr>`;
    })
    .join('');

  const vehicleReminders = reminders.filter((r) => r.vehicleId === vehicle.id);
  const activeReminders = vehicleReminders.filter((r) => r.isActive && !r.isCompleted);
  const activeReminderRows = activeReminders
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.title)}</td>
        <td>${escapeHtml(formatReminderSchedule(r))}</td>
      </tr>`,
    )
    .join('');

  const manualUrl = options?.manualUrl ?? vehicle.manualUrl;
  const manualSection = manualUrl
    ? `<h2>Manual del vehículo</h2>
       <p><a href="${escapeHtml(manualUrl)}">${escapeHtml(manualUrl)}</a></p>`
    : '';

  const specs = [
    ['Marca / modelo', `${vehicle.make} ${vehicle.model}`],
    ['Año', String(vehicle.year)],
    ['Versión', vehicle.trim],
    ['Patente', vehicle.licensePlate],
    ['Kilometraje', `${vehicle.mileage.toLocaleString()} km`],
    ['Combustible', FUEL_TYPE_LABELS[vehicle.fuelType]],
    ['Transmisión', vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] : undefined],
    ['Motor', vehicle.engine],
    ['Color', vehicle.color],
    ['VIN', vehicle.vin],
    ['Notas', vehicle.notes],
  ]
    .filter(([, value]) => value != null && String(value).trim() !== '')
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(String(value))}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Historial — ${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; line-height: 1.45; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-top: 28px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
    th { background: #f4f4f5; width: 32%; }
    .meta { color: #666; font-size: 13px; }
    .sub { color: #666; font-size: 12px; }
    a { color: #111; word-break: break-all; }
  </style>
</head>
<body>
  <h1>${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}</h1>
  <p class="meta">
    Generado con ${BRAND.name} — ${format(Date.now(), "d 'de' MMMM yyyy", { locale: es })}
  </p>

  <h2>Datos del vehículo</h2>
  <table>
    <tbody>${specs}</tbody>
  </table>

  ${
    activeReminderRows
      ? `<h2>Recordatorios activos</h2>
  <table>
    <thead><tr><th>Aviso</th><th>Próximo vencimiento</th></tr></thead>
    <tbody>${activeReminderRows}</tbody>
  </table>`
      : ''
  }

  <h2>Historial de movimientos</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Detalle</th><th>Monto</th><th>Km</th></tr></thead>
    <tbody>${historyRows || '<tr><td colspan="4">Sin registros</td></tr>'}</tbody>
  </table>

  ${manualSection}

  <p class="meta" style="margin-top:32px">
    Documento para uso del comprador. Verificá comprobantes originales y el manual en el enlace si aplica.
  </p>
</body>
</html>`;
}

export class VehicleExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VehicleExportError';
  }
}

export async function shareVehicleExport(html: string, vehicleLabel: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });

  if (!(await Sharing.isAvailableAsync())) {
    throw new VehicleExportError(
      'Compartir no está disponible en este dispositivo. Probá desde un teléfono físico.',
    );
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Historial ${vehicleLabel}`,
    UTI: 'com.adobe.pdf',
  });
}
