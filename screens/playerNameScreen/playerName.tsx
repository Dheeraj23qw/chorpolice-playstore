import React, { useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { globalstyles } from "@/styles/global";
import ScreenHeader from "@/components/_screenHeader";
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { SelectedImageGrid } from "@/components/playerNameScreen/SelectedImageGrid";
import CustomModal from "@/modal/CustomModal";
import { PlayernameActionButtons } from "@/components/playerNameScreen/ActionButtons";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import useGalleryPicker from "@/hooks/useGalleryPicker";

const PlayerNameScreen: React.FC = () => {
  const [useGallery, setUseGallery] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // State for sound mute

  const {
    selectedImages,
    imageNames,
    handleImageSelect,
    handleNameChange,
    handleStartAdventure,
    closeAlertModal,
    handleAlertConfirm,
    modalVisible,
    confirmChangeVisible,
    alertMessage,
    setConfirmChangeVisible,
    closeInfoAddMoreModal,
    handleSelectedImageClick,
    infoAddMoreVisible,
  } = usePlayerNameScreen();

  const { pickImage } = useGalleryPicker();

  // Animation for the options
  const [fadeAnim] = useState(new Animated.Value(0));

  // Function to trigger animation
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    fadeIn(); // Trigger animation on component mount
  }, []);

  return (
    <SafeAreaView style={globalstyles.container}>
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <ScreenHeader name="Choose Your Avatars!" showBackButton={false} />
      </View>

      <View style={[globalstyles.Container2, { flex: 10 }]}>
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[
            chorPoliceQuizstyles.overlay,
            chorPoliceQuizstyles.imageBackground,
          ]}
          resizeMode="cover"
        >
          <View style={styles.headerButtonsContainer}>
            {/* Settings Button */}
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="settings" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsMuted((prev) => !prev)} // Toggle sound mute
            >
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-social" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Rate Us Button */}
            <TouchableOpacity style={styles.headerButton}>
              <MaterialIcons name="star-rate" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Challenge Button */}
            <TouchableOpacity style={styles.headerButton}>
              <MaterialIcons name="group" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Avatar Selection Toggle */}
            <View style={styles.toggleContainer}>
              <Animated.View style={{ opacity: fadeAnim }}>
                <TouchableOpacity
                  onPress={() => {
                    setUseGallery(false);
                    fadeIn();
                  }}
                  style={[
                    styles.optionButton,
                    !useGallery && styles.selectedOption,
                  ]}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={!useGallery ? "#FFD700" : "#ccc"} // Gold tick
                  />
                  <Text style={styles.optionText}>Choose from Avatars</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setUseGallery(true);
                    fadeIn(); // Re-trigger animation
                    pickImage(); // Call pickImage here
                  }}
                  style={[
                    styles.optionButton,
                    useGallery && styles.selectedOption,
                  ]}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={useGallery ? "#FFD700" : "#ccc"} // Gold tick
                  />
                  <Text style={styles.optionText}>Upload from Gallery</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <ImageGrid
              selectedImages={selectedImages}
              handleImageSelect={handleImageSelect}
            />

            <SelectedImageGrid
              selectedImages={selectedImages}
              imageNames={imageNames}
              handleNameChange={handleNameChange}
              handleSelectedImageClick={handleSelectedImageClick}
            />

            {selectedImages.length === 4 && (
              <PlayernameActionButtons
                handleStartAdventure={handleStartAdventure}
              />
            )}
          </ScrollView>
        </ImageBackground>
      </View>

      {/* Alert Modals */}
      <CustomModal
        visible={modalVisible}
        onClose={closeAlertModal}
        title="Alert"
        content={alertMessage}
        buttons={[{ text: "OK", onPress: closeAlertModal }]}
      />

      <CustomModal
        visible={confirmChangeVisible}
        onClose={() => setConfirmChangeVisible(false)}
        title="Confirm Change"
        content="Do you want to change this superhero?"
        buttons={[
          { text: "No", onPress: () => setConfirmChangeVisible(false) },
          { text: "Yes", onPress: handleAlertConfirm },
        ]}
      />

      {/* CustomModal for "Add 3 more avatars to play" message */}
      <CustomModal
        visible={infoAddMoreVisible} // Show modal when infoAddMoreModalVisible is true
        onClose={closeInfoAddMoreModal} // Close modal on button press
        title="Info"
        content="Add 3 more avatars to play"
        buttons={[{ text: "OK", onPress: closeInfoAddMoreModal }]}
      />
    </SafeAreaView>
  );
};

export default React.memo(PlayerNameScreen);

// Styles
const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 10,
    marginTop: 20,
    zIndex: 1, // Ensure buttons are above other content
  },
  headerButton: {
    padding: 10,
    marginLeft: 25,
    borderRadius: 20,
    backgroundColor: "rgba(155, 89, 182, 0.7)", // Semi-transparent purple
    elevation: 5, // Shadow effect
  },
  toggleContainer: {
    flexDirection: "column", // Keep column layout
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginVertical: 12, // Spacing between options
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "#7653ec",
    width: "80%", // Button width
    elevation: 5, // Shadow effect
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 5, // Shadow radius
  },
  selectedOption: {
    backgroundColor: "#6244c3",
    borderColor: "#FFD700", // Gold border for selected option
    elevation: 10, // Increase elevation for selected option
  },
  optionText: {
    marginHorizontal: 9,
    fontSize: 18, // Increased font size
    color: "#FFF",
    fontFamily: "outfit-bold",
  },
});
