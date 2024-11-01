import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { playSound } from '@/redux/slices/soundSlice';
import { playerImages as playerImagesData } from '@/constants/playerData';

const MAX_SELECTED_IMAGES = 4;

export const useImageSelection = (setModalVisible: (modal: string, visible: boolean) => void) => {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const dispatch = useDispatch();

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
        dispatch(playSound("level"));
        setSelectedImages(prev => [...prev, imageId]);
        if (selectedImages.length === 0) {
          setModalVisible('infoAddMoreVisible', true);
        }
      } else {
        setModalVisible('modalVisible', true);
      }
    },
    [selectedImages, dispatch, setModalVisible]
  );

  return {
    selectedImages,
    handleImageSelect,
  };
};
