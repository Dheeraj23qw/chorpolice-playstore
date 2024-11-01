import React, { useState } from "react";
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
import { useRouter } from "expo-router";

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

const BotScreen: React.FC = () => {
  // Local State
  const [isMuted, setIsMuted] = useState(false); // For toggling sound mute
  const [selectedOption, setSelectedOption] = useState<string | null>(null); // For avatar selection

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
    loading,
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  } = useGalleryPicker();

  const options = [
    { label: "Upload from Gallery", value: "gallery"},  
    { label: "Choose your Avatar", value: "predefined" },
  ];
  

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
            {/* Avatar Selection */}
            <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
              choose Bots avatar
            </Text>
            {/* Loading Indicator */}
            <Components.LoadingIndicator
              loading={loading}
              message="Loading, please wait..."
            />
            {/* Avatar Selection */}
            <Components.AvatarSelectionMemo
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              pickImage={pickImage}
              options={options} // Pass the dynamic options array
            />
            {/* Image Grid for Selected Images */}
            <Components.ImageGrid
              selectedImages={selectedImages}
              handleImageSelect={handleImageSelect}
              imagesPerRow={12}
              type="bots-offline"
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
      />

      <InfoAddMoreModal
        visible={infoAddMoreVisible}
        onClose={closeInfoAddMoreModal}
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
export default React.memo(BotScreen);
