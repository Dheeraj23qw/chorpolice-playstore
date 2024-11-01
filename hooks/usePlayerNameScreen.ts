import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { setPlayerNames, setSelectedImages } from '@/redux/slices/playerSlice';
import { playSound } from '@/redux/slices/soundSlice';
import { RootState } from '@/redux/store';

const MAX_SELECTED_IMAGES = 4;
const MAX_NAME_LENGTH = 8;
const DEFAULT_PLAYER_NAME = 'player_';
const DEFAULT_BOT_NAME = 'bot_';
const MAX_SELECTEDBOTS_IMAGES = 3;
const MIN_SELECTEDBOTS_IMAGES = 1;


interface ImageNames {
  [key: number]: string;
}

export const usePlayerNameScreen = () => {
  const [selectedImages, setSelectedImagesState] = useState<number[]>([]);
  const [imageNames, setImageNamesState] = useState<ImageNames>({});
  const [modals, setModals] = useState({
    modalVisible: false,
    infoModalVisible: false,
    confirmChangeVisible: false,
    infoAddMoreVisible: false,
  });
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  // Use player images from Redux state
  const playerImages = useSelector((state: RootState) => state.playerImages.images);

  const handleImageSelect = useCallback(
    (imageId: number) => {
      if (!playerImages[imageId]) {
        setAlertMessage('Selected image is not available.');
        setModals(prev => ({ ...prev, modalVisible: true }));
        return;
      }

      if (selectedImages.includes(imageId)) {
        setAlertMessage('Do you want to change this superhero?');
        setCurrentImageId(imageId);
        setModals(prev => ({ ...prev, confirmChangeVisible: true }));
        return;
      }

      if (selectedImages.length < MAX_SELECTED_IMAGES) {
        dispatch(playSound("level"));
        setSelectedImagesState(prevSelectedImages => [...prevSelectedImages, imageId]);
        setImageNamesState(prevNames => ({ ...prevNames, [imageId]: '' }));

        // Notify the user to add more avatars
        if (selectedImages.length === 0) {
          setAlertMessage('Add 3 more avatars to play');
          setModals(prev => ({ ...prev, infoAddMoreVisible: true }));
        }
      } else {
        setAlertMessage('You can only pick 4 superheroes.');
        setModals(prev => ({ ...prev, modalVisible: true }));
      }
    },
    [selectedImages, playerImages, dispatch]
  );

  const handleSelectedImageClick = useCallback((imageId: number) => {
    if (selectedImages.includes(imageId)) {
      dispatch(playSound('select')); 
      setAlertMessage('This superhero is already selected. Do you want to change it?');
      setCurrentImageId(imageId);
      setModals(prev => ({ ...prev, confirmChangeVisible: true }));
    }
  }, [selectedImages, dispatch]);

  const handleNameChange = useCallback((imageId: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) {
      setAlertMessage(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
      setModals(prev => ({ ...prev, modalVisible: true }));
      return;
    }

    setImageNamesState(prevNames => ({ ...prevNames, [imageId]: name }));
  }, []);

  const getDefaultNames = useCallback((imageIds: number[]): ImageNames =>
    imageIds.reduce((acc, id, index) => {
      if (!imageNames[id]) {
        acc[id] = `${DEFAULT_PLAYER_NAME}${index + 1}`;
      }
      return acc;
    }, {} as ImageNames),
    [imageNames]
  );

  const checkForDuplicateNames = useCallback((): boolean => {
    const names = Object.values(imageNames).filter(name => name.trim() !== '');
    return new Set(names).size !== names.length;
  }, [imageNames]);

  const handleStartAdventure = useCallback(async () => {
    setIsButtonDisabled(true); // Disable the button after click
    try {
      if (checkForDuplicateNames()) {
        setAlertMessage('Please make sure each superhero has a unique name.');
        setModals(prev => ({ ...prev, modalVisible: true }));
        setIsButtonDisabled(false); // Re-enable button on error
        return;
      }

      if (selectedImages.length < MAX_SELECTED_IMAGES) {
        setAlertMessage('Add 3 more avatars to play');
        setModals(prev => ({ ...prev, infoAddMoreVisible: true }));
        setIsButtonDisabled(false); // Re-enable button on error

        return;
      }

      const updatedImageNames = { ...imageNames, ...getDefaultNames(selectedImages) };
      const imagesWithDetails = selectedImages.map(id => ({
        id,
        name: updatedImageNames[id],
      }));

      await dispatch(setSelectedImages(selectedImages));
      await dispatch(setPlayerNames(imagesWithDetails));
      router.push('/chorpolicegame');
    } catch (error) {
      console.error('Failed to start adventure:', error);
      if (error instanceof TypeError) {
        setAlertMessage('There was an issue with the data provided. Please check and try again.');
      } else if (error instanceof Error) {
        setAlertMessage(`An error occurred: ${error.message}`);
      } else {
        setAlertMessage('An unexpected error occurred. Please try again.');
      }
      setModals(prev => ({ ...prev, modalVisible: true }));
    }finally {
      setIsButtonDisabled(false); // Re-enable the button after task completion
    }
  }, [selectedImages, imageNames, getDefaultNames, checkForDuplicateNames, dispatch, router]);

  const showGameInfo = useCallback(() => {
    dispatch(playSound('select')); 
    setModals(prev => ({ ...prev, infoModalVisible: true }));
  }, [dispatch]);

  const closeAlertModal = useCallback(() => {
    setModals(prev => ({ ...prev, modalVisible: false }));
  }, []);

  const closeInfoAddMoreModal = useCallback(() => {
    setModals(prev => ({ ...prev, infoAddMoreVisible: false }));
  }, []);

  const handleAlertConfirm = useCallback(() => {
    dispatch(playSound('select')); 
    if (currentImageId !== null) {
      setSelectedImagesState(prevSelectedImages =>
        prevSelectedImages.filter(id => id !== currentImageId)
      );
      setImageNamesState(prevNames => {
        const { [currentImageId]: _, ...newNames } = prevNames;
        return newNames;
      });
      setCurrentImageId(null);
    }
    closeAlertModal();
    setModals(prev => ({ ...prev, confirmChangeVisible: false }));
  }, [currentImageId, closeAlertModal, dispatch]);

  return {
    selectedImages,
    imageNames,
    handleImageSelect,
    handleSelectedImageClick,
    handleNameChange,
    handleStartAdventure,
    showGameInfo,
    closeAlertModal,
    closeInfoAddMoreModal,
    handleAlertConfirm,
    modalVisible: modals.modalVisible,
    infoModalVisible: modals.infoModalVisible,
    confirmChangeVisible: modals.confirmChangeVisible,
    infoAddMoreVisible: modals.infoAddMoreVisible,
    alertMessage,
    setInfoModalVisible: (visible: boolean) => setModals(prev => ({ ...prev, infoModalVisible: visible })),
    setConfirmChangeVisible: (visible: boolean) => setModals(prev => ({ ...prev, confirmChangeVisible: visible })),
    setModalVisible: (visible: boolean) => setModals(prev => ({ ...prev, modalVisible: visible })),
    setInfoAddMoreVisible: (visible: boolean) => setModals(prev => ({ ...prev, infoAddMoreVisible: visible })),
    setAlertMessage,
    isButtonDisabled
  };
};
