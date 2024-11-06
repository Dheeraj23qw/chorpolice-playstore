import { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router'; 
import { Href } from 'expo-router';

interface ModalButton {
  text: string;
  onPress: () => void;
}

interface UseBackHandlerModalProps {
  onExit?: () => void; 
  navigateToScreen?: Href<string | object> ; 
}

const useBackHandlerModal = ({ onExit, navigateToScreen }: UseBackHandlerModalProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter(); 

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Show modal when back button is pressed
      setModalVisible(true);
      return true;  // Prevent default behavior (exit app)
    });

    return () => backHandler.remove();  // Cleanup back handler on component unmount
  }, []);

  // Modal buttons
  const modalButtons: ModalButton[] = [
    { 
      text: 'Yes', 
      onPress: () => {
        if (onExit) {
          onExit(); // Trigger custom exit logic if provided
        }
        if (navigateToScreen) {
          router.push(navigateToScreen); // Navigate to the specified screen if given
        } else {
          BackHandler.exitApp(); // Exit the app if no navigation is specified
        }
      } 
    },
    { 
      text: 'No', 
      onPress: () => setModalVisible(false)  // Close the modal
    }
  ];

  return { modalVisible, setModalVisible, modalButtons };
};

export default useBackHandlerModal;
