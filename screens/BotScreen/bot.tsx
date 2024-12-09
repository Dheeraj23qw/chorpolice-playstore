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
import { AvatarWithBackgroundMemo } from "@/components/horizontalBoxSlider";

const BotScreen: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAvatarOption, setSelectedAvatarOption] = useState<
    string | null
  >(null);

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
    botCount,
    humanCount,
  } = usePlayerNameScreen();

  // Custom Hook - Gallery Picker
  const {
    pickImage,
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  } = useGalleryPicker();

  const avatarOptions = [
    {
      label: "Robot",
      value: "robot",
      backgroundImage: require("@/assets/modalImages/image.png"),
    },
    {
      label: "Human",
      value: "human",
      backgroundImage: require("@/assets/images/chorsipahi/kid9.png"),
    },
  ];

  // Handle option change with loading indicator
  const handleOptionChange = (option: string | null) => {
    setLoading(true);
    setSelectedAvatarOption(option);
    setTimeout(() => setLoading(false), 500);
  };
  return (
    <SafeAreaView style={globalstyles.container}>
      <StatusBar backgroundColor="transparent" />
      {/* Screen Header */}
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <Components.ScreenHeader name="Play With Bots!" showBackButton />
      </View>

      {/* Main Content */}
      <View style={[globalstyles.Container2, { flex: 10 }]}>
        <ImageBackground
          source={require("../../assets/images/bg/quiz.png")}
          style={[
            chorPoliceQuizstyles.overlay,
            chorPoliceQuizstyles.imageBackground,
          ]}
          resizeMode="cover"
        >
          {selectedImages.length === 0 && <Components.OptionHeader />}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Avatar Selection */}

            {!loading && selectedImages.length < 4 && (
              <Components.AvatarSelectionMemo
                selectedOption={selectedOption}
                setSelectedOption={handleOptionChange}
                pickImage={pickImage}
                options={[{ label: "Upload from Gallery", value: "gallery" }]}
              />
            )}
            {/* Loading Indicator */}
            {loading && (
              <Components.LoadingIndicator
                loading
                message="Loading, please wait..."
              />
            )}

            {selectedImages.length === 4 && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  To change the image, click on it.
                </Text>
              </View>
            )}

            {/* Avatar Options */}
            {!loading && selectedImages.length < 4 && (
              <AvatarWithBackgroundMemo
                selectedOption={selectedAvatarOption}
                setSelectedOption={setSelectedAvatarOption}
                options={avatarOptions}
                title={
                  selectedAvatarOption === "robot"
                    ? "Select Bot's Avatar"
                    : "Select Your Player's Avatar"
                }
                botCount={botCount}
                humanCount={humanCount}
              />
            )}

            {/* Conditional Image Grid for Avatar Selection */}
            {!loading && selectedAvatarOption && selectedImages.length < 4 && (
              <>
                {selectedAvatarOption === "robot" ? (
                  <Components.ImageGrid
                    selectedImages={selectedImages}
                    handleImageSelect={handleImageSelect}
                    imagesPerRow={15}
                    isBot={true}
                    gameMode="OFFLINE_WITH_BOTS"
                  />
                ) : (
                  <Components.ImageGrid
                    selectedImages={selectedImages}
                    handleImageSelect={handleImageSelect}
                    imagesPerRow={15}
                    isBot={false}
                    gameMode="OFFLINE_WITH_BOTS"
                    selectedOption={selectedOption}
                  />
                )}
              </>
            )}

            {/* Selected Image Grid */}
            {!loading && (
              <Components.SelectedImageGrid
                selectedImages={selectedImages}
                imageNames={imageNames}
                handleNameChange={handleNameChange}
                handleSelectedImageClick={handleSelectedImageClick}
              />
            )}

            {/* Start Adventure Button */}
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
        buttons={[{ text: "OK", onPress: () => setIsModalVisible(false) }]}
      />
    </SafeAreaView>
  );
};

export default React.memo(BotScreen);

const styles = StyleSheet.create({
  instructionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 5,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 100,
  },
  instructionText: {
    fontSize: 20, // Slightly larger for better readability
    color: "#fff", // A softer white for a modern look
    textAlign: "center",
    fontFamily: "outfit-bold", // Using a premium and clean font
  },
});
