import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { addImage } from "@/redux/reducers/dynamicImagesReducer";

const useGalleryPicker = () => {
  const dispatch = useDispatch();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      dispatch(addImage({ type: "gallery", src: result.assets[0].uri }));
    }
  };

  return { pickImage };
};

export default useGalleryPicker;