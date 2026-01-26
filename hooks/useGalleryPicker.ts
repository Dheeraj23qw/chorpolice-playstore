import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system"; 
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

    // 1. Permissions check
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert("Permission Required", "Gallery access is needed to pick an image.");
      setLoading(false);
      return;
    }

    // 2. Launch Picker (Updated MediaType syntax for 2026)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Array syntax is now preferred over MediaTypeOptions
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      const selectedAsset = result.assets[0];
      const fileName = selectedAsset.fileName ?? `img_${Date.now()}.jpg`;

      try {
        // 3. Modern File System usage
        // Paths.document points to the app's persistent document directory
        const destinationFile = new File(Paths.document, fileName);
        
        // The source is the temporary URI from the picker
        const sourceFile = new File(selectedAsset.uri);

        // Copy using the modern .copy() method
        await sourceFile.copy(destinationFile);

        // 4. Update Redux with the permanent URI
        dispatch(addImage({ type: "gallery", src: destinationFile.uri }));
        showAlert("Success", "Image has been saved to your gallery.");
      } catch (error) {
        console.error("Modern FS Error:", error);
        showAlert("Error", "Failed to save the image locally.");
      }
    } else {
      showAlert("No Image Selected", "Selection was cancelled.");
    }

    setLoading(false);
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