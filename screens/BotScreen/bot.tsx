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
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useRouter } from "expo-router";
const BotScreen: React.FC = () => {
  const [useGallery, setUseGallery] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // State for sound mute
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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


  const router = useRouter();


  return (
    <SafeAreaView style={globalstyles.container}>
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <View style={styles.headerContainer}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()} // Navigate back on press
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Header Title */}
          <Text style={styles.headerTitle}>Play with Bots!</Text>
        </View>
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
                    if (selectedOption === "gallery") {
                      setSelectedOption(null); // Deselect if already selected
                    } else {
                      setSelectedOption("gallery"); // Select 'Upload from Gallery'
                      pickImage(); // Call pickImage here
                    }
                    setUseGallery(true);
                    fadeIn(); // Re-trigger animation
                  }}
                  style={[
                    styles.optionButton,
                    selectedOption === "gallery" && styles.selectedOption,
                  ]}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={selectedOption === "gallery" ? "#FFD700" : "#ccc"}
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

export default React.memo(BotScreen);

// Styles
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsiveHeight(2),
   
  },
  backButton: {
    padding: responsiveHeight(1),
    marginRight: responsiveHeight(0.4),
  },
  headerTitle: {
    fontSize: responsiveFontSize(4),
    color: "#FFF",
    fontFamily: "outfit-bold",
    flex: 1, // Take remaining space
    textAlign: "center", // Center the title
  },
  headerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: responsiveHeight(2),
    marginTop: responsiveHeight(2),
    zIndex: 1,
  },
  headerButton: {
    padding: responsiveHeight(1),
    marginLeft: responsiveHeight(3),
    borderRadius: responsiveHeight(3),
    backgroundColor: "rgba(155, 89, 182, 0.7)",
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: responsiveHeight(1),
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: responsiveHeight(2.5),
    marginVertical: responsiveHeight(1.5),
    borderRadius: responsiveHeight(3),
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "#7653ec",
    width: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  selectedOption: {
    backgroundColor: "#6244c3",
    borderColor: "#FFD700",
    elevation: 10,
  },
  optionText: {
    marginHorizontal: responsiveHeight(1),
    fontSize: responsiveFontSize(2),
    color: "#FFF",
    fontFamily: "outfit-bold",
  },
});
