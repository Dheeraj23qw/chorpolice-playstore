import { useState, useCallback } from 'react';

const MAX_NAME_LENGTH = 8;
const DEFAULT_PLAYER_NAME = 'player_';

interface ImageNames {
    [key: number]: string;
  }

export const usePlayerNameManagement = (setModalVisible: (modal: string, visible: boolean) => void) => {
  const [imageNames, setImageNames] = useState<{ [key: number]: string }>({});

  const handleNameChange = useCallback((imageId: number, name: string) => {
    if (name.length > MAX_NAME_LENGTH) {
      setModalVisible('modalVisible', true);
      return;
    }
    setImageNames(prev => ({ ...prev, [imageId]: name }));
  }, [setModalVisible]);

  const checkForDuplicateNames = useCallback(() => {
    const names = Object.values(imageNames).filter(name => name.trim() !== '');
    return new Set(names).size !== names.length;
  }, [imageNames]);

  const getDefaultNames = useCallback((imageIds: number[]): ImageNames =>
    imageIds.reduce((acc, id, index) => {
      if (!imageNames[id]) {
        acc[id] = `${DEFAULT_PLAYER_NAME}${index + 1}`;
      }
      return acc;
    }, {} as ImageNames),
    [imageNames]
  );


  return {
    imageNames,
    handleNameChange,
    checkForDuplicateNames,
    getDefaultNames,
  };
};
