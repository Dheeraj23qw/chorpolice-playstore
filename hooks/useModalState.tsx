import { useState, useCallback } from 'react';

export const useModalState = () => {
  const [modals, setModals] = useState({
    modalVisible: false,
    infoModalVisible: false,
    confirmChangeVisible: false,
    infoAddMoreVisible: false,
  });

  const setModalVisible = useCallback(
    (modal: keyof typeof modals, visible: boolean) =>
      setModals(prev => ({ ...prev, [modal]: visible })),
    []
  );

  return {
    modals,
    setModalVisible,
  };
};
