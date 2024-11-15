import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
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
    setLoading(true); // Start loading state

    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert(
        "Permission Required",
        "Permission to access media library is required to pick an image."
      );
      setLoading(false); // Stop loading state
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    // Handle the result
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      if (!localUri) {
        console.warn("Received empty URI");
        showAlert("Error", "Received an empty URI.");
        setLoading(false);
        return;
      }

      const documentDirectory = FileSystem.documentDirectory;
      if (documentDirectory === null) {
        console.error("Document directory is null");
        showAlert("Error", "Could not access the document directory.");
        setLoading(false);
        return;
      }

      // Create the destination file URI
      const fileUri = `${documentDirectory}${localUri.split("/").pop()}`;

      try {
        await FileSystem.copyAsync({
          from: localUri,
          to: fileUri,
        });

        // Dispatch the new image URI to the Redux slice
        dispatch(addImage({ type: "gallery", src: fileUri }));
        showAlert("Success", "Image has been successfully saved.");
      } catch (error) {
        console.error("Error saving image locally:", error);
        showAlert("Error", "Failed to save the image. Please try again.");
      }
    } else {
      showAlert("No Image Selected", "You did not select any image.");
    }

    setLoading(false); // Stop loading state
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
