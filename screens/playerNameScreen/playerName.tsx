import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { globalstyles } from "@/styles/global";
import { chorPoliceQuizstyles } from "../chorPoliceQuizScreen/quizStyle";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
// Custom Hooks
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";
import useGalleryPicker from "@/hooks/useGalleryPicker";

// Import all components from a single file for modularity
import { Components } from "@/imports/allComponentImports";

// Import Modals
import CustomAlertModal from "./modals/CustomAlertModal";
import ConfirmChangeModal from "./modals/ConfirmChangeModal";
import InfoAddMoreModal from "./modals/InfoAddMoreModal";
import CustomModal from "@/modal/CustomModal";

const PlayerNameScreen: React.FC = () => {
  // Local State
  const [isMuted, setIsMuted] = useState(false); // For toggling sound mute
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // For avatar selection

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
    loading,
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  } = useGalleryPicker();

  const options = [{ label: "Upload from Gallery", value: "gallery" }];

  return (
    <SafeAreaView style={globalstyles.container}>
      {/* Screen Header */}
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <Components.ScreenHeader
          name="Play with Friends!"
          showBackButton={true}
        />
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
          {/* Loading Indicator */}
          <Components.LoadingIndicator
            loading={loading}
            message="Loading, please wait..."
          />
          {/* Option Header for Muting Sound */}
          <Components.OptionHeader isMuted={isMuted} setIsMuted={setIsMuted} />

          {/* Scroll View for Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Avatar Selection */}
            {selectedImages.length <4 &&

            <Components.AvatarSelectionMemo
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              pickImage={pickImage}
              options={options} // Pass the dynamic options array
            />
            }

{selectedImages.length === 0 && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Select 4 Images to Play
                </Text>
              </View>
            )}
            {/* Image Grid for Selected Images */}
            {selectedImages.length < 4 &&
            <Components.ImageGrid
              selectedImages={selectedImages}
              handleImageSelect={handleImageSelect}
              imagesPerRow={10}
              gameMode="OFFLINE"
              isBot={false}
            />}
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
            />

            {/* Action Buttons for Starting Adventure - Show only if 4 images selected */}
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
export default React.memo(PlayerNameScreen);

const styles = StyleSheet.create({
  instructionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: responsiveWidth(2), // Responsive padding
    borderRadius: responsiveWidth(2), // Responsive border radius
    marginVertical: responsiveHeight(2), // Responsive vertical margin
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveHeight(1.5), // Responsive vertical padding
  },
  instructionText: {
    fontSize: responsiveFontSize(2.5), // Responsive font size
    color: "#fff", // Modern white color
    textAlign: "center",
    fontFamily: "outfit-bold", // Premium and clean font
  },
});
