// useGalleryPicker.ts
import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useDispatch } from "react-redux";
import { addImage } from "@/redux/slices/dynamicImagesSlice";

const useGalleryPicker = () => {
  const dispatch = useDispatch();

  const pickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      console.warn("Permission to access media library was denied.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      if (!localUri) {
        return;
      }

      const documentDirectory = FileSystem.documentDirectory;
      if (documentDirectory === null) {
        return;
      }

      const fileUri = `${documentDirectory}${localUri.split("/").pop()}`;
      try {
        await FileSystem.copyAsync({
          from: localUri,
          to: fileUri,
        });

        // Dispatch the new image URI to playerImagesSlice
        dispatch(addImage({ type: "gallery", src: fileUri }));
      } catch (error) {
        console.error("Error saving image locally:", error);
      }
    }
  }, [dispatch]);

  return { pickImage };
};

export default useGalleryPicker;
