import React, { useEffect } from "react";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import HeaderSection from "@/components/GameModeScreen/HeaderSection";
import GameModeList from "@/components/GameModeScreen/GameModeList";
import UserProfilecard from "@/components/GameModeScreen/UserProfilecard";

import { AudioEngine } from "@/audio/audioEngine";
import { AppDispatch, RootState } from "@/redux/store";
import { setIsGameReset } from "@/redux/reducers/playerReducer";
import UnlockedAwardModal from "@/modal/AchievmentModal";
import { hasUnclaimedAwards } from "@/features/awards/awardsSlice";

const GameModeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();

  const isGameReset = useSelector(
    (state: RootState) => state.player.isGameReset,
  );

  useEffect(() => {
    try {
      AudioEngine.stopAllExceptQuiz();
      const timer = setTimeout(() => {
        dispatch(setIsGameReset(false));
      }, 500);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error in GameModeScreen effect:", err);
    }
  }, [dispatch, isGameReset]);

  const unclaimedExists = useSelector(hasUnclaimedAwards);

  return (
    <View className="flex-1 bg-black">
      {/* 🔥 BACKGROUND IMAGE ONLY */}
      <Image
        source={require("@/assets/images/bg/image.png")}
        resizeMode="cover"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      />

      {/* 🔥 VERY SUBTLE DARK OVERLAY (important for readability) */}
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          opacity: 0.4, // 🔥 tweak (0.3–0.5 best)
        }}
      />

      {/* 🔥 OPTIONAL LIGHT GLOW (keep minimal) */}
      <View
        style={{
          position: "absolute",
          top: -100,
          left: -80,
          width: 250,
          height: 250,
          borderRadius: 250,
          backgroundColor: "#7C5CFF",
          opacity: 0.06,
        }}
      />

      {/* 🔥 CONTENT */}
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <HeaderSection />
        <UserProfilecard />
        <GameModeList />
      </View>

      {unclaimedExists && <UnlockedAwardModal />}
    </View>
  );
};

export default React.memo(GameModeScreen);
