import React, { useState, useCallback } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

import { useFocusEffect } from "expo-router";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

// Hooks
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";
import useGalleryPicker from "@/hooks/useGalleryPicker";

// Components
import { Components } from "@/imports/allComponentImports";

// Modals
import CustomAlertModal from "./modals/CustomAlertModal";
import ConfirmChangeModal from "./modals/ConfirmChangeModal";
import InfoAddMoreModal from "./modals/InfoAddMoreModal";
import CustomModal from "@/modal/CustomModal";

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
      <StatusBar hidden />

      <ImageBackground
        source={require("../../assets/images/bg/quiz.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* 🌑 Dark Overlay */}
        <View className="absolute inset-0 bg-black/40" />

        {/* 🔙 Back Button */}
        <Animated.View
          style={backAnimatedStyle}
          className="absolute top-10 left-4 z-50"
        >
          <Pressable
            onPressIn={() => (backScale.value = withSpring(0.9))}
            onPressOut={() => (backScale.value = withSpring(1))}
            onPress={() => router.back()}
            className="h-11 w-11 rounded-full bg-white/70 items-center justify-center"
          >
            <ArrowLeft size={22} color="grey" />
          </Pressable>
        </Animated.View>

        {/* ⏳ Loader */}
        <Components.LoadingIndicator
          loading={loading}
          message="Loading, please wait..."
        />

        {/* 🔥 Animated Header */}
        <Animated.View style={animatedStyle} className="mt-20 px-4">
          <Components.OptionHeader />
        </Animated.View>

        {/* 📜 Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          className="flex-1 px-4"
        >
          {/* Avatar Selection */}
          {selectedImages.length < 4 && (
            <Components.AvatarSelectionMemo
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
            <Components.ImageGrid
              selectedImages={selectedImages}
              handleImageSelect={handleImageSelect}
              imagesPerRow={3}
              gameMode="OFFLINE"
              isBot={false}
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
          <Components.SelectedImageGrid
            selectedImages={selectedImages}
            imageNames={imageNames}
            handleNameChange={handleNameChange}
            handleSelectedImageClick={handleSelectedImageClick}
          />

          {/* Start Button */}
          {selectedImages.length === 4 && (
            <Components.PlayernameActionButtons
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
