import { isUniformRow, resolveSpecCell } from '@/constants/vehicleSpecs';
import { findCatalogSpecs } from '@/lib/vehicleSpecs';
import { normalizeTrim } from '@/lib/vehicleCatalog';
import type { Vehicle } from '@/types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function hasTechnicalSpecsForVehicle(vehicle: Vehicle): boolean {
  return findCatalogSpecs(vehicle.make, vehicle.model, vehicle.year) != null;
}

export function buildTechnicalSpecsHtml(vehicle: Vehicle): string | null {
  const catalog = findCatalogSpecs(vehicle.make, vehicle.model, vehicle.year);
  if (!catalog) return null;

  const activeTrim = vehicle.trim ? normalizeTrim(vehicle.trim) : null;
  const highlightedVersion =
    activeTrim && catalog.versions.some((v) => v.toLowerCase() === activeTrim.toLowerCase())
      ? catalog.versions.find((v) => v.toLowerCase() === activeTrim.toLowerCase())
      : null;

  const versionNote = highlightedVersion
    ? `<p class="sub">Versión de referencia: <strong>${escapeHtml(highlightedVersion)}</strong></p>`
    : `<p class="sub">Comparativa por versión disponible en catálogo.</p>`;

  const sectionsHtml = catalog.sections
    .map((section) => {
      if (highlightedVersion) {
        const rows = section.rows
          .map((row) => {
            const value = isUniformRow(row, catalog.versions)
              ? resolveSpecCell(row, catalog.versions[0])
              : resolveSpecCell(row, highlightedVersion);
            return `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(value)}</td></tr>`;
          })
          .join('');

        return `<h3 class="spec-section">${escapeHtml(section.title)}</h3>
        <table class="spec-table"><tbody>${rows}</tbody></table>`;
      }

      const header = catalog.versions
        .map((v) => `<th>${escapeHtml(v)}</th>`)
        .join('');

      const rows = section.rows
        .map((row) => {
          if (isUniformRow(row, catalog.versions)) {
            const value = resolveSpecCell(row, catalog.versions[0]);
            return `<tr><th>${escapeHtml(row.label)}</th><td colspan="${catalog.versions.length}">${escapeHtml(value)}</td></tr>`;
          }
          const cells = catalog.versions
            .map((v) => `<td>${escapeHtml(resolveSpecCell(row, v))}</td>`)
            .join('');
          return `<tr><th>${escapeHtml(row.label)}</th>${cells}</tr>`;
        })
        .join('');

      return `<h3 class="spec-section">${escapeHtml(section.title)}</h3>
      <table class="spec-table compare">
        <thead><tr><th>Especificación</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    })
    .join('');

  return `<h2>Ficha técnica</h2>
  <p class="spec-title">${escapeHtml(catalog.displayName)}</p>
  <p class="sub">${escapeHtml(catalog.subtitle)}</p>
  ${versionNote}
  ${sectionsHtml}
  <p class="sub" style="margin-top:12px">Valores de referencia por versión. Pueden variar según año de fabricación.</p>`;
}
