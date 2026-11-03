import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { APP_LIMITS } from '@/constants/limits';
import { QuotaExceededError } from '@/lib/quota';
import { firebaseStorage } from './firebase';

function formatMaxUploadMb(): string {
  return String(Math.round(APP_LIMITS.maxUploadBytes / (1024 * 1024)));
}

export async function uploadImage(
  userId: string,
  folder: string,
  localUri: string,
  filename?: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.size > APP_LIMITS.maxUploadBytes) {
    throw new QuotaExceededError(
      `La imagen supera el tamaño máximo de ${formatMaxUploadMb()} MB. Probá con otra foto.`,
    );
  }

  const name = filename ?? `${Date.now()}.jpg`;
  const path = `users/${userId}/${folder}/${name}`;
  const storageRef = ref(firebaseStorage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function uploadVehiclePhoto(
  userId: string,
  vehicleId: string,
  localUri: string,
): Promise<string> {
  return uploadImage(userId, `vehicles/${vehicleId}/photos`, localUri);
}

export async function uploadReceipt(
  userId: string,
  vehicleId: string,
  localUri: string,
): Promise<string> {
  return uploadImage(userId, `vehicles/${vehicleId}/receipts`, localUri);
}

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
}
