import React, { useState, useCallback } from "react";
import { ScrollView, View, Pressable, Alert } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Hooks & Logic
import { usePlayerNameScreen } from "@/hooks/usePlayerNameScreen";

// Components
import { SafeBackButton } from "@/components/SafeBackButton";
import OptionHeader from "@/components/optionHeader";
import { AvatarSelectionMemo } from "@/components/playerNameScreen/toggleContainer";
import { ImageGrid } from "@/components/playerNameScreen/ImageGrid";
import { SelectedImageGrid } from "@/components/playerNameScreen/SelectedImageGrid";
import { PlayernameActionButtons } from "@/components/playerNameScreen/ActionButtons";
import RoundSelector from "../RoundSelector";
import { Text } from "@/components/Text";
import useGalleryPicker from "@/hooks/useGalleryPicker";
import { hp, wp } from "@/utils/responsive";
import InfoTooltip from "@/components/InfoTooltip";

const PlayerNameScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showRoundTable, setShowRoundTable] = useState(false);

  const {
    selectedImages,
    imageNames,
    handleImageSelect,
    handleNameChange,
    handleStartAdventure,
    isButtonDisabled,
    handleSelectedImageClick,
  } = usePlayerNameScreen();

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
  const { pickImage } = useGalleryPicker();

  return (
    <View className="flex-1 bg-[#020205]">
      {/* 🔮 Background Glows */}
      <View className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <View className="absolute -right-20 bottom-40 h-72 w-72 rounded-full bg-blue-600/5 blur-3xl" />

      {/* 🔙 Fixed Back Button */}

      <SafeBackButton />

      {/* 📍 FIXED HEADER AREA */}
      <View
        style={{ paddingTop: insets.top + 70 }}
        className="z-40 bg-[#020205]/80 px-6 pb-4 backdrop-blur-md"
      >
        <Animated.View style={animatedStyle}>
          <OptionHeader />
          <View className="mt-2 h-[1.5px] w-12 rounded-full bg-indigo-500" />
        </Animated.View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        className="flex-1 px-6"
      >
        {/* --- 1. AVATAR SELECTION PHASE --- */}
        {selectedImages.length < 4 && (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <View className="mb-6 rounded-[32px] border border-white/10 bg-white/[0.03] p-4 shadow-2xl">
              <AvatarSelectionMemo
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                pickImage={pickImage}
                options={[{ label: "Upload from Gallery", value: "gallery" }]}
              />
            </View>

            <View
              style={{
                top: insets.top + hp(25),
                right: wp(1),
              }}
              className="absolute z-50"
            >
              <InfoTooltip text="play with 4 real players using their own images — or choose and upload any character you like from your gallery. " />
            </View>
            <View className="mb-4 items-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3">
              <Text className="font-main-bold text-xs uppercase tracking-wider text-indigo-200">
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
        <View className="mb-6 mt-4 rounded-[32px] border border-white/5 bg-white/[0.02] p-1">
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
              className="flex-row items-center justify-between rounded-3xl border border-white/10 bg-white/[0.05] p-5"
            >
              <View className="flex-row items-center">
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
                  <Ionicons name="timer-outline" size={20} color="#818cf8" />
                </View>
                <View>
                  <Text className="font-main-bold text-[10px] uppercase tracking-widest text-white/40">
                    Game Duration
                  </Text>
                  <Text className="font-main-bold text-base text-white">
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
            <Text className="mt-4 text-center text-[8px] uppercase tracking-[4px] text-white/20">
              Ready for Fun
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

export default React.memo(PlayerNameScreen);
