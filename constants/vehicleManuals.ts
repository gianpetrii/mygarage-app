/** Entrada del catálogo de manuales (Firebase Storage, lectura pública). */
export interface VehicleManualCatalogEntry {
  make: string;
  model: string;
  /** Ruta en Storage, ej. catalog/manuals/volkswagen/gol.pdf */
  storagePath: string;
  yearFrom?: number;
  yearTo?: number;
  /** Título visible al abrir */
  label: string;
}

/**
 * Manuales piloto en Storage. Reemplazá los PDF en catalog/manuals/ y ejecutá
 * pnpm run upload:manuals antes de probar en la app.
 */
export const VEHICLE_MANUALS_CATALOG: VehicleManualCatalogEntry[] = [
  {
    make: 'Volkswagen',
    model: 'Gol',
    storagePath: 'catalog/manuals/volkswagen/gol.pdf',
    yearFrom: 2013,
    yearTo: 2023,
    label: 'Manual Volkswagen Gol',
  },
  {
    make: 'Toyota',
    model: 'Corolla',
    storagePath: 'catalog/manuals/toyota/corolla.pdf',
    yearFrom: 2014,
    yearTo: 2024,
    label: 'Manual Toyota Corolla',
  },
  {
    make: 'Chevrolet',
    model: 'Onix',
    storagePath: 'catalog/manuals/chevrolet/onix.pdf',
    yearFrom: 2016,
    yearTo: 2024,
    label: 'Manual Chevrolet Onix',
  },
];
