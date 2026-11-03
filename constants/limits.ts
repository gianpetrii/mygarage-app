/** Límites de uso gratuito por cuenta (control de costos en Firebase). */
export const APP_LIMITS = {
  maxVehiclesPerUser: 5,
  maxPhotosPerVehicle: 10,
  maxReceiptsPerActivity: 2,
  /** Calidad JPEG al elegir/subir imágenes (0–1). */
  imagePickerQuality: 0.7,
  /** Tamaño máximo por archivo en Storage (debe coincidir con storage.rules). */
  maxUploadBytes: 5 * 1024 * 1024,
} as const;
