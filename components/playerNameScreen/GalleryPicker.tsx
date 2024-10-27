import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { setSelectedImages } from "@/redux/slices/imageSlice";
import styles from "./_css/gallarypickerCSS";
import CustomModal from "@/modal/CustomModal";
import { playerNameStyles } from "@/screens/playerNameScreen/playerNameCss";

const GalleryPicker: React.FC = () => {
  const [localSelectedImages, setLocalSelectedImages] = useState<string[]>([]);
  const [imageNames, setImageNames] = useState<Record<string, string>>({});
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false);
  const [isStartAdventureModalVisible, setIsStartAdventureModalVisible] =
    useState(false);
  const [startButtonVisible, setStartButtonVisible] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setStartButtonVisible(localSelectedImages.length === 4);
  }, [localSelectedImages]);

  const pickImage = async () => {
    if (localSelectedImages.length >= 4) {
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
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

        const newSelectedImages = [...localSelectedImages, fileUri];
        setLocalSelectedImages(newSelectedImages);
        dispatch(setSelectedImages(newSelectedImages));
      } catch (error) {
        console.error("Error saving image locally:", error);
      }
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImageToDelete(uri);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      const updatedImages = localSelectedImages.filter(
        (image) => image !== imageToDelete
      );
      setLocalSelectedImages(updatedImages);
      dispatch(setSelectedImages(updatedImages));
      setImageNames((prev) => {
        const { [imageToDelete]: _, ...rest } = prev;
        return rest;
      });
      setIsDeleteModalVisible(false);
      setImageToDelete(null);
    }
  };

  const handleTextChange = (uri: string) => (text: string) => {
    if (text.length > 8) return; // Limit input to 8 characters

    setImageNames((prev) => ({ ...prev, [uri]: text }));
  };

  const handleSaveImages = () => {
    console.log("Images to be saved:", localSelectedImages);
    setIsSaveModalVisible(false);
    setIsSuccessModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsSaveModalVisible(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setImageToDelete(null);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalVisible(false);
  };

  const handleStartAdventure = () => {
    // Check for empty names
    const hasEmptyNames = Object.values(imageNames).some(
      (name) => name.trim() === ""
    );
    if (hasEmptyNames) {
      setIsStartAdventureModalVisible(true);
      return; // Exit if there are empty names
    }

    // Check for duplicate names
    const namesSet = new Set(Object.values(imageNames));
    const hasDuplicates = namesSet.size !== Object.values(imageNames).length;

    if (hasDuplicates) {
      setIsDuplicateModalVisible(true);
    } else {
      setIsSaveModalVisible(true); // If everything is okay, proceed to save
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Ionicons name="image-outline" style={styles.icon} />
        <Text style={styles.buttonText}>
          Choose Avatar from Gallery (Up to 4)
        </Text>
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imageContainer}
      >
        {localSelectedImages.map((imageUri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <View style={styles.imageBorderContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </View>
            <View style={styles.nameInputContainer}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter Name"
                placeholderTextColor="#888"
                value={imageNames[imageUri] || ""}
                onChangeText={handleTextChange(imageUri)}
                maxLength={8} // Limit input to 8 characters
              />
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveImage(imageUri)}
              style={styles.removeButton}
            >
              <Ionicons name="trash-bin" size={28} color="purple" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {/* Save confirmation modal */}
      <CustomModal
        visible={isSaveModalVisible}
        onClose={handleCloseModal}
        title="Save Images"
        content="Do you want to save the selected images and names?"
        buttons={[
          { text: "Yes", onPress: handleSaveImages },
          { text: "No", onPress: handleCloseModal },
        ]}
      />
      {/* Delete confirmation modal */}
      <CustomModal
        visible={isDeleteModalVisible}
        onClose={handleCancelDelete}
        title="Delete Image"
        content="Are you sure you want to delete this image?"
        buttons={[
          { text: "Yes", onPress: confirmDelete },
          { text: "No", onPress: handleCancelDelete },
        ]}
      />
      {/* Success modal */}
      <CustomModal
        visible={isSuccessModalVisible}
        onClose={handleCloseSuccessModal}
        title="Success!"
        content="Your selected images and names have been saved."
        buttons={[{ text: "OK", onPress: handleCloseSuccessModal }]}
      />
      {/* Duplicate name alert modal */}

      <CustomModal
        visible={isDuplicateModalVisible}
        onClose={() => setIsDuplicateModalVisible(false)}
        title="Duplicate Name"
        content="All players must have different names."
        buttons={[
          { text: "OK", onPress: () => setIsDuplicateModalVisible(false) },
        ]}
      />

      {/* Start Adventure Warning Modal */}
      <CustomModal
        visible={isStartAdventureModalVisible}
        onClose={() => setIsStartAdventureModalVisible(false)}
        title="Missing Names"
        content="Enter names for each player or default names will be used"
        buttons={[
          { text: "OK", onPress: () => setIsStartAdventureModalVisible(false) },
        ]}
      />

      {/* Start Adventure Button */}
      {startButtonVisible && (
        <TouchableOpacity
          style={playerNameStyles.startGameButton}
          onPress={handleStartAdventure}
        >
          <Text style={playerNameStyles.startGameButtonText}>
            Start Adventure 🚀
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GalleryPicker;
