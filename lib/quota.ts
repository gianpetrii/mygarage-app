import { Alert } from 'react-native';
import { APP_LIMITS } from '@/constants/limits';

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export function canAddVehicle(vehicleCount: number): boolean {
  return vehicleCount < APP_LIMITS.maxVehiclesPerUser;
}

export function assertCanAddVehicle(vehicleCount: number): void {
  if (!canAddVehicle(vehicleCount)) {
    throw new QuotaExceededError(
      `Podés registrar hasta ${APP_LIMITS.maxVehiclesPerUser} vehículos por cuenta.`,
    );
  }
}

export function guardAddVehicle(vehicleCount: number): boolean {
  if (canAddVehicle(vehicleCount)) return true;
  Alert.alert(
    'Límite alcanzado',
    `Podés registrar hasta ${APP_LIMITS.maxVehiclesPerUser} vehículos. Eliminá uno para agregar otro.`,
  );
  return false;
}

export function canAddVehiclePhoto(currentCount: number): boolean {
  return currentCount < APP_LIMITS.maxPhotosPerVehicle;
}

export function guardAddVehiclePhoto(currentCount: number): boolean {
  if (canAddVehiclePhoto(currentCount)) return true;
  Alert.alert(
    'Límite de fotos',
    `Cada vehículo admite hasta ${APP_LIMITS.maxPhotosPerVehicle} fotos.`,
  );
  return false;
}

export function canAddReceiptPhotos(currentCount: number, adding = 1): boolean {
  return currentCount + adding <= APP_LIMITS.maxReceiptsPerActivity;
}
