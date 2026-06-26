import * as React from 'react';
import { View, Pressable, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { uploadVehiclePhoto, uploadReceipt, isLocalUri } from '@/lib/uploads';
import { cn } from '@/lib/utils';
import { Text } from './text';

interface UploadConfig {
  userId: string;
  vehicleId: string;
  type: 'vehicle' | 'receipt';
}

interface ImagePickerProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  uploadConfig?: UploadConfig;
}

async function resolveUris(
  uris: string[],
  uploadConfig?: UploadConfig,
): Promise<string[]> {
  if (!uploadConfig) return uris;
  const resolved: string[] = [];
  for (const uri of uris) {
    if (isLocalUri(uri)) {
      const remote =
        uploadConfig.type === 'vehicle'
          ? await uploadVehiclePhoto(uploadConfig.userId, uploadConfig.vehicleId, uri)
          : await uploadReceipt(uploadConfig.userId, uploadConfig.vehicleId, uri);
      resolved.push(remote);
    } else {
      resolved.push(uri);
    }
  }
  return resolved;
}

function ImagePickerField({
  label,
  images,
  onChange,
  maxImages = 5,
  className,
  uploadConfig,
}: ImagePickerProps) {
  const canAdd = images.length < maxImages;
  const [isUploading, setIsUploading] = React.useState(false);

  const handleNewImages = async (uris: string[]) => {
    if (!uris.length) return;
    if (uploadConfig) {
      setIsUploading(true);
      try {
        const remote = await resolveUris(uris, uploadConfig);
        onChange([...images, ...remote]);
      } catch {
        Alert.alert('Error', 'No se pudieron subir las fotos. Intentá de nuevo.');
      } finally {
        setIsUploading(false);
      }
    } else {
      onChange([...images, ...uris]);
    }
  };

  const pickImage = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos.');
      return;
    }

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      await handleNewImages(uris);
    }
  };

  const takePhoto = async () => {
    const { status } = await ExpoImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara.');
      return;
    }

    const result = await ExpoImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      await handleNewImages([result.assets[0].uri]);
    }
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <View className={cn('w-full gap-1.5', className)}>
      {label && (
        <Text variant="small" className="font-medium text-foreground">{label}</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 py-0.5">
          {images.map((uri, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => remove(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive rounded-full items-center justify-center"
              >
                <X size={12} color="white" />
              </Pressable>
            </View>
          ))}
          {canAdd && (
            <>
              <Pressable
                onPress={pickImage}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border items-center justify-center bg-muted/40"
              >
                <ImagePlus size={22} color="#71717a" />
              </Pressable>
              <Pressable
                onPress={takePhoto}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border items-center justify-center bg-muted/40"
              >
                <Camera size={22} color="#71717a" />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
      <Text variant="muted" className="text-xs mt-1">
        {images.length}/{maxImages} fotos
        {isUploading ? ' · Subiendo...' : ''}
      </Text>
      {isUploading && (
        <ActivityIndicator size="small" className="mt-1" />
      )}
    </View>
  );
}

export { ImagePickerField };
