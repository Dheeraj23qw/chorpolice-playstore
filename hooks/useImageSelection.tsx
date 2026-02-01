import { useState, useCallback } from 'react';
import { playerImages as playerImagesData } from '@/constants/playerData';
import { AudioEngine } from "@/audio/audioEngine";

const MAX_SELECTED_IMAGES = 4;

export const useImageSelection = (
  setModalVisible: (modal: string, visible: boolean) => void
) => {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const handleImageSelect = useCallback(
    (imageId: number) => {
      if (!playerImagesData[imageId]) {
        setModalVisible('modalVisible', true);
        return;
      }

      if (selectedImages.includes(imageId)) {
        setModalVisible('confirmChangeVisible', true);
        return;
      }

      if (selectedImages.length < MAX_SELECTED_IMAGES) {
        AudioEngine.play("level", "gameplay"); // ✅ correct architecture
        setSelectedImages(prev => [...prev, imageId]);

        if (selectedImages.length === 0) {
          setModalVisible('infoAddMoreVisible', true);
        }
      } else {
        setModalVisible('modalVisible', true);
      }
    },
    [selectedImages, setModalVisible]
  );

  return {
    selectedImages,
    handleImageSelect,
  };
};
