import React, { useState, useCallback } from "react";
import { ScrollView, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Hooks & Logic
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";
import useGalleryPicker from "@/hooks/useGalleryPicker";

// Components
import { SafeBackButton } from "@/components/SafeBackButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import OptionHeader from "@/components/optionHeader";
import { AvatarSelectionMemo } from "@/components/playerNameScreen/toggleContainer";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { SelectedImageGrid } from "@/components/playerNameScreen/SelectedImageGrid";
import { PlayernameActionButtons } from "@/components/playerNameScreen/ActionButtons";
import RoundSelector from "../RoundSelector";
import { Text } from "@/components/Text";

const PlayerNameScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();
  const [showRoundTable, setShowRoundTable] = useState(false);

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
    }, [translateY, opacity]),
  );

  const {
    selectedImages,
    imageNames,
    handleImageSelect,
    handleNameChange,
    handleStartAdventure,
    isButtonDisabled,
    handleSelectedImageClick,
  } = usePlayerNameScreen();

  const { pickImage, loading: pickerLoading } = useGalleryPicker();

  return (
    <View className="flex-1 bg-[#020205]">
      {/* 🔮 Background Glows */}
      <View className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <View className="absolute bottom-40 -right-20 w-72 h-72 rounded-full bg-blue-600/5 blur-3xl" />

      <SafeBackButton />

      {/* 📍 FIXED HEADER AREA */}
      <View
        style={{ paddingTop: insets.top + 70 }}
        className="px-6 pb-4 bg-[#020205]/80 backdrop-blur-md z-40"
      >
        <Animated.View style={animatedStyle}>
          <OptionHeader />
          <View className="h-[1.5px] w-12 bg-indigo-500 mt-2 rounded-full" />
        </Animated.View>
      </View>

      <LoadingIndicator loading={pickerLoading} message="Processing Image..." />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        className="flex-1 px-6"
      >
        {/* --- 1. AVATAR SELECTION PHASE --- */}
        {selectedImages.length < 4 && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <View className="bg-white/[0.03] border border-white/10 rounded-[32px] p-4 mb-6 shadow-2xl">
              <AvatarSelectionMemo
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                pickImage={pickImage}
                options={[{ label: "Upload from Gallery", value: "gallery" }]}
              />
            </View>

            <View className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl py-4 px-5 mb-6">
              {/* Swapped font-bold for font-main-bold */}
              <Text className="text-indigo-200 font-main-bold text-xs uppercase tracking-widest mb-2">
                Best Experience
              </Text>

              <Text className="text-white/80 font-main-md text-sm leading-5">
                For the most fun experience, play with 4 real players 👑
                {"\n\n"}
                Upload your own images and use your real names to make the game
                more exciting and personal!
              </Text>
            </View>
            <View className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl py-3 px-4 mb-4 items-center">
              <Text className="text-indigo-200 font-main-bold uppercase tracking-wider text-xs">
                Select {4 - selectedImages.length} Players to Begin
              </Text>
            </View>
            <ImageGrid
              selectedImages={selectedImages}
              handleImageSelect={handleImageSelect}
              imagesPerRow={3}
              gameMode="OFFLINE"
            />
          </Animated.View>
        )}

        {/* --- 2. SELECTED PLAYERS LIST --- */}
        <View className="bg-white/[0.02] border border-white/5 rounded-[32px] p-1 mt-4 mb-6">
          <SelectedImageGrid
            selectedImages={selectedImages}
            imageNames={imageNames}
            handleNameChange={handleNameChange}
            handleSelectedImageClick={handleSelectedImageClick}
          />
        </View>

        {/* --- 3. ROUND CONFIGURATION SECTION --- */}
        {selectedImages.length === 4 && (
          <View className="mb-6">
            <Pressable
              onPress={() => setShowRoundTable(!showRoundTable)}
              className="flex-row items-center justify-between bg-white/[0.05] border border-white/10 p-5 rounded-3xl"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-indigo-500/20 rounded-full items-center justify-center mr-4">
                  <Ionicons name="timer-outline" size={20} color="#818cf8" />
                </View>
                <View>
                  <Text className="text-white/40 text-[10px] uppercase font-main-bold tracking-widest">
                    Game Duration
                  </Text>
                  {/* Swapped font-black for font-main-bold italic */}
                  <Text className="text-white text-base font-main-bold ">
                    {showRoundTable ? "CLOSE SELECTOR" : "SELECT ROUNDS"}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={showRoundTable ? "chevron-up" : "chevron-down"}
                size={24}
                color="white"
              />
            </Pressable>

            {showRoundTable && (
              <Animated.View entering={FadeIn.duration(400)} className="mt-4">
                <RoundSelector />
              </Animated.View>
            )}
          </View>
        )}

        {/* --- 4. FINAL START ACTION --- */}
        {selectedImages.length === 4 && !showRoundTable && (
          <Animated.View entering={FadeIn} className="mt-4">
            <PlayernameActionButtons
              handleStartAdventure={handleStartAdventure}
              disabled={isButtonDisabled}
            />
            <Text className="text-white/20 text-center mt-4 uppercase font-main-bold tracking-[4px] text-[8px]">
              Ready for Fun
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

export default React.memo(PlayerNameScreen);