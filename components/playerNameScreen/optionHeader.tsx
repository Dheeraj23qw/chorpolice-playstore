import React, { useState } from "react";
import { TouchableOpacity, View, Share } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { styles } from "./_css/optionbarcss";
import * as Application from "expo-application"; // Import the expo-application package

// Assuming your custom modal component is imported here
import CustomRatingModal from "@/modal/RatingModal";

interface IonicOptions {
  isMuted: boolean;
  setIsMuted: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const OptionHeader = React.memo(({ isMuted, setIsMuted }: IonicOptions) => {
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal
  };

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setModalVisible((prevState) => !prevState); // Toggle modal visibility
  };

  // Function to share the app link along with app metadata and app icon
  const handleShare = async () => {
    try {
      const androidPackageName = 'com.dheeraj_kumar_yadav.chorpolice'; // Replace with your app's package name
      const appStoreLink = `https://play.google.com/store/apps/details?id=${androidPackageName}`;

      // Get app metadata
      const appName = Application.applicationName;
      const appVersion = Application.nativeApplicationVersion;
      const appBuildVersion = Application.nativeBuildVersion;

      // Your uploaded app icon URL
      const appIconUrl = 'https://cdn-icons-png.flaticon.com/512/3616/3616049.png'; // Replace with the URL of your app icon

      // Prepare the message with app metadata, link, and app icon
      const message = `Check out this awesome app, ${appName}! 🎉\nVersion: ${appVersion} (Build ${appBuildVersion})\nDownload it now: ${appStoreLink}\n\nApp Icon: ${appIconUrl}`;

      // Directly share the app link via the share dialog
      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Error sharing app", error);
    }
  };

  return (
    <View style={styles.headerButtonsContainer}>
      {/* Settings Button */}
      <TouchableOpacity style={styles.headerButton}>
        <Ionicons name="settings" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Mute/Unmute Button */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => setIsMuted((prev) => !prev)} // Toggle mute state
      >
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={24}
          color="#FFF"
        />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
        <Ionicons name="share-social" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Star Rate Button that Triggers the Rating Modal */}
      <TouchableOpacity style={styles.headerButton} onPress={toggleModal}>
        <MaterialIcons name="star-rate" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Custom Rating Modal for Rating and Comment */}
      <CustomRatingModal
        visible={modalVisible}
        onClose={handleCloseModal}
        title="Enjoying the App?"
      />
    </View>
  );
});

// Exporting the memoized component
export default OptionHeader;
