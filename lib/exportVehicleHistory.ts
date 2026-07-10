import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BRAND } from '@/constants/brand';
import { buildTimeline } from './timeline';
import type { Vehicle, MaintenanceRecord, FuelEntry, Expense, ServiceReminder } from '@/types';

export function buildVehicleExportHtml(
  vehicle: Vehicle,
  maintenance: MaintenanceRecord[],
  fuel: FuelEntry[],
  expenses: Expense[],
  reminders: ServiceReminder[],
): string {
  const timeline = buildTimeline(
    maintenance.filter((m) => m.vehicleId === vehicle.id),
    fuel.filter((f) => f.vehicleId === vehicle.id),
    expenses.filter((e) => e.vehicleId === vehicle.id),
  );

  const timelineRows = timeline
    .map(
      (e) => `
      <tr>
        <td>${format(e.date, 'dd/MM/yyyy')}</td>
        <td>${e.title}</td>
        <td>${e.amount != null ? `$${e.amount.toLocaleString('es-AR')}` : '—'}</td>
        <td>${e.mileage != null ? `${e.mileage.toLocaleString()} km` : '—'}</td>
      </tr>`,
    )
    .join('');

  const completedReminders = reminders
    .filter((r) => r.vehicleId === vehicle.id && r.isCompleted)
    .map((r) => `<li>${r.title}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Historial — ${vehicle.make} ${vehicle.model}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 22px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #f4f4f5; }
    .meta { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${vehicle.make} ${vehicle.model} (${vehicle.year})</h1>
  <p class="meta">
    Patente: ${vehicle.licensePlate ?? '—'} · Kilometraje: ${vehicle.mileage.toLocaleString()} km<br/>
    Generado con ${BRAND.name} — ${format(Date.now(), "d 'de' MMMM yyyy", { locale: es })}
  </p>
  <h2>Historial</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Km</th></tr></thead>
    <tbody>${timelineRows || '<tr><td colspan="4">Sin registros</td></tr>'}</tbody>
  </table>
  ${completedReminders ? `<h2>Mantenimientos completados</h2><ul>${completedReminders}</ul>` : ''}
  <p class="meta" style="margin-top:32px">Documento para uso del comprador. Verificá comprobantes originales.</p>
</body>
</html>`;
}

export async function shareVehicleExport(html: string, vehicleLabel: string): Promise<void> {
  try {
    const Print = await import('expo-print');
    const Sharing = await import('expo-sharing');
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Historial ${vehicleLabel}`,
      });
    }
  } catch {
    const { Share } = await import('react-native');
    await Share.share({
      message: `Historial de ${vehicleLabel}\n\n(Instalá expo-print y expo-sharing para exportar PDF)`,
      title: `Historial ${vehicleLabel}`,
    });
  }
}
