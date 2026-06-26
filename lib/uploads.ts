import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from './firebase';

export async function uploadImage(
  userId: string,
  folder: string,
  localUri: string,
  filename?: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
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
