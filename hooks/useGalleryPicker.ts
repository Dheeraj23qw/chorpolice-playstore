import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { addImage } from "@/redux/reducers/dynamicImagesReducer";
import { AppDispatch } from "@/redux/store";

const useGalleryPicker = () => {
  const dispatch = useDispatch<AppDispatch>();

  const pickImage = async (): Promise<string | null> => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // ✅ just use a string array
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;

      // Dispatch to Redux (existing functionality)
      dispatch(addImage({ type: "gallery", src: uri }));

      // Return URI for avatar or other uses
      return uri;
    }

    return null;
  };

  return { pickImage };
};

export default useGalleryPicker;
