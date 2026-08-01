import * as WebBrowser from 'expo-web-browser';
import { ref, getDownloadURL } from 'firebase/storage';
import { VEHICLE_MANUALS_CATALOG, type VehicleManualCatalogEntry } from '@/constants/vehicleManuals';
import { normalizeMake, normalizeModel } from '@/lib/vehicleCatalog';
import { firebaseStorage } from '@/lib/firebase';

export type VehicleManualStatus = 'available' | 'coming_soon';

export type ResolvedVehicleManual = {
  status: VehicleManualStatus;
  entry?: VehicleManualCatalogEntry;
  url?: string;
};

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
): Promise<ResolvedVehicleManual> {
  const entry = findCatalogManual(make, model, year);
  if (!entry) {
    return { status: 'coming_soon' };
  }

  try {
    const url = await resolveCatalogManualUrl(entry.storagePath);
    return { status: 'available', entry, url };
  } catch {
    return { status: 'coming_soon', entry };
  }
}

export async function openVehicleManual(
  make: string,
  model: string,
  year: number,
): Promise<'opened' | 'unavailable'> {
  const resolved = await resolveVehicleManual(make, model, year);
  if (resolved.status !== 'available' || !resolved.url) return 'unavailable';

  try {
    await WebBrowser.openBrowserAsync(resolved.url, {
      enableBarCollapsing: true,
      showTitle: true,
    });
    return 'opened';
  } catch {
    return 'unavailable';
  }
}
