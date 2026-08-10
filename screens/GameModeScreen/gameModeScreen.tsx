import React, { useEffect, useCallback } from "react";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { AppDispatch } from "@/redux/store";
import { AudioEngine } from "@/audio/audioEngine";
import { setIsGameReset } from "@/redux/reducers/playerReducer";
import { selectIsModalOpenUI } from "@/redux/reducers/uiStateSlice";

import {
  HeaderSection,
  UserProfilecard,
  GameModeList,
} from "@/components/GameModeScreen";

import UnlockedAwardModal from "@/modal/AwardModal";
import CharacterDrawer from "@/components/CharacterDrawer/CharacterDrawer";
import { useCharacterDrawer } from "@/hooks/useCharacterDrawer";
import { BotEngine } from "@/service/QuizBotEngine";
import { hp, wp } from "@/utils/responsive";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const isModalOpen = useSelector(selectIsModalOpenUI);

  const { message, avatarSource, shouldShow, dismiss, show } =
    useCharacterDrawer("home");

  // Re-show the character popup each time Home comes into focus (3s auto-hide)
  useFocusEffect(
    useCallback(() => {
      show();
    }, [show]),
  );
  
  useEffect(() => {
    BotEngine.prepareEngine(10);
    AudioEngine.stopAllExceptQuiz();

    const timer = setTimeout(() => dispatch(setIsGameReset(false)), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* 1. BACKGROUND */}
      <Image
        source={require("@/assets/images/bg/image.webp")}
        className="absolute h-full w-full"
        resizeMode="cover"
      />

      <BlurView intensity={25} tint="dark" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

      <LinearGradient
        colors={[
          "rgba(15, 23, 42, 0.4)",
          "transparent",
          "rgba(99, 102, 241, 0.15)",
          "rgba(0, 0, 0, 0.95)",
        ]}
        locations={[0, 0.25, 0.65, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* 3. CONTENT */}
      <View
        pointerEvents={isModalOpen ? "none" : "auto"}
        className="flex-1"
        style={{ paddingTop: insets.top, opacity: isModalOpen ? 0 : 1 }}
      >
        {/* Header Section */}
        <HeaderSection />

        {/* Profile Card */}
        <View className="px-5 mb-4">
            <UserProfilecard />
        </View>

        {/* Game List */}
        <View className="flex-1 pb-6">
            <GameModeList />
        </View>
      </View>

      <UnlockedAwardModal />

      {/* Character Drawer — overlay, auto-hides after 3s, re-shows on each Home focus */}
      {shouldShow && (
        <CharacterDrawer
          message={message}
          avatarSource={avatarSource}
          autoHide
          autoHideDurationMs={3000}
          onDismiss={dismiss}
        />
      )}
    </View>
  );
};

export default React.memo(GameModeScreen);
