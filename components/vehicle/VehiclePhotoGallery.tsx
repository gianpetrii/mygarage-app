import * as React from 'react';
import {
  View,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Plus, X, Trash2, ChevronLeft, ChevronRight, Camera, ImagePlus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardSheet } from '@/components/layout/KeyboardSheet';
import { Text } from '@/components/ui/text';
import { uploadVehiclePhoto } from '@/lib/uploads';
import {
  pickVehiclePhotoFromGallery,
  takeVehiclePhotoWithCamera,
  type VehiclePhotoSource,
} from '@/lib/vehiclePhotoPicker';
import { cn } from '@/lib/utils';

const MAX_PHOTOS = 5;
const HERO_HEIGHT = 176;

interface VehiclePhotoGalleryProps {
  photos: string[];
  userId: string;
  vehicleId: string;
  onPhotosChange: (photos: string[]) => void | Promise<void>;
  className?: string;
}

function VehiclePhotoGallery({
  photos,
  userId,
  vehicleId,
  onPhotosChange,
  className,
}: VehiclePhotoGalleryProps) {
  const insets = useSafeAreaInsets();
  const viewerScrollRef = React.useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [sourceSheetOpen, setSourceSheetOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const screenWidth = Dimensions.get('window').width;
  const activeIndex = Math.min(selectedIndex, Math.max(0, photos.length - 1));
  const activePhoto = photos[activeIndex];
  const canAdd = photos.length < MAX_PHOTOS;
  const hasMultiple = photos.length > 1;

  React.useEffect(() => {
    if (selectedIndex >= photos.length && photos.length > 0) {
      setSelectedIndex(photos.length - 1);
    }
  }, [photos.length, selectedIndex]);

  React.useEffect(() => {
    if (!viewerOpen) return;
    requestAnimationFrame(() => {
      viewerScrollRef.current?.scrollTo({
        x: activeIndex * screenWidth,
        animated: viewerOpen,
      });
    });
  }, [viewerOpen, activeIndex, screenWidth]);

  const goPrev = () => {
    setSelectedIndex((i) => (i <= 0 ? photos.length - 1 : i - 1));
  };

  const goNext = () => {
    setSelectedIndex((i) => (i >= photos.length - 1 ? 0 : i + 1));
  };

  const openSourceSheet = () => {
    if (!canAdd || isUploading) return;
    setSourceSheetOpen(true);
  };

  const handleSourcePick = async (source: VehiclePhotoSource) => {
    setSourceSheetOpen(false);
    setIsUploading(true);
    try {
      const localUri =
        source === 'gallery'
          ? await pickVehiclePhotoFromGallery()
          : await takeVehiclePhotoWithCamera();
      if (!localUri) return;

      const remoteUrl = await uploadVehiclePhoto(userId, vehicleId, localUri);
      const next = [...photos, remoteUrl];
      await onPhotosChange(next);
      setSelectedIndex(next.length - 1);
    } catch {
      Alert.alert('Error', 'No se pudo subir la foto. Intentá de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (index: number) => {
    const remove = async () => {
      const next = photos.filter((_, i) => i !== index);
      await onPhotosChange(next);
      setSelectedIndex(Math.max(0, index - 1));
      if (viewerOpen && next.length === 0) setViewerOpen(false);
    };

    Alert.alert('Eliminar foto', '¿Querés quitar esta foto del vehículo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: remove },
    ]);
  };

  const NavArrow = ({
    direction,
    onPress,
    className: arrowClassName,
  }: {
    direction: 'left' | 'right';
    onPress: () => void;
    className?: string;
  }) => {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
    return (
      <Pressable
        onPress={onPress}
        className={cn(
          'absolute z-20 h-9 w-9 items-center justify-center rounded-lg bg-black/45 active:opacity-80',
          direction === 'left' ? 'left-2' : 'right-2',
          arrowClassName,
        )}
        accessibilityLabel={direction === 'left' ? 'Foto anterior' : 'Foto siguiente'}
      >
        <Icon size={22} color="#fff" />
      </Pressable>
    );
  };

  return (
    <View className={cn('bg-muted', className)}>
      {activePhoto ? (
        <View style={{ height: HERO_HEIGHT }} className="relative">
          <Pressable
            onPress={() => setViewerOpen(true)}
            className="h-full w-full active:opacity-95"
            accessibilityRole="imagebutton"
            accessibilityLabel="Ver foto en pantalla completa"
          >
            <Image
              source={{ uri: activePhoto }}
              style={{ width: '100%', height: HERO_HEIGHT }}
              resizeMode="cover"
            />
          </Pressable>

          {hasMultiple && (
            <>
              <NavArrow direction="left" onPress={goPrev} className="top-1/2 -mt-[18px]" />
              <NavArrow direction="right" onPress={goNext} className="top-1/2 -mt-[18px]" />
            </>
          )}

          {hasMultiple && (
            <View className="absolute bottom-2 left-0 right-0 items-center">
              <Text className="rounded-full bg-black/45 px-2.5 py-0.5 text-xs font-medium text-white">
                {activeIndex + 1} / {photos.length}
              </Text>
            </View>
          )}

          {canAdd && (
            <Pressable
              onPress={openSourceSheet}
              disabled={isUploading}
              className="absolute bottom-2 right-2 z-20 h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-black/50 active:opacity-80"
              accessibilityLabel="Agregar otra foto"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Plus size={22} color="#fff" />
              )}
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          onPress={openSourceSheet}
          disabled={isUploading}
          style={{ height: HERO_HEIGHT }}
          className="w-full items-center justify-center active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Agregar foto del vehículo"
        >
          {isUploading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View className="items-center gap-2 px-6">
              <View className="h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 bg-background">
                <Plus size={32} color="#71717a" />
              </View>
              <Text variant="muted" className="text-sm text-center">
                Agregar foto
              </Text>
            </View>
          )}
        </Pressable>
      )}

      <Modal visible={viewerOpen} animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <View
          className="flex-1 bg-black"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-between px-4 py-2">
            <Pressable
              onPress={() => setViewerOpen(false)}
              className="h-10 w-10 items-center justify-center rounded-lg bg-white/10"
              accessibilityLabel="Cerrar"
            >
              <X size={22} color="#fff" />
            </Pressable>
            <Text className="text-sm font-medium text-white">
              {activeIndex + 1} / {photos.length}
            </Text>
            <Pressable
              onPress={() => handleDelete(activeIndex)}
              className="h-10 w-10 items-center justify-center rounded-lg bg-white/10"
              accessibilityLabel="Eliminar foto"
            >
              <Trash2 size={20} color="#f87171" />
            </Pressable>
          </View>

          <View className="relative flex-1">
            <ScrollView
              ref={viewerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                setSelectedIndex(index);
              }}
            >
              {photos.map((uri, index) => (
                <View
                  key={`viewer-${uri}-${index}`}
                  style={{ width: screenWidth }}
                  className="flex-1 items-center justify-center"
                >
                  <Pressable
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    onPress={() => setViewerOpen(false)}
                    accessibilityLabel="Cerrar visor"
                  />
                  <Image
                    source={{ uri }}
                    style={{ width: screenWidth * 0.92, height: '78%' }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            {hasMultiple && (
              <>
                <NavArrow direction="left" onPress={goPrev} className="top-1/2 -mt-[18px]" />
                <NavArrow direction="right" onPress={goNext} className="top-1/2 -mt-[18px]" />
              </>
            )}
          </View>
        </View>
      </Modal>

      <KeyboardSheet visible={sourceSheetOpen} onClose={() => setSourceSheetOpen(false)}>
        <Text variant="h3" className="mb-1">
          Foto del vehículo
        </Text>
        <Text variant="muted" className="mb-4 text-sm">
          Elegí cómo agregar la foto
        </Text>
        <View className="gap-2">
          <Pressable
            onPress={() => handleSourcePick('gallery')}
            className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4 active:opacity-80"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
              <ImagePlus size={22} color="#18181b" />
            </View>
            <Text className="font-semibold text-foreground">Galería</Text>
          </Pressable>
          <Pressable
            onPress={() => handleSourcePick('camera')}
            className="flex-row items-center gap-4 rounded-xl border border-border bg-card p-4 active:opacity-80"
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-muted">
              <Camera size={22} color="#18181b" />
            </View>
            <Text className="font-semibold text-foreground">Cámara</Text>
          </Pressable>
        </View>
      </KeyboardSheet>
    </View>
  );
}

export { VehiclePhotoGallery };
