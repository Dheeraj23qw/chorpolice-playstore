import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; // Use the main module for operations
import { Paths } from "expo-file-system"; 
import { useDispatch } from "react-redux";
import { addImage } from "@/redux/reducers/dynamicImagesReducer";

const useGalleryPicker = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const showAlert = (title: string, message: string) => {
    setModalTitle(title);
    setModalContent(message);
    setIsModalVisible(true);
  };

  const pickImage = useCallback(async () => {
    setLoading(true);

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert("Permission Required", "Gallery access is needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const selectedAsset = result.assets[0];
      const fileName = selectedAsset.fileName ?? `img_${Date.now()}.jpg`;
      
      // Define the destination path string using the modern Paths utility
      const destinationUri = `${Paths.document}/${fileName}`;

      // Use the standard FileSystem.copyAsync which is the most compatible
      await FileSystem.copyAsync({
        from: selectedAsset.uri,
        to: destinationUri,
      });

      // Update Redux
      dispatch(addImage({ type: "gallery", src: destinationUri }));
      showAlert("Success", "Image saved!");

    } catch (error) {
      console.error("Gallery Picker Error:", error);
      showAlert("Error", "Failed to save the image locally.");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  return {
    pickImage,
    loading,
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  };
};

export default useGalleryPicker;