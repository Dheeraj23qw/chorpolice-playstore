import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
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
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

const BotScreen: React.FC = () => {
  // Local State
  const [isMuted, setIsMuted] = useState(false); // For toggling sound mute
  const [selectedOption, setSelectedOption] = useState<string | null>(
    null
  );
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
  const options = [
    { label: "Choose Computer Avatar", value: "Bots-Avatar" },
    { label: "Choose your Avatar", value: "player-Avatar" },
  ];

  // Add "Upload from Gallery" option if an avatar option is selected
  const additionalOption = selectedOption
    ? [{ label: "Upload from Gallery", value: "gallery" }]
    : [];

  // Check if the image grid should be shown
  const showImageGrid = selectedOption && additionalOption.length > 0;

  // Function to handle option change and show loading
  const handleOptionChange = (option: string | null) => {
    setLoading(true); 
    setSelectedOption(option); 
    setTimeout(() => {
      setLoading(false); 
    }, 1000); 
  };

  // const playerData = useSelector((state: RootState) => state.player);

  // useEffect(() => {
  //   const botIds = playerData.playerNames
  //     .filter(({ isBot }) => isBot) // Filter to get only the bot players
  //     .map(({ id }) => id); // Map to extract only the IDs
  
  //   console.log(botIds); // This will log the IDs of the bots
  // }, [playerData]);

  return (
    <SafeAreaView style={globalstyles.container}>
      {/* Screen Header */}
      <View style={{ flex: 1, paddingTop: responsiveHeight(4) }}>
        <Components.ScreenHeader name="Play With Bots!" showBackButton={true} />
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
            {/* Avatar Selection Component */}
            <Components.AvatarSelectionMemo
              selectedOption={selectedOption}
              setSelectedOption={handleOptionChange} // Pass the handler for option change
              pickImage={pickImage}
              options={[...options, ...additionalOption]} // Combine options here
            />
            {/* Loading Indicator */}
            {loading && (
              <Components.LoadingIndicator
                loading={true}
                message="Loading, please wait..."
              />
            )}
            {/* Conditional Image Grid for Avatar Selection */}
            {!loading &&
              showImageGrid && ( // Don't show grid while loading
                <>
                  {selectedOption === "Bots-Avatar" ? (
                    <Components.ImageGrid
                      selectedImages={selectedImages}
                      handleImageSelect={handleImageSelect}
                      imagesPerRow={36}
                      isBot={true}
                      gameMode="OFFLINE_WITH_BOTS"
                    />
                  ) : selectedOption === "player-Avatar" ? (
                    <>
                      <Components.ImageGrid
                        selectedImages={selectedImages}
                        handleImageSelect={handleImageSelect}
                        imagesPerRow={36}
                        isBot={false}
                        gameMode="OFFLINE_WITH_BOTS"
                        selectedOption={selectedOption}
                      />
                    </>
                  ) : null}
                </>
              )}

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

// Exporting Component with React Memo for Optimization
export default React.memo(BotScreen);
