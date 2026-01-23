import React, { useState, useCallback } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { useFocusEffect } from "expo-router";


// Hooks
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";
import useGalleryPicker from "@/hooks/useGalleryPicker";


// Modals
import CustomAlertModal from "./modals/CustomAlertModal";
import ConfirmChangeModal from "./modals/ConfirmChangeModal";
import InfoAddMoreModal from "./modals/InfoAddMoreModal";
import CustomModal from "@/modal/CustomModal";
import { SafeBackButton } from "@/components/SafeBackButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import OptionHeader from "@/components/optionHeader";
import { AvatarSelectionMemo } from "@/components/playerNameScreen/toggleContainer";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { SelectedImageGrid } from "@/components/playerNameScreen/SelectedImageGrid";
import { PlayernameActionButtons } from "@/components/playerNameScreen/ActionButtons";

const PlayerNameScreen: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  /* -------------------- 🎬 Entrance Animation -------------------- */
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  useFocusEffect(
    useCallback(() => {
      translateY.value = 40;
      opacity.value = 0;

      translateY.value = withTiming(0, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });

      opacity.value = withTiming(1, { duration: 600 });
    }, []),
  );

  /* -------------------- 🔙 Back Button Animation -------------------- */
  const backScale = useSharedValue(1);

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));

  /* -------------------- 🧠 Business Logic -------------------- */
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
    loading,
    isModalVisible,
    modalTitle,
    modalContent,
    setIsModalVisible,
  } = useGalleryPicker();

  const options = [{ label: "Upload from Gallery", value: "gallery" }];

  return (
    <View className="flex-1">

      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* 🌑 Dark Overlay */}
        <View className="absolute inset-0 bg-black/40" />

        {/* 🔙 Back Button */}
        <SafeBackButton />


        {/* ⏳ Loader */}
        <LoadingIndicator
          loading={loading}
          message="Loading, please wait..."
        />

        {/* 🔥 Animated Header */}
        <Animated.View style={animatedStyle} className="mt-20 px-4">
          <OptionHeader />
        </Animated.View>

        {/* 📜 Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="flex-1 px-4"
        >
          {/* Avatar Selection */}
          {selectedImages.length < 4 && (
            <AvatarSelectionMemo
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              pickImage={pickImage}
              options={options}
            />
          )}

          {/* Instruction */}
          {selectedImages.length === 0 && (
            <View className="bg-white/30 rounded-xl py-3 px-4 my-4 items-center">
              <Text className="text-white text-base font-bold">
                Select 4 Images to Play
              </Text>
            </View>
          )}

          {/* Image Grid */}
          {selectedImages.length < 4 && (
            <ImageGrid
              selectedImages={selectedImages}
              handleImageSelect={handleImageSelect}
              imagesPerRow={3}
              gameMode="OFFLINE"
              
            />
          )}

          {/* Change Instruction */}
          {selectedImages.length === 4 && (
            <View className="bg-white/30 rounded-xl py-3 px-4 my-4 items-center">
              <Text className="text-white text-base font-bold">
                To change the image, click on it.
              </Text>
            </View>
          )}

          {/* Selected Images */}
          <SelectedImageGrid
            selectedImages={selectedImages}
            imageNames={imageNames}
            handleNameChange={handleNameChange}
            handleSelectedImageClick={handleSelectedImageClick}
          />

          {/* Start Button */}
          {selectedImages.length === 4 && (
            <PlayernameActionButtons
              handleStartAdventure={handleStartAdventure}
              disabled={isButtonDisabled}
            />
          )}
        </ScrollView>
      </ImageBackground>

      {/* 🪟 Modals */}
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
    </View>
  );
};

export default React.memo(PlayerNameScreen);
