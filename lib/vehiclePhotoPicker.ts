import { Alert } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { APP_LIMITS } from '@/constants/limits';

export type VehiclePhotoSource = 'gallery' | 'camera';

export async function pickVehiclePhotoFromGallery(): Promise<string | null> {
  const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos.');
    return null;
  }

  const result = await ExpoImagePicker.launchImageLibraryAsync({
    mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: false,
    quality: APP_LIMITS.imagePickerQuality,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export async function takeVehiclePhotoWithCamera(): Promise<string | null> {
  const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
    return null;
  }

  const result = await ExpoImagePicker.launchCameraAsync({
    quality: APP_LIMITS.imagePickerQuality,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}
