import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import { responsiveHeight } from "react-native-responsive-dimensions";

// Custom Hooks
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";
import useGalleryPicker from "@/hooks/useGalleryPicker";

// Import all components from a single file for modularity
import { Components } from "@/imports/allComponentImports";

// Import Modals
import CustomAlertModal from "../playerNameScreen/modals/CustomAlertModal";
import ConfirmChangeModal from "../playerNameScreen/modals/ConfirmChangeModal";
import InfoAddMoreModal from "../playerNameScreen/modals/InfoAddMoreModal";
import CustomModal from "@/modal/CustomModal";

const ConnectAndPlay: React.FC = () => {
  // Local State
  const [isMuted, setIsMuted] = useState(false); // For toggling sound mute
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // New loading state

  // Custom Hook - Player Name Screen
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
    isButtonDisabled,
  } = usePlayerNameScreen();

  // Custom Hook - Gallery Picker
  const {
    pickImage,
    loading: galleryLoading, // To manage loading from gallery picker
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  } = useGalleryPicker();

  // Initial options
  const options = [{ label: "Upload from Gallery", value: "gallery" }];

  // Check if the image grid should be shown
  const showImageGrid = selectedOption;

  // Function to handle option change and show loading
  const handleOptionChange = (option: string | null) => {
    setLoading(true);
    setSelectedOption(option);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={globalstyles.container}>
      <StatusBar backgroundColor={"transparent"}/>

      {/* Screen Header */}
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <Components.ScreenHeader name="Connect & Play!" showBackButton={true} />
      </View>

      {/* Main Content Container */}
      <View style={[globalstyles.Container2, { flex: 10 }]}>
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[
            chorPoliceQuizstyles.overlay,
            chorPoliceQuizstyles.imageBackground,
          ]}
          resizeMode="cover"
        >
          {/* Option Header for Muting Sound */}
          <Components.OptionHeader isMuted={isMuted} setIsMuted={setIsMuted} />

          {/* Scroll View for Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {selectedImages.length === 0 && (
              <Components.AvatarSelectionMemo
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                pickImage={pickImage}
                options={options} // Pass the dynamic options array
              />
            )}

            {/* Instruction Text */}
            {selectedImages.length === 0 && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Select an Image to Play
                </Text>
              </View>
            )}

            {/* Loading Indicator */}
            <Components.LoadingIndicator
              loading={loading}
              message="Loading, please wait..."
            />

            {/* Image Grid for Selected Images */}
            {selectedImages.length === 0 && (
              <Components.ImageGrid
                selectedImages={selectedImages}
                handleImageSelect={handleImageSelect}
                imagesPerRow={10}
                gameMode="ONLINE_WITH_BOTS"
                isBot={false}
              />
            )}
            {selectedImages.length === 4 && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  To change the image, click on it.
                </Text>
              </View>
            )}
            {/* Selected Image Grid with Name Change and Click Handling */}
            <Components.SelectedImageGrid
              selectedImages={selectedImages}
              imageNames={imageNames}
              handleNameChange={handleNameChange}
              handleSelectedImageClick={handleSelectedImageClick}
              gameMode="ONLINE_WITH_BOTS"
            />

            {selectedImages.length === 4 && (
              <Components.PlayernameActionButtons
                handleStartAdventure={handleStartAdventure}
                disabled={isButtonDisabled}
              />
            )}
          </ScrollView>
        </ImageBackground>
      </View>

      {/* Modals */}
      <CustomAlertModal
        visible={modalVisible}
        onClose={closeAlertModal}
        alertMessage={alertMessage}
      />

      <ConfirmChangeModal
        visible={confirmChangeVisible}
        onClose={() => setConfirmChangeVisible(false)}
        onConfirm={handleAlertConfirm}
        content={alertMessage}
      />

      <InfoAddMoreModal
        visible={infoAddMoreVisible}
        onClose={closeInfoAddMoreModal}
        content={alertMessage}
      />

      <CustomModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title={modalTitle}
        content={modalContent}
        buttons={[{ text: "OK", onPress: () => setIsModalVisible(false) }]} // Button to close modal
      />
    </SafeAreaView>
  );
};

// Exporting Component with React Memo for Optimization
export default React.memo(ConnectAndPlay);

 const styles = StyleSheet.create({
  instructionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 5,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  instructionText: {
    fontSize: 20, // Slightly larger for better readability
    color: "#fff", // A softer white for a modern look
    textAlign: "center",
    fontFamily: "outfit-bold", // Using a premium and clean font
  },
});
