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
import DynamicOverlayPopUp from "@/modal/DynamicPopUpModal";

const ConnectAndPlay: React.FC = () => {
  // Local State
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [isAwardModelOpen, setisAwardModelOpen] = useState(false);
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

  const {
    pickImage,
    loading: galleryLoading,
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  } = useGalleryPicker();

  useEffect(() => {
    setisAwardModelOpen(true);
    setTimeout(() => {
      setisAwardModelOpen(false);
    }, 5000);
  }, []);

  const options = [{ label: "Upload from Gallery", value: "gallery" }];
  const TREASURE_GIF = 12;
  const msg = "Play & win up to 1000 coins!";
  return (
    <>
      {isAwardModelOpen ? (
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[
            chorPoliceQuizstyles.overlay,
            chorPoliceQuizstyles.imageBackground,
          ]}
          resizeMode="cover"
        >
          <DynamicOverlayPopUp
            isPopUp={isAwardModelOpen}
            mediaId={TREASURE_GIF}
            mediaType="gif"
            closeVisibleDelay={3000}
            playerData={{
              message: msg,
            }}
          />
        </ImageBackground>
      ) : (
        <SafeAreaView style={globalstyles.container}>
          <StatusBar backgroundColor={"transparent"} />

          {/* Screen Header */}
          <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
            <Components.ScreenHeader
              name="Connect & Play!"
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
              {/* Option Header for Muting Sound */}
              <Components.OptionHeader />

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
                      Set a name, or a default will be used.
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
      )}
    </>
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
