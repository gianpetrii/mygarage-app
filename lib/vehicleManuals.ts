import { Linking } from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { VEHICLE_MANUALS_CATALOG, type VehicleManualCatalogEntry } from '@/constants/vehicleManuals';
import { normalizeMake, normalizeModel } from '@/lib/vehicleCatalog';
import { firebaseStorage } from '@/lib/firebase';

export type ResolvedVehicleManual =
  | { source: 'user'; url: string; label: string }
  | { source: 'catalog'; entry: VehicleManualCatalogEntry; url?: string };

function matchesYear(entry: VehicleManualCatalogEntry, year: number): boolean {
  if (entry.yearFrom != null && year < entry.yearFrom) return false;
  if (entry.yearTo != null && year > entry.yearTo) return false;
  return true;
}

/** Busca manual en catálogo por marca, modelo y año opcional. */
export function findCatalogManual(
  make: string,
  model: string,
  year?: number,
): VehicleManualCatalogEntry | null {
  const normalizedMake = normalizeMake(make);
  const normalizedModel = normalizeModel(model, normalizedMake);

  const matches = VEHICLE_MANUALS_CATALOG.filter(
    (e) =>
      e.make.toLowerCase() === normalizedMake.toLowerCase() &&
      e.model.toLowerCase() === normalizedModel.toLowerCase(),
  );

  if (!matches.length) return null;
  if (year != null) {
    const byYear = matches.find((e) => matchesYear(e, year));
    if (byYear) return byYear;
  }
  return matches[0];
}

export async function resolveCatalogManualUrl(storagePath: string): Promise<string> {
  const storageRef = ref(firebaseStorage, storagePath);
  return getDownloadURL(storageRef);
}

export async function resolveVehicleManual(
  make: string,
  model: string,
  year: number,
  userManualUrl?: string,
): Promise<ResolvedVehicleManual | null> {
  if (userManualUrl?.trim()) {
    return { source: 'user', url: userManualUrl.trim(), label: 'Manual del vehículo' };
  }

  const entry = findCatalogManual(make, model, year);
  if (!entry) return null;

  try {
    const url = await resolveCatalogManualUrl(entry.storagePath);
    return { source: 'catalog', entry, url };
  } catch {
    return { source: 'catalog', entry };
  }
}

export function getManualMenuLabel(
  resolved: ResolvedVehicleManual | null,
  isLoading: boolean,
): string {
  if (isLoading) return 'Cargando manual...';
  if (!resolved) return 'Agregar manual';
  if (resolved.source === 'catalog') {
    return resolved.url ? 'Abrir manual' : 'Manual no disponible';
  }
  return 'Abrir manual';
}

export async function openVehicleManual(
  make: string,
  model: string,
  year: number,
  userManualUrl?: string,
): Promise<'opened' | 'unavailable' | 'missing'> {
  const resolved = await resolveVehicleManual(make, model, year, userManualUrl);
  if (!resolved) return 'missing';
  if (!resolved.url) return 'unavailable';

  const canOpen = await Linking.canOpenURL(resolved.url);
  if (!canOpen) return 'unavailable';
  await Linking.openURL(resolved.url);
  return 'opened';
}
