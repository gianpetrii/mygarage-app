import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BRAND } from '@/constants/brand';
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS } from '@/constants/domain';
import { formatCurrency } from './currency';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { getTimelineSubtitle, maintenanceToTimeline } from './timeline';
import { buildTechnicalSpecsHtml } from './exportVehicleSpecsHtml';
import type { Vehicle, MaintenanceRecord } from '@/types';

export interface VehicleExportSections {
  vehicleData: boolean;
  activityHistory: boolean;
  vehiclePhotos: boolean;
  receiptPhotos: boolean;
  technicalSpecs: boolean;
  manual: boolean;
}

export const DEFAULT_VEHICLE_EXPORT_SECTIONS: VehicleExportSections = {
  vehicleData: true,
  activityHistory: true,
  vehiclePhotos: true,
  receiptPhotos: true,
  technicalSpecs: true,
  manual: true,
};

export interface VehicleExportOptions {
  manualUrl?: string;
  sections?: VehicleExportSections;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

export function buildVehicleExportTitle(vehicle: Vehicle): string {
  const base = `${vehicle.make} ${vehicle.model}`.trim();
  const plate = vehicle.licensePlate?.trim();
  return plate ? `${base} · ${plate.toUpperCase()}` : base;
}

function buildActivityDetailLines(record: MaintenanceRecord, entryTitle: string): string {
  const subtitle = getTimelineSubtitle({
    id: record.id,
    type: 'maintenance',
    vehicleId: record.vehicleId,
    date: record.date,
    title: entryTitle,
    amount: record.cost,
    mileage: record.mileage,
    source: record,
  });

  const lines = [
    subtitle.trim().toLowerCase() !== entryTitle.trim().toLowerCase() ? subtitle : null,
    record.serviceProvider ? `Taller: ${record.serviceProvider}` : null,
    record.description?.trim() ? record.description.trim() : null,
    record.notes?.trim() ? record.notes.trim() : null,
  ].filter(Boolean);

  return lines.join(' · ');
}

function buildPhotoGridHtml(photos: string[], alt: string): string {
  if (photos.length === 0) return '';

  return `<div class="photo-grid">
    ${photos
      .map(
        (uri, index) =>
          `<img src="${escapeAttr(uri)}" alt="${escapeAttr(`${alt} ${index + 1}`)}" />`,
      )
      .join('')}
  </div>`;
}

function buildReceiptPhotosHtml(maintenance: MaintenanceRecord[]): string {
  const withPhotos = maintenance
    .filter((r) => r.photos.length > 0)
    .sort((a, b) => b.date - a.date);

  if (withPhotos.length === 0) return '';

  return withPhotos
    .map((record) => {
      const caption = `${format(record.date, 'dd/MM/yyyy')} — ${record.title}`;
      return `<div class="receipt-block">
        <p class="receipt-caption"><strong>${escapeHtml(caption)}</strong></p>
        ${buildPhotoGridHtml(record.photos, record.title)}
      </div>`;
    })
    .join('');
}

export function buildVehicleExportHtml(
  vehicle: Vehicle,
  maintenance: MaintenanceRecord[],
  options?: VehicleExportOptions,
): string {
  const sections = { ...DEFAULT_VEHICLE_EXPORT_SECTIONS, ...options?.sections };
  const currency = DEFAULT_CURRENCY;
  const title = buildVehicleExportTitle(vehicle);
  const vehicleMaintenance = maintenance
    .filter((m) => m.vehicleId === vehicle.id)
    .sort((a, b) => b.date - a.date);

  const timeline = vehicleMaintenance.map(maintenanceToTimeline);

  const historyRows = timeline
    .map((entry) => {
      const record = entry.source as MaintenanceRecord;
      const details = buildActivityDetailLines(record, entry.title);

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

  const manualUrl = options?.manualUrl ?? vehicle.manualUrl;
  const manualSection =
    sections.manual && manualUrl
      ? `<h2>Manual del vehículo</h2>
       <p><a href="${escapeHtml(manualUrl)}">${escapeHtml(manualUrl)}</a></p>`
      : '';

  const vehiclePhotosSection =
    sections.vehiclePhotos && (vehicle.photos?.length ?? 0) > 0
      ? `<h2>Fotos del vehículo</h2>
         ${buildPhotoGridHtml(vehicle.photos ?? [], `${vehicle.make} ${vehicle.model}`)}`
      : '';

  const receiptPhotosHtml = buildReceiptPhotosHtml(vehicleMaintenance);
  const receiptPhotosSection =
    sections.receiptPhotos && receiptPhotosHtml
      ? `<h2>Comprobantes</h2>
         <p class="sub">Fotos de services y arreglos registrados en el historial.</p>
         ${receiptPhotosHtml}`
      : '';

  const technicalSpecsSection =
    sections.technicalSpecs ? buildTechnicalSpecsHtml(vehicle) ?? '' : '';

  const specs = [
    ['Marca / modelo', `${vehicle.make} ${vehicle.model}`],
    ['Año', String(vehicle.year)],
    ['Versión', vehicle.trim],
    ['Patente', vehicle.licensePlate],
    ['Kilometraje', `${vehicle.mileage.toLocaleString()} km`],
    ['Tipo de motor', FUEL_TYPE_LABELS[vehicle.fuelType]],
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

  const activitySection = sections.activityHistory
    ? `<h2>Historial de actividades</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Detalle</th><th>Monto</th><th>Km</th></tr></thead>
    <tbody>${historyRows || '<tr><td colspan="4">Sin registros</td></tr>'}</tbody>
  </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Historial — ${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; line-height: 1.45; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin-top: 28px; margin-bottom: 8px; }
    h3.spec-section { font-size: 14px; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.03em; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
    th { background: #f4f4f5; width: 32%; }
    table.spec-table th { width: 38%; }
    table.spec-table.compare th { width: auto; font-size: 12px; }
    table.spec-table.compare td { font-size: 12px; }
    .meta { color: #666; font-size: 13px; }
    .sub { color: #666; font-size: 12px; }
    .spec-title { font-size: 15px; font-weight: 600; margin: 4px 0 0; }
    a { color: #111; word-break: break-all; }
    .photo-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
    .photo-grid img { width: 46%; max-width: 300px; height: auto; border-radius: 8px; border: 1px solid #ddd; object-fit: cover; }
    .receipt-block { margin-top: 16px; page-break-inside: avoid; }
    .receipt-caption { margin: 0 0 8px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">
    Generado con ${BRAND.name} — ${format(Date.now(), "d 'de' MMMM yyyy", { locale: es })}
  </p>

  ${
    sections.vehicleData
      ? `<h2>Datos del vehículo</h2>
  <table>
    <tbody>${specs}</tbody>
  </table>`
      : ''
  }

  ${vehiclePhotosSection}

  ${technicalSpecsSection}

  ${activitySection}

  ${receiptPhotosSection}

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
